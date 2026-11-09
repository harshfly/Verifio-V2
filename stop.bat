@echo off
title Verifio — Stopping Servers
color 0C

echo.
echo  Stopping Verifio servers...
echo.

:: Kill any uvicorn / node processes on those ports
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /PID %%p /F >nul 2>&1
)
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /PID %%p /F >nul 2>&1
)

echo  ╔══════════════════════════════════════════╗
echo  ║        All Verifio servers stopped.      ║
echo  ╚══════════════════════════════════════════╝
echo.

timeout /t 3 /nobreak >nul

