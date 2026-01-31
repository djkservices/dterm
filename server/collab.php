<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['action'])) {
    echo json_encode(['error' => 'Invalid request']);
    exit;
}

$action = $input['action'];
$collabDir = __DIR__ . '/collab_rooms';
if (!is_dir($collabDir)) {
    mkdir($collabDir, 0755, true);
}

function generateCode() {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $code = '';
    for ($i = 0; $i < 6; $i++) {
        $code .= $chars[random_int(0, strlen($chars) - 1)];
    }
    return $code;
}

function loadRoom($code) {
    global $collabDir;
    $file = $collabDir . '/' . preg_replace('/[^A-Z0-9]/', '', $code) . '.json';
    if (!file_exists($file)) return null;
    $data = json_decode(file_get_contents($file), true);
    // Clean stale users (no heartbeat in 30s)
    if (isset($data['users'])) {
        $now = time();
        foreach ($data['users'] as $uid => $user) {
            if ($now - ($user['lastSeen'] ?? 0) > 30) {
                unset($data['users'][$uid]);
            }
        }
    }
    return $data;
}

function saveRoom($code, $data) {
    global $collabDir;
    $file = $collabDir . '/' . preg_replace('/[^A-Z0-9]/', '', $code) . '.json';
    file_put_contents($file, json_encode($data), LOCK_EX);
}

function deleteRoom($code) {
    global $collabDir;
    $file = $collabDir . '/' . preg_replace('/[^A-Z0-9]/', '', $code) . '.json';
    if (file_exists($file)) unlink($file);
}

// Clean up rooms older than 24 hours
function cleanupOldRooms() {
    global $collabDir;
    $files = glob($collabDir . '/*.json');
    $now = time();
    foreach ($files as $file) {
        $data = json_decode(file_get_contents($file), true);
        if (!$data || ($now - ($data['created'] ?? 0) > 86400)) {
            unlink($file);
        }
    }
}

switch ($action) {
    case 'create_room':
        $username = $input['username'] ?? 'Anonymous';
        $filename = $input['filename'] ?? 'untitled.txt';
        $content = $input['content'] ?? '';
        $language = $input['language'] ?? 'plaintext';

        // Generate unique code
        $code = generateCode();
        $attempts = 0;
        while (loadRoom($code) !== null && $attempts < 10) {
            $code = generateCode();
            $attempts++;
        }

        $userId = bin2hex(random_bytes(8));
        $room = [
            'code' => $code,
            'created' => time(),
            'owner' => $userId,
            'filename' => $filename,
            'language' => $language,
            'content' => $content,
            'version' => 1,
            'lastEdit' => time(),
            'lastEditBy' => $username,
            'users' => [
                $userId => [
                    'name' => $username,
                    'lastSeen' => time(),
                    'cursor' => null,
                    'color' => '#' . substr(md5($userId), 0, 6)
                ]
            ]
        ];

        saveRoom($code, $room);
        echo json_encode([
            'success' => true,
            'code' => $code,
            'userId' => $userId,
            'version' => 1
        ]);
        break;

    case 'join_room':
        $code = strtoupper($input['code'] ?? '');
        $username = $input['username'] ?? 'Anonymous';
        $room = loadRoom($code);
        if (!$room) {
            echo json_encode(['error' => 'Room not found']);
            exit;
        }

        $userId = bin2hex(random_bytes(8));
        // Assign a distinct color
        $colors = ['#e06c75','#98c379','#d19a66','#61afef','#c678dd','#56b6c2','#be5046','#e5c07b'];
        $usedColors = array_column($room['users'], 'color');
        $color = '#61afef';
        foreach ($colors as $c) {
            if (!in_array($c, $usedColors)) { $color = $c; break; }
        }

        $room['users'][$userId] = [
            'name' => $username,
            'lastSeen' => time(),
            'cursor' => null,
            'color' => $color
        ];

        saveRoom($code, $room);
        echo json_encode([
            'success' => true,
            'code' => $code,
            'userId' => $userId,
            'filename' => $room['filename'],
            'language' => $room['language'],
            'content' => $room['content'],
            'version' => $room['version'],
            'users' => $room['users']
        ]);
        break;

    case 'leave_room':
        $code = strtoupper($input['code'] ?? '');
        $userId = $input['userId'] ?? '';
        $room = loadRoom($code);
        if ($room) {
            unset($room['users'][$userId]);
            if (empty($room['users'])) {
                deleteRoom($code);
            } else {
                saveRoom($code, $room);
            }
        }
        echo json_encode(['success' => true]);
        break;

    case 'push_changes':
        $code = strtoupper($input['code'] ?? '');
        $userId = $input['userId'] ?? '';
        $content = $input['content'] ?? '';
        $version = $input['version'] ?? 0;
        $cursor = $input['cursor'] ?? null;
        $username = $input['username'] ?? '';

        $room = loadRoom($code);
        if (!$room) {
            echo json_encode(['error' => 'Room not found']);
            exit;
        }

        // Update user heartbeat and cursor
        if (isset($room['users'][$userId])) {
            $room['users'][$userId]['lastSeen'] = time();
            $room['users'][$userId]['cursor'] = $cursor;
        }

        // Only update content if version matches (simple optimistic locking)
        if ($content !== '' && $version >= $room['version']) {
            $room['content'] = $content;
            $room['version'] = $room['version'] + 1;
            $room['lastEdit'] = time();
            $room['lastEditBy'] = $username;
        }

        saveRoom($code, $room);
        echo json_encode([
            'success' => true,
            'version' => $room['version'],
            'content' => $room['content'],
            'users' => $room['users']
        ]);
        break;

    case 'pull_changes':
        $code = strtoupper($input['code'] ?? '');
        $userId = $input['userId'] ?? '';
        $version = $input['version'] ?? 0;

        $room = loadRoom($code);
        if (!$room) {
            echo json_encode(['error' => 'Room not found']);
            exit;
        }

        // Update heartbeat
        if (isset($room['users'][$userId])) {
            $room['users'][$userId]['lastSeen'] = time();
        }
        saveRoom($code, $room);

        $hasChanges = $room['version'] > $version;
        $response = [
            'success' => true,
            'version' => $room['version'],
            'hasChanges' => $hasChanges,
            'users' => $room['users'],
            'lastEditBy' => $room['lastEditBy'] ?? '',
            'filename' => $room['filename']
        ];
        if ($hasChanges) {
            $response['content'] = $room['content'];
        }
        echo json_encode($response);
        break;

    default:
        echo json_encode(['error' => 'Unknown action']);
}

// Cleanup old rooms occasionally (1% chance per request)
if (random_int(1, 100) === 1) {
    cleanupOldRooms();
}
