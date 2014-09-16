#!/bin/bash
# Start a local non-caching http server

SCRIPT_DIR="$(dirname "$0")"

cd $SCRIPT_DIR/..

python $SCRIPT_DIR/serve.py $1
