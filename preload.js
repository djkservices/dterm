const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  fs: {
    readDir: (path) => ipcRenderer.invoke('fs:readDir', path),
    readFile: (path) => ipcRenderer.invoke('fs:readFile', path),
    writeFile: (path, content) => ipcRenderer.invoke('fs:writeFile', path, content),
    delete: (path) => ipcRenderer.invoke('fs:delete', path),
    mkdir: (path) => ipcRenderer.invoke('fs:mkdir', path),
    rename: (oldPath, newPath) => ipcRenderer.invoke('fs:rename', oldPath, newPath),
    copy: (src, dest) => ipcRenderer.invoke('fs:copy', src, dest),
    getHome: () => ipcRenderer.invoke('fs:getHome')
  },
  ftp: {
    connect: (host, port, user, pass) => ipcRenderer.invoke('ftp:connect', host, port, user, pass),
    list: (path) => ipcRenderer.invoke('ftp:list', path),
    readFile: (path) => ipcRenderer.invoke('ftp:readFile', path),
    writeFile: (path, content) => ipcRenderer.invoke('ftp:writeFile', path, content),
    delete: (path, isDirectory) => ipcRenderer.invoke('ftp:delete', path, isDirectory),
    mkdir: (path) => ipcRenderer.invoke('ftp:mkdir', path),
    downloadToLocal: (remotePath, localPath) => ipcRenderer.invoke('ftp:downloadToLocal', remotePath, localPath),
    uploadFromLocal: (localPath, remotePath) => ipcRenderer.invoke('ftp:uploadFromLocal', localPath, remotePath),
    disconnect: () => ipcRenderer.invoke('ftp:disconnect')
  },
  tools: {
    exec: (command) => ipcRenderer.invoke('tools:exec', command)
  },
  ftpConnections: {
    load: () => ipcRenderer.invoke('ftpConnections:load'),
    save: (connections) => ipcRenderer.invoke('ftpConnections:save', connections)
  },
  notes: {
    load: () => ipcRenderer.invoke('notes:load'),
    save: (notes) => ipcRenderer.invoke('notes:save', notes)
  },
  dialog: {
    openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
    saveFile: (defaultName) => ipcRenderer.invoke('dialog:saveFile', defaultName),
    openFile: () => ipcRenderer.invoke('dialog:openFile')
  },
  terminal: {
    create: (id, shell) => ipcRenderer.invoke('terminal:create', id, shell),
    write: (id, data) => ipcRenderer.invoke('terminal:write', id, data),
    resize: (id, cols, rows) => ipcRenderer.invoke('terminal:resize', id, cols, rows),
    kill: (id) => ipcRenderer.invoke('terminal:kill', id),
    onData: (callback) => {
      const listener = (_, id, data) => callback(id, data);
      ipcRenderer.on('terminal:data', listener);
      return () => ipcRenderer.removeListener('terminal:data', listener);
    },
    onExit: (callback) => {
      const listener = (_, id, code) => callback(id, code);
      ipcRenderer.on('terminal:exit', listener);
      return () => ipcRenderer.removeListener('terminal:exit', listener);
    }
  },
  git: {
    getBranch: (path) => ipcRenderer.invoke('git:getBranch', path),
    getStatus: (path) => ipcRenderer.invoke('git:getStatus', path)
  }
});
