# dTerm

A powerful developer terminal and workspace app for macOS built with Electron. Combines a terminal emulator, file browser, code editor, FTP client, and notes in a single window.

## Features

### Terminal
- **Full Terminal Emulation**: Powered by xterm.js with node-pty
- **Multiple Tabs**: Open multiple terminal sessions
- **256 Color Support**: Full xterm-256color support
- **Zsh Shell**: Uses system zsh with clean environment
- **Resize Support**: Terminal automatically resizes to fit

### File Browser
- **Directory Navigation**: Browse local file system
- **File Operations**: Create, rename, delete files and folders
- **Copy/Paste**: Copy and move files between directories
- **Hidden Files**: Toggle visibility of hidden files
- **Quick Open**: Open folder picker dialog
- **File Sizes**: Display file sizes in directory listing

### Code Editor
- **Monaco Editor**: Same editor that powers VS Code
- **Syntax Highlighting**: Automatic language detection
- **Edit Local Files**: Open and edit files from the file browser
- **Save Changes**: Save edited files back to disk

### FTP Client
- **FTP Connections**: Connect to FTP servers
- **Remote Browsing**: Navigate remote directories
- **Anonymous Support**: Connect with anonymous credentials

### Notes
- **Quick Notes**: Built-in notepad for quick notes
- **Persistent Storage**: Notes saved in app data directory
- **Auto-Save**: Notes are automatically saved

## Requirements

- macOS 11.0 or later
- Node.js 18+ (for development)

## Development

```bash
# Install dependencies
npm install

# Run in development
npm start

# Build for production
npm run build
```

## Building

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to create distributable
4. Find the built app in the `dist` folder

## Usage

1. Launch dTerm
2. Use the sidebar to switch between:
   - **Terminal**: Command line interface
   - **Files**: Local file browser
   - **Editor**: Code editor
   - **FTP**: Remote FTP connections
   - **Notes**: Quick notes

## Keyboard Shortcuts

- Standard terminal shortcuts work in terminal view
- Monaco editor shortcuts work in editor view

## Tech Stack

- Electron 28
- xterm.js for terminal emulation
- node-pty for pseudo-terminal
- Monaco Editor for code editing
- basic-ftp for FTP connections
- HTML/CSS/JavaScript for UI
