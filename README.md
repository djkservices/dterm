# dTerm

A developer workspace for macOS built with Electron. Combines a terminal emulator, file browser, code editor, code runner, FTP client, SSH, snippets, process manager, 40+ built-in tools, and more in a single window with a VS Code-style activity bar layout.

## Features

### Terminal
- **Full Terminal Emulation**: Powered by xterm.js with node-pty
- **Multiple Tabs**: Open multiple terminal sessions (zsh, bash, node, python)
- **Split Panes**: Split terminals vertically or horizontally
- **256 Color Support**: Full xterm-256color support
- **Search**: Search through terminal output
- **CWD Tracking**: Tab labels update with current working directory
- **Resize Support**: Terminal automatically resizes to fit

### File Browser
- **Breadcrumb Navigation**: Clickable path segments for quick directory jumping
- **Directory Navigation**: Browse local and remote file systems
- **File Operations**: Create, rename, delete, copy, cut, paste files and folders
- **Drag & Drop**: Drag files from Finder to upload (FTP) or copy (local)
- **Right-Click Context Menu**: Open, preview, copy, cut, paste, rename, delete, pin to favorites, compare files
- **Bookmarks & Favorites**: Pin folders and files for quick access
- **Recent Folders/Files**: Quick access to recent locations
- **Git Integration**: Shows current branch and file status indicators (M/A/D/?)
- **Hidden Files**: Toggle visibility of hidden files
- **Image Preview on Hover**: Thumbnail tooltips for image files

### Code Editor
- **Monaco Editor**: Same editor that powers VS Code
- **Syntax Highlighting**: Automatic language detection for 30+ languages
- **File Icons**: Colored language icons in editor tabs (JS, TS, PY, HTML, etc.)
- **Multiple Tabs**: Edit multiple files simultaneously
- **Minimap Toggle**: Optional code minimap (configurable in settings)
- **Markdown Preview**: Live preview for `.md` files with GitHub-style rendering
- **Side-by-Side Diff**: Compare two files using Monaco's diff editor
- **Edit Local & Remote Files**: Open and edit files from local or FTP file browser

### Code Runner
- **Run Current File**: One-click execution with auto-detected language runtime
- **20+ Languages**: Node.js, TypeScript, Python, Go, Rust, Swift, C/C++, Java, Ruby, PHP, Lua, Perl, R, and more
- **Project Task Detection**: Auto-detects npm scripts, Makefile targets, Cargo/Go/Docker/pip tasks
- **Quick Run**: Custom command input with autocomplete suggestions
- **Output in Terminal**: All commands run in new interactive terminal tabs

### Snippets Manager
- **Save Code Snippets**: Create reusable code snippets with name and language
- **Insert at Cursor**: Click to insert snippet into the active editor
- **Edit & Delete**: Manage snippets inline
- **Persistent Storage**: Saved to disk

### Process & Port Manager
- **Listening Ports**: View all TCP ports in use
- **Process List**: Searchable list of running processes
- **Kill Processes**: Terminate processes by PID
- **Refresh**: Manual refresh of process/port data

### FTP Client
- **FTP Connections**: Connect to FTP servers with saved connections
- **Remote Browsing**: Navigate remote directories in the file browser
- **File Operations**: Upload, download, delete, create files/folders on remote servers
- **Saved Connections**: Store FTP credentials in app data
- **Drag & Drop Upload**: Drag files from Finder directly into FTP file browser

### SSH Terminal
- **Quick SSH**: SSH button in terminal tab bar
- **Connection Dialog**: Enter host, port, username
- **Saved Connections**: Save and reuse SSH connections
- **Full Terminal**: SSH sessions run in interactive terminal tabs

### Built-in Tools (40+)

**Network:**
Ping, Traceroute, DNS Lookup, Reverse DNS, Port Scanner, IP Info, Whois, MAC Lookup, Subnet Calculator, Ping Monitor, Uptime Monitor, Blacklist Check

**SSL / Security:**
SSL Checker, SSL Expiry, Security Headers, Password Generator, Password Checker, Hash Generator

**Web / SEO:**
SEO Analyzer, Page Speed, Broken Links, HTTP Headers, Open Graph, Meta Tags, Robots.txt, Sitemap Generator, Domain Expiry

**Developer:**
API Tester, JSON Formatter, Code Beautifier, Regex Tester, Base64 Encoder/Decoder, JWT Decoder, Cron Parser, UUID Generator, Timestamp Converter

**System:**
Environment Variable Viewer (searchable, click to copy)

**Utilities:**
Markdown Preview, Lorem Ipsum Generator, QR Generator, Color Picker

### Notes
- **Monaco Editor**: Full markdown editor with syntax highlighting
- **Persistent Storage**: Notes saved in app data directory
- **Auto-Save**: Notes are automatically saved on change

### AI Chat
- **Built-in AI Access**: ChatGPT, Copilot, Claude, Gemini, Poe, Perplexity
- **Side Panel**: Use AI chat alongside your work

### Mini Browser
- **Built-in Browser**: Browse the web without leaving the app
- **Navigation Controls**: Back, forward, refresh, home
- **Configurable Home Page**: Set default URL in settings

### Workspaces
- **Save Workspace**: Save current state (folder, open files, terminals, panel layout)
- **Load Workspace**: Restore a saved workspace
- **Title Bar Indicator**: Shows active workspace name

### Status Bar
- Git branch, current directory, file language, encoding, cursor position, terminal count

### Cloud Sync
- **Account System**: Register and login to sync data
- **Push/Pull**: Sync notes, FTP connections, and settings across devices

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘S | Save file |
| ⌘T | New terminal |
| ⌘W | Close tab |
| ⌘R | Run current file |
| ⌘B | Toggle sidebar |
| ⌘⇧F | Focus mode |
| ⌘\ | Split terminal vertical |
| ⌘⇧\ | Split terminal horizontal |
| ⌘⇧P | Command palette |
| ⌘F | Find in file / terminal |
| ⌘G | Go to line |
| ⌘, | Settings |
| ⌘/ | Keyboard shortcuts |

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

1. Launch dTerm
2. **Activity Bar** (left): Switch between Files, Browser, Git, Search, Terminal, Runner, Snippets, Processes, Notes, Tools, AI, FTP
3. **Center Panel**: Code editor (top) and terminal (bottom) — terminal-first layout
4. **Status Bar** (bottom): File info, git branch, cursor position
5. **Command Palette** (⌘⇧P): Quick access to all features

## Tech Stack

- Electron 28
- xterm.js for terminal emulation
- node-pty for pseudo-terminal
- Monaco Editor for code editing
- basic-ftp for FTP connections
- HTML/CSS/JavaScript for UI
