#!/bin/bash
# Renders a mock HTML file to out/<name>.jpg with headless Chrome. Usage: ./render.sh 1-particle
cd "$(dirname "$0")"
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
URL="file://$(python3 -I -c 'import sys,urllib.parse,os; print(urllib.parse.quote(os.path.abspath(sys.argv[1])))' "$1.html")"
W=${2:-1440}; H=${3:-900}
"$CH" --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files \
  --user-data-dir="${TMPDIR:-/tmp}/mock-chrome-profile" --window-size=$W,$H --force-device-scale-factor=2 \
  --virtual-time-budget=15000 --screenshot="out/$1.png" "$URL" >/dev/null 2>&1
sips -s format jpeg -s formatOptions 88 "out/$1.png" --out "out/$1.jpg" >/dev/null 2>&1 && rm -f "out/$1.png"
ls -la "out/$1.jpg" | awk '{print $5, $9}'
