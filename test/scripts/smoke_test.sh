#!/usr/bin/env bash

set -euo pipefail

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
work_dir=$(mktemp -d "${TMPDIR:-/tmp}/screenshot-glb-smoke.XXXXXX")
output_path="$work_dir/Astronaut.jpg"

cleanup() {
  rm -rf "$work_dir"
}
trap cleanup EXIT

node "$repo_root/dist/cli.js" \
  --input "$repo_root/test/fixtures/Astronaut.glb" \
  --output "$output_path" \
  --model_viewer_path "$repo_root/test/fixtures/model-viewer.js" \
  --image_format image/jpeg \
  --image_quality 1 \
  --timeout 30000 \
  --verbose \
  "$@"

node - "$output_path" <<'NODE'
const fs = require('fs');

const outputPath = process.argv[2];
const image = fs.readFileSync(outputPath);
const hasJpegHeader =
  image.length >= 3 &&
  image[0] === 0xff &&
  image[1] === 0xd8 &&
  image[2] === 0xff;
const hasJpegTrailer =
  image.length >= 2 &&
  image[image.length - 2] === 0xff &&
  image[image.length - 1] === 0xd9;

if (!hasJpegHeader || !hasJpegTrailer) {
  throw new Error(
    `GLB smoke test expected a complete JPEG at ${outputPath}, received ${image.length} bytes`,
  );
}

console.log(`✅ Astronaut.glb rendered to a valid ${image.length}-byte JPEG`);
NODE
