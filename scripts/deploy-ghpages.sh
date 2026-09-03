#!/usr/bin/env bash
# SKILL//ORBIT — deploy static build ke GitHub Pages (branch gh-pages), aman.
# Cara kerja: repo bersih sementara di /tmp, bukan utak-atik worktree utama.
set -e
SRC="$(cd "$(dirname "$0")/.." && pwd)"
GHPAT="$(printf 'protocol=https\nhost=github.com\n\n' | git credential fill 2>/dev/null | sed -n 's/^password=//p')"
[ -z "$GHPAT" ] && { echo "NO_PAT — cek credential store"; exit 1; }

cd "$SRC"
npm run build
rm -rf /tmp/ghp && mkdir -p /tmp/ghp && cd /tmp/ghp
git init -q -b gh-pages
cp -r "$SRC/dist/." ./
touch .nojekyll
git add -A
git -c user.name="Rizky Karman" -c user.email="astrorawak@gmail.com" commit -q -m "deploy: static build (gh-pages)"
git remote add origin "https://x-access-token:${GHPAT}@github.com/astrorawak/skill-orbit.git"
git push -q -f origin gh-pages
echo "PUSH_OK → tunggu ~2-4 mnt di https://astrorawak.github.io/skill-orbit/"
unset GHPAT
