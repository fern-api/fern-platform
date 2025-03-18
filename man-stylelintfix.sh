#!/bin/bash

# Ensure paths.txt exists
if [ ! -f paths.txt ]; then
  echo "paths.txt file not found!"
  exit 1
fi

# Read each line in paths.txt
while IFS= read -r path; do
  # Check if the path is not empty
  if [ -n "$path" ]; then
    echo "Running stylelint on $path..."
    pnpm stylelint "$path" --allow-empty-input --max-warnings 0 --fix
  fi
done < paths.txt
