#!/bin/bash
source ~/.bash_profile
set -e

node -v
npm -v
yarn -v


cd ~/domains/bot.typeofweb.com/public_nodejs
echo "👉 Pulling from the server…"
git fetch origin

if git diff --quiet remotes/origin/main; then
  echo "👉 Up to date; nothing to do!"
  exit
fi

git pull origin main

echo "👉 Installing deps…"
yarn --frozen-lockfile

echo "👉 Bulding…"
NODE_ENV=production ENV=production yarn build
echo `git rev-parse HEAD` > .version

# echo "👉 Pruning…"
# npm prune

echo "👉 Restarting the server…"
pm2 restart bot

echo "👉 Done! 😱 👍"
