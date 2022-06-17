#!/bin/bash
export BRANCHNAME=$(date +'%m/%d/%Y-%H.%M.%S') && 
npm install &&
npm run build &&
git checkout -b $BRANCHNAME &&
git add . && 
git commit -m "new change" || 
echo "ENTER THIS USERNAME: sphinxreplit" &&
echo "Enter this github access token as password: $github_access_token" &&
git push --set-upstream sphinxreplit $BRANCHNAME &&
node ./dist/app.js --config=./config/app.json --db=./config/config.json