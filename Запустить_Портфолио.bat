@echo off
chcp 65001 > nul
echo ======================================================
echo    Портфолио IT-специалиста: Грачёв Кирилл
echo ======================================================
echo.
echo Запуск сервера портфолио...
start http://localhost:8080
"C:\Program Files\nodejs\node.exe" server.js
pause
