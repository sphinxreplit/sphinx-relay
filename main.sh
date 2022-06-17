#!/bin/bash
export BRANCHNAME=$(date +'%m/%d/%Y-%H.%M.%S') && 
npm install &&
npm run build &&
git checkout -b $BRANCHNAME &&
git add . && 
git commit -m "new change" || 
echo "ENTER THIS USERNAME: sphinxreplit \n Enter this github access token as password: $github_access_token \n YOU WILL NEED TO WAIT AROUND 5-7 MINUTES TILL CHANGES ARE AVAILIBLE ON EC2 RELAY NODES" &&
git push --set-upstream sphinxreplit $BRANCHNAME &&
sleep 120 &&
node ./dist/app.js --config=./config/app.json --db=./config/config.json