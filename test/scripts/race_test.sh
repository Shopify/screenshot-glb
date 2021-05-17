#!/bin/bash

mkdir -p test/screenshots

for file in test/fixtures/*.glb
do
  echo "Screenshotting $file"
  node src/cli.js -i "$file" -o "$file".jpeg -f image/jpeg -q 1.00 -v -t 30000
  mv "$file".jpeg test/screenshots/.
done
