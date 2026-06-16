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

cleanup() {
    rm -rf "$STAGING_DIR"
}
trap cleanup EXIT INT TERM

if [ ! -f "$ROOT_DIR/index.html" ] || [ ! -d "$ROOT_DIR/assets" ] || [ ! -d "$ROOT_DIR/maintenance" ] || [ ! -f "$ROOT_DIR/example.htaccess" ]; then
    echo "Required production files are missing: index.html, assets/, maintenance/, example.htaccess." >&2
    exit 1
fi

if [ "$PUBLIC_DIR" = "$ROOT_DIR" ]; then
    echo "PUBLIC_DIR must not be the repository root." >&2
    exit 1
fi

cp "$ROOT_DIR/index.html" "$STAGING_DIR/index.html"
cp -R "$ROOT_DIR/assets" "$STAGING_DIR/assets"
cp -R "$ROOT_DIR/maintenance" "$STAGING_DIR/maintenance"
cp "$ROOT_DIR/example.htaccess" "$STAGING_DIR/.htaccess"

rsync -a --delete \
    --exclude=".DS_Store" \
    "$STAGING_DIR/" \
    "$PUBLIC_DIR/"

echo "Deployed static site to $PUBLIC_DIR"
