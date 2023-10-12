@ECHO OFF
ECHO Deploying in progress...
cd "C:\Users\Anthony\Documents\grapherDeploy\grapher"
git add .
git commit -am "Major bug fixes and code refactoring"
git push heroku master
ECHO Deployed