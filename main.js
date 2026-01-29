const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const pty = require('node-pty');
const https = require('https');

let mainWindow = null;
const terminals = new Map();

// Window state persistence
const windowStatePath = path.join(app.getPath('userData'), 'window-state.json');

function loadWindowState() {
  try {
    const data = fs.readFileSync(windowStatePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { width: 1400, height: 900 };
  }
}

function saveWindowState() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const bounds = mainWindow.getBounds();
  const state = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    isMaximized: mainWindow.isMaximized()
  };
  try {
    fs.writeFileSync(windowStatePath, JSON.stringify(state, null, 2));
  } catch (e) {}
}

function createWindow() {
  const windowState = loadWindowState();

  mainWindow = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (windowState.isMaximized) {
    mainWindow.maximize();
  }

  mainWindow.loadFile('index.html');

  // Save window state on resize/move
  mainWindow.on('resize', saveWindowState);
  mainWindow.on('move', saveWindowState);
  mainWindow.on('close', saveWindowState);

  mainWindow.on('closed', () => {
    // Kill all terminals when window closes
    terminals.forEach(ptyProcess => {
      try { ptyProcess.kill(); } catch (e) {}
    });
    terminals.clear();
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// File System handlers
ipcMain.handle('fs:readDir', async (_, dirPath) => {
  const items = await fs.promises.readdir(dirPath, { withFileTypes: true });
  const results = [];
  for (const item of items) {
    const itemPath = path.join(dirPath, item.name);
    let size = 0;
    try {
      if (item.isFile()) {
        const stat = await fs.promises.stat(itemPath);
        size = stat.size;
      }
    } catch (e) {}
    results.push({
      name: item.name,
      path: itemPath,
      isDirectory: item.isDirectory(),
      isFile: item.isFile(),
      size: size
    });
  }
  return results;
});

ipcMain.handle('fs:readFile', async (_, filePath) => {
  return await fs.promises.readFile(filePath, 'utf-8');
});

ipcMain.handle('fs:writeFile', async (_, filePath, content) => {
  await fs.promises.writeFile(filePath, content, 'utf-8');
  return true;
});

ipcMain.handle('fs:delete', async (_, filePath) => {
  const stat = await fs.promises.stat(filePath);
  if (stat.isDirectory()) {
    await fs.promises.rm(filePath, { recursive: true });
  } else {
    await fs.promises.unlink(filePath);
  }
  return true;
});

ipcMain.handle('fs:mkdir', async (_, dirPath) => {
  await fs.promises.mkdir(dirPath, { recursive: true });
  return true;
});

ipcMain.handle('fs:rename', async (_, oldPath, newPath) => {
  await fs.promises.rename(oldPath, newPath);
  return true;
});

ipcMain.handle('fs:copy', async (_, src, dest) => {
  const stat = await fs.promises.stat(src);
  if (stat.isDirectory()) {
    await fs.promises.cp(src, dest, { recursive: true });
  } else {
    await fs.promises.copyFile(src, dest);
  }
  return true;
});

ipcMain.handle('fs:getHome', () => app.getPath('home'));

// FTP connections storage
const ftpConnectionsPath = path.join(app.getPath('userData'), 'ftp-connections.json');

ipcMain.handle('ftpConnections:load', async () => {
  try {
    const data = await fs.promises.readFile(ftpConnectionsPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
});

ipcMain.handle('ftpConnections:save', async (_, connections) => {
  await fs.promises.writeFile(ftpConnectionsPath, JSON.stringify(connections, null, 2));
  return true;
});

// Notes storage
const notesPath = path.join(app.getPath('userData'), 'notes.json');

ipcMain.handle('notes:load', async () => {
  try {
    const data = await fs.promises.readFile(notesPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { content: '' };
  }
});

ipcMain.handle('notes:save', async (_, notes) => {
  await fs.promises.writeFile(notesPath, JSON.stringify(notes, null, 2));
  return true;
});

ipcMain.handle('dialog:openFolder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('dialog:saveFile', async (_, defaultName) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName
  });
  return result.canceled ? null : result.filePath;
});

ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile']
  });
  return result.canceled ? null : result.filePaths[0];
});

// Terminal handlers
ipcMain.handle('terminal:create', (_, id, shell) => {
  const defaultShell = '/bin/zsh';

  const ptyProcess = pty.spawn(shell || defaultShell, [], {
    name: 'xterm-256color',
    cols: 80,
    rows: 24,
    cwd: app.getPath('home'),
    env: {
      ...process.env,
      TERM: 'xterm-256color'
    }
  });

  terminals.set(id, ptyProcess);

  ptyProcess.onData(data => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('terminal:data', id, data);
    }
  });

  ptyProcess.onExit(({ exitCode }) => {
    terminals.delete(id);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('terminal:exit', id, exitCode);
    }
  });

  return { id, pid: ptyProcess.pid };
});

ipcMain.handle('terminal:write', (_, id, data) => {
  const ptyProcess = terminals.get(id);
  if (ptyProcess) ptyProcess.write(data);
});

ipcMain.handle('terminal:resize', (_, id, cols, rows) => {
  const ptyProcess = terminals.get(id);
  if (ptyProcess) ptyProcess.resize(cols, rows);
});

ipcMain.handle('terminal:kill', (_, id) => {
  const ptyProcess = terminals.get(id);
  if (ptyProcess) {
    try { ptyProcess.kill(); } catch (e) {}
    terminals.delete(id);
  }
});

app.on('before-quit', () => {
  terminals.forEach(ptyProcess => {
    try { ptyProcess.kill(); } catch (e) {}
  });
  terminals.clear();
});

// FTP handlers
const ftp = require('basic-ftp');
let ftpClient = null;

// Mutex to serialize FTP operations (basic-ftp only supports one at a time)
let ftpQueue = Promise.resolve();
function ftpOp(fn) {
  ftpQueue = ftpQueue.then(fn, fn);
  return ftpQueue;
}

ipcMain.handle('ftp:connect', async (_, host, port, user, password) => {
  if (ftpClient) {
    try { ftpClient.close(); } catch (e) {}
  }
  ftpClient = new ftp.Client();
  ftpClient.ftp.verbose = false;
  await ftpClient.access({
    host: host,
    port: port,
    user: user || 'anonymous',
    password: password || 'anonymous@',
    secure: false
  });
  ftpQueue = Promise.resolve();
  return true;
});

ipcMain.handle('ftp:list', async (_, remotePath) => {
  if (!ftpClient) throw new Error('Not connected');
  return ftpOp(async () => {
    const list = await ftpClient.list(remotePath);
    return list.map(item => ({
      name: item.name,
      isDirectory: item.isDirectory,
      size: item.size
    }));
  });
});

ipcMain.handle('ftp:readFile', async (_, remotePath) => {
  if (!ftpClient) throw new Error('Not connected');
  return ftpOp(async () => {
    const { Writable } = require('stream');
    let content = '';
    const writable = new Writable({
      write(chunk, encoding, callback) {
        content += chunk.toString();
        callback();
      }
    });
    await ftpClient.downloadTo(writable, remotePath);
    return content;
  });
});

ipcMain.handle('ftp:writeFile', async (_, remotePath, content) => {
  if (!ftpClient) throw new Error('Not connected');
  return ftpOp(async () => {
    const { Readable } = require('stream');
    const readable = Readable.from([content]);
    await ftpClient.uploadFrom(readable, remotePath);
    return true;
  });
});

ipcMain.handle('ftp:delete', async (_, remotePath, isDirectory) => {
  if (!ftpClient) throw new Error('Not connected');
  return ftpOp(async () => {
    if (isDirectory) {
      await ftpClient.removeDir(remotePath);
    } else {
      await ftpClient.remove(remotePath);
    }
    return true;
  });
});

ipcMain.handle('ftp:mkdir', async (_, remotePath) => {
  if (!ftpClient) throw new Error('Not connected');
  return ftpOp(async () => {
    await ftpClient.ensureDir(remotePath);
    return true;
  });
});

ipcMain.handle('ftp:downloadToLocal', async (_, remotePath, localPath) => {
  if (!ftpClient) throw new Error('Not connected');
  return ftpOp(async () => {
    await ftpClient.downloadTo(localPath, remotePath);
    return true;
  });
});

ipcMain.handle('ftp:uploadFromLocal', async (_, localPath, remotePath) => {
  if (!ftpClient) throw new Error('Not connected');
  return ftpOp(async () => {
    await ftpClient.uploadFrom(localPath, remotePath);
    return true;
  });
});

ipcMain.handle('ftp:disconnect', async () => {
  if (ftpClient) {
    ftpClient.close();
    ftpClient = null;
  }
  ftpQueue = Promise.resolve();
  return true;
});

// Git handlers
const { execSync } = require('child_process');

ipcMain.handle('git:getBranch', async (_, dirPath) => {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: dirPath,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
    return branch;
  } catch {
    return null;
  }
});

// Tools - shell command execution
const { exec } = require('child_process');

ipcMain.handle('tools:exec', async (_, command) => {
  // Whitelist allowed commands for security
  const allowed = ['ping', 'traceroute', 'dig', 'nslookup', 'whois', 'curl', 'openssl', 'nc', 'echo', 'md5'];
  // Check all commands in pipes
  const parts = command.split(/\|/).map(s => s.trim().replace(/^[^a-zA-Z]*/, '').split(/\s+/)[0]);
  const allAllowed = parts.every(cmd => allowed.includes(cmd));
  if (!allAllowed) {
    return { error: `Command not allowed: ${parts.find(cmd => !allowed.includes(cmd))}` };
  }
  return new Promise((resolve) => {
    exec(command, { timeout: 30000, maxBuffer: 1024 * 1024, encoding: 'utf-8', shell: '/bin/bash' }, (error, stdout, stderr) => {
      resolve({ stdout: stdout || '', stderr: stderr || '', error: error ? error.message : null });
    });
  });
});

// Cloud sync
const CLOUD_API = 'https://mynetworktools.com/dterm/api';
const cloudAccountPath = path.join(app.getPath('userData'), 'cloud-account.json');

function cloudRequest(endpoint, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const url = new URL(`${CLOUD_API}/${endpoint}`);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch { resolve({ error: 'Invalid response' }); }
      });
    });
    req.on('error', e => reject(e));
    req.write(data);
    req.end();
  });
}

function loadCloudAccount() {
  try {
    return JSON.parse(fs.readFileSync(cloudAccountPath, 'utf-8'));
  } catch { return null; }
}

function saveCloudAccount(account) {
  fs.writeFileSync(cloudAccountPath, JSON.stringify(account, null, 2));
}

function clearCloudAccount() {
  try { fs.unlinkSync(cloudAccountPath); } catch {}
}

ipcMain.handle('cloud:login', async (_, username, password) => {
  const result = await cloudRequest('auth.php', { action: 'login', username, password });
  if (result.success) {
    saveCloudAccount({ token: result.token, user: result.user });
  }
  return result;
});

ipcMain.handle('cloud:register', async (_, username, email, password) => {
  const result = await cloudRequest('auth.php', { action: 'register', username, email, password });
  if (result.success) {
    saveCloudAccount({ token: result.token, user: result.user });
  }
  return result;
});

ipcMain.handle('cloud:validate', async () => {
  const account = loadCloudAccount();
  if (!account) return { error: 'Not logged in' };
  const result = await cloudRequest('auth.php', { action: 'validate', token: account.token });
  return result;
});

ipcMain.handle('cloud:push', async (_, dataType, dataJson) => {
  const account = loadCloudAccount();
  if (!account) return { error: 'Not logged in' };
  return cloudRequest('sync.php', { action: 'push', data_type: dataType, data_json: dataJson, token: account.token });
});

ipcMain.handle('cloud:pullAll', async () => {
  const account = loadCloudAccount();
  if (!account) return { error: 'Not logged in' };
  return cloudRequest('sync.php', { action: 'pull_all', token: account.token });
});

ipcMain.handle('cloud:logout', async () => {
  clearCloudAccount();
  return { success: true };
});

ipcMain.handle('cloud:getAccount', async () => {
  return loadCloudAccount();
});

ipcMain.handle('cloud:getWelcome', async () => {
  const account = loadCloudAccount();
  const token = account ? account.token : null;
  try {
    return await cloudRequest('welcome.php', { token });
  } catch { return { error: 'Failed to fetch welcome message' }; }
});

ipcMain.handle('git:getStatus', async (_, dirPath) => {
  try {
    const status = execSync('git status --porcelain', {
      cwd: dirPath,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    const files = {};
    status.split('\n').forEach(line => {
      if (line.trim()) {
        const code = line.substring(0, 2);
        const file = line.substring(3);
        files[file] = code;
      }
    });
    return files;
  } catch {
    return null;
  }
});
