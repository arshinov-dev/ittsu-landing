#!/usr/bin/env sh
set -eu

if [ -z "${PUBLIC_DIR:-}" ]; then
    echo "Set PUBLIC_DIR to the public web directory path." >&2
    echo "Example: PUBLIC_DIR=/var/www/example/data/www/example.ru sh scripts/deploy-static.sh" >&2
    exit 1
fi

ROOT_DIR=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
PUBLIC_DIR=$(mkdir -p "$PUBLIC_DIR" && CDPATH= cd -- "$PUBLIC_DIR" && pwd)
STAGING_DIR=$(mktemp -d "${TMPDIR:-/tmp}/ittsu-static.XXXXXX")
PUBLIC_ROOT_FILES="index.html robots.txt sitemap.xml"
PUBLIC_DIRECTORIES="assets maintenance"

cleanup() {
    rm -rf "$STAGING_DIR"
}
trap cleanup EXIT INT TERM

for file in $PUBLIC_ROOT_FILES example.htaccess; do
    if [ ! -f "$ROOT_DIR/$file" ]; then
        echo "Required production file is missing: $file." >&2
        exit 1
    fi
done

for directory in $PUBLIC_DIRECTORIES; do
    if [ ! -d "$ROOT_DIR/$directory" ]; then
        echo "Required production directory is missing: $directory/." >&2
        exit 1
    fi
done

if [ "$PUBLIC_DIR" = "$ROOT_DIR" ]; then
    echo "PUBLIC_DIR must not be the repository root." >&2
    exit 1
fi

for file in $PUBLIC_ROOT_FILES; do
    cp "$ROOT_DIR/$file" "$STAGING_DIR/$file"
done

for directory in $PUBLIC_DIRECTORIES; do
    cp -R "$ROOT_DIR/$directory" "$STAGING_DIR/$directory"
done

cp "$ROOT_DIR/example.htaccess" "$STAGING_DIR/.htaccess"

rsync -a --delete \
    --exclude=".DS_Store" \
    "$STAGING_DIR/" \
    "$PUBLIC_DIR/"

echo "Deployed static site to $PUBLIC_DIR"
