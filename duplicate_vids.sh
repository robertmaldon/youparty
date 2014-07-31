#!/bin/bash
# Find duplicate vids in the playlists
cat playlists.js | grep vid | sort | uniq -d
