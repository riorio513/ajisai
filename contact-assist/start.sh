#!/bin/sh
# Mac / Linux 用の起動スクリプト
cd "$(dirname "$0")" || exit 1
command -v node >/dev/null 2>&1 || { echo "Node.js が見つかりません。README.md の「準備」を参照してください。"; exit 1; }
[ -d node_modules ] || { echo "初回セットアップ中です..."; npm install || exit 1; }
[ -f dist-ui/index.html ] || { echo "画面を準備しています..."; npm run build || exit 1; }
npm start
