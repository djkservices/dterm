# My Network Tools

A developer workspace and network toolkit for macOS built with Electron. Combines a terminal emulator, file browser, code editor, FTP client, 40+ built-in network/developer tools, and notes in a single window.

## Features

### Terminal
- **Full Terminal Emulation**: Powered by xterm.js with node-pty
- **Multiple Tabs**: Open multiple terminal sessions (zsh, bash, node, python)
- **256 Color Support**: Full xterm-256color support
- **Search**: Search through terminal output
- **Resize Support**: Terminal automatically resizes to fit

### File Browser
- **Directory Navigation**: Browse local and remote file systems
- **File Operations**: Create, rename, delete, copy, cut, paste files and folders
- **Drag & Drop**: Drag files from Finder to upload (FTP) or copy (local)
- **Right-Click Context Menu**: Full context menu with all operations
- **Bookmarks**: Bookmark frequently used folders
- **Recent Folders/Files**: Quick access to recent locations
- **Git Integration**: Shows current branch and file status
- **Hidden Files**: Toggle visibility of hidden files

### Code Editor
- **Monaco Editor**: Same editor that powers VS Code
- **Syntax Highlighting**: Automatic language detection
- **Multiple Tabs**: Edit multiple files simultaneously
- **Edit Local & Remote Files**: Open and edit files from local or FTP file browser
- **Save Changes**: Save to local disk or remote FTP server

### FTP Client
- **FTP Connections**: Connect to FTP servers with saved connections
- **Remote Browsing**: Navigate remote directories in the file browser
- **File Operations**: Upload, download, delete, create files/folders on remote servers
- **Saved Connections**: Store FTP credentials in app data (file-based, not localStorage)
- **Drag & Drop Upload**: Drag files from Finder directly into FTP file browser

### Built-in Tools (40)

**Network:**
Ping, Traceroute, DNS Lookup, Reverse DNS, Port Scanner, IP Info, Whois, MAC Lookup, Subnet Calculator, Ping Monitor, Uptime Monitor, Blacklist Check

**SSL / Security:**
SSL Checker, SSL Expiry, Security Headers, Password Generator, Password Checker, Hash Generator

**Web / SEO:**
SEO Analyzer, Page Speed, Broken Links, HTTP Headers, Open Graph, Meta Tags, Robots.txt, Sitemap Generator, Domain Expiry

**Developer:**
API Tester, JSON Formatter, Code Beautifier, Regex Tester, Base64 Encoder/Decoder, JWT Decoder, Cron Parser, UUID Generator, Timestamp Converter

**Utilities:**
Markdown Preview, Lorem Ipsum Generator, QR Generator, Color Picker

### Notes
- **Quick Notes**: Built-in notepad
- **Persistent Storage**: Notes saved in app data directory
- **Auto-Save**: Notes are automatically saved

### AI Chat
- **Built-in AI Access**: ChatGPT, Copilot, Claude, Gemini, Poe, Perplexity
- **Side Panel**: Use AI chat alongside your work

### Mini Browser
- **Built-in Browser**: Browse the web without leaving the app
- **Navigation Controls**: Back, forward, refresh, home

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
3. Double-click `build-app.command` or run `npm run build`
4. Find the built app in the `dist` folder

## Usage

1. Launch My Network Tools
2. **Left Panel**: File browser with mini browser below
3. **Center Panel**: Code editor (top) and terminal (bottom)
4. **Right Panel**: Notes, Tools, or AI chat tabs with FTP connection at the bottom

## Keyboard Shortcuts

- Standard terminal shortcuts work in terminal view
- Monaco editor shortcuts work in editor view
- Command palette available for quick actions

## Tech Stack

- Electron 28
- xterm.js for terminal emulation
- node-pty for pseudo-terminal
- Monaco Editor for code editing
- basic-ftp for FTP connections
- HTML/CSS/JavaScript for UI
