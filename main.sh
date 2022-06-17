#!/bin/bash
export BRANCHNAME=$(date +'%m/%d/%Y-%H.%M.%S') && 
npm install &&
npm run build &&
git checkout -b $BRANCHNAME &&
git add . && 
git commit -m "new change" || 
echo &&
echo "ENTER THIS USERNAME: sphinxreplit" &&
echo "Enter this github access token as password: $github_access_token" &&
echo "NOTE THAT YOU WILL NEED TO WAIT 5-7 MINUTES TO SEE CHANGES REFLECTED ON EC2 instance" &&
git push --set-upstream sphinxreplit $BRANCHNAME &&
echo "I'm going to make you wait 2 minutes to update the ec2 instance, please be patient" &&
sleep 120 &&
node ./dist/app.js --config=./config/app.json --db=./config/config.json