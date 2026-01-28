const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const pty = require('node-pty');

let mainWindow = null;
const terminals = new Map();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');

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

// Terminal handlers
ipcMain.handle('terminal:create', (_, id, shell) => {
  const defaultShell = '/bin/zsh';

  const ptyProcess = pty.spawn(shell || defaultShell, ['--no-rcs'], {
    name: 'xterm-256color',
    cols: 80,
    rows: 24,
    cwd: app.getPath('home'),
    env: {
      ...process.env,
      TERM: 'xterm-256color',
      ZDOTDIR: '/tmp/dterm-empty',
      PS1: '%~ ',
      PROMPT: '%~ '
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

ipcMain.handle('ftp:connect', async (_, host, port, user, password) => {
  ftpClient = new ftp.Client();
  ftpClient.ftp.verbose = false;
  await ftpClient.access({
    host: host,
    port: port,
    user: user || 'anonymous',
    password: password || 'anonymous@',
    secure: false
  });
  return true;
});

ipcMain.handle('ftp:list', async (_, remotePath) => {
  if (!ftpClient) throw new Error('Not connected');
  const list = await ftpClient.list(remotePath);
  return list.map(item => ({
    name: item.name,
    isDirectory: item.isDirectory,
    size: item.size
  }));
});

ipcMain.handle('ftp:disconnect', async () => {
  if (ftpClient) {
    ftpClient.close();
    ftpClient = null;
  }
  return true;
});
