@ECHO OFF
ECHO Build in progress...
node "%~dp0r.js" -o "%~dp0build.js"
:: You can change output file!!
ECHO uglifyjs in progress... Output file: "C:\Users\Anthony\Documents\grapherDeploy\grapher\public\www-built\app.js"
uglifyjs "%~dp0..\www-built\app.js" -c -m -o "C:\Users\Anthony\Documents\grapherDeploy\grapher\public\www-built\app.js"
C:\Users\Anthony\Documents\grapherDeploy\grapher\public\www-built\app.js