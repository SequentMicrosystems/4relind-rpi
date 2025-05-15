#!/bin/bash

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$script_dir"

NODE_RED_DIR="$HOME/.node-red"

if [ ! -d "$NODE_RED_DIR" ]; then
  echo "Node-RED directory not found at $NODE_RED_DIR"
  exit 1
fi

package_name=$(cat package.json | grep '"name"' | cut -d '"' -f 4)

echo "Updating $package_name..."

cd "$NODE_RED_DIR"

npm uninstall "$package_name" --save
npm install "$script_dir" --save

node-red-restart

echo "Updated and restarted Node-RED."