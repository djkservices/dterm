#!/bin/bash

cd "/Users/hdd/Documents/Mac - Projects/dTerm"
nohup npm start > /dev/null 2>&1 &

osascript -e 'tell application "Terminal" to close (every window whose name contains "Start dTerm")' &
exit 0
