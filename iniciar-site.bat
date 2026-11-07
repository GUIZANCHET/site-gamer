@echo off
title Continue? - Servidor Local Arcade
echo ========================================================
echo   CONTINUE? - Servidor Local Arcade e Consoles
echo ========================================================
echo.
echo Iniciando servidor na porta 4175...
start http://127.0.0.1:4175/
node serve-local.cjs
pause
