#!/usr/bin/env bash
# Idempotent thumbnail generator — skips files where thumbnail is newer than source.
# Output: gallery_photos/thumbnails/<same-filename>, 800px max width, quality 82, EXIF stripped.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"
SRC_DIR="$ROOT/gallery_photos"
THUMB_DIR="$SRC_DIR/thumbnails"

mkdir -p "$THUMB_DIR"

for src in "$SRC_DIR"/*.jpg; do
  name="$(basename "$src")"
  dest="$THUMB_DIR/$name"

  if [[ -f "$dest" && "$dest" -nt "$src" ]]; then
    echo "  skip  $name (thumbnail up to date)"
    continue
  fi

  magick "$src" -resize 800x800\> -quality 82 -strip -define jpeg:extent=150KB "$dest"
  echo "  done  $name"
done

echo "Thumbnails written to $THUMB_DIR"
