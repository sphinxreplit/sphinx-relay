export BRANCHNAME=$(date +'%m/%d/%Y-%H.%M.%S') && 
rm package-lock.json || 
npm install &&
npm run build &&
git checkout -b $BRANCHNAME &&
git add . && 
git commit -m "new change" && 
echo "$github_access_token" &&
sleep 30 | echo | git push --set-upstream sphinxreplit $BRANCHNAME &&
node ./dist/app.js --config=./config/app.json --db=./config/config.json