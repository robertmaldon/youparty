#!/bin/bash
# Find duplicate vids in the playlists
cd "$(dirname "$0")"/..
cat playlists.js | grep vid | sort | uniq -d
