@echo off
chcp 65001 >nul
cd /d "%~dp0"
title お問い合わせ入力支援アプリ

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Node.js が見つかりません。
  echo  README.md の「準備」に従って Node.js をインストールしてから、もう一度ダブルクリックしてください。
  echo.
  pause
  exit /b 1
)

if not exist node_modules (
  echo.
  echo  初回セットアップ中です。数分かかります。この画面は閉じないでください...
  call npm install
  if errorlevel 1 (
    echo.
    echo  セットアップに失敗しました。インターネット接続を確認して、もう一度お試しください。
    pause
    exit /b 1
  )
)

if not exist dist-ui\index.html (
  echo.
  echo  画面を準備しています...
  call npm run build
  if errorlevel 1 (
    echo.
    echo  画面の準備に失敗しました。
    pause
    exit /b 1
  )
)

echo.
echo  アプリを起動します。しばらくするとブラウザが自動で開きます。
echo  （この黒い画面は閉じないでください。終了するときはこの画面を閉じます）
echo.
call npm start
echo.
pause
