@echo off
setlocal
set "ENTRY=%~dp0index.html"
set "CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
if exist "%CHROME%" (
  start "" "%CHROME%" --new-window --window-size=1440,1000 "%ENTRY%"
) else (
  start "" "%ENTRY%"
)
endlocal
