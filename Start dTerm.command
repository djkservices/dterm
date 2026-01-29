#!/bin/bash
cd "/Users/hdd/Documents/Mac - Projects/dTerm"
nohup npm start > /dev/null 2>&1 &
disown
sleep 0.5
osascript -e 'tell application "Terminal" to quit' 2>/dev/null &
exit 0
