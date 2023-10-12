@echo off
:start
set /p fileName="Enter the name of the file you wish to update: "
cd "C:\Users\anthony\Google Drive\MyGames\Projects"\grapher\tools
node updateLibFile.js %fileName%
IF %ERRORLEVEL% NEQ 0 (
goto start
)
echo Update successfully completed
pause
