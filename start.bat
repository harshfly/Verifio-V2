@echo off
title Verifio — AI Text Detection
color 0B

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║         VERIFIO — Starting Up...         ║
echo  ╚══════════════════════════════════════════╝
echo.

cd /d "%~dp0"

:: Start Backend
echo  [1/2] Starting Backend (port 8000)...
start "Verifio Backend" cmd /k "cd backend && python -m uvicorn main:app --reload --port 8000"

:: Wait a moment for backend to initialize
timeout /t 3 /nobreak >nul

:: Start Frontend
echo  [2/2] Starting Frontend (port 5173)...
start "Verifio Frontend" cmd /k "cd frontend && npm run dev"

:: Wait for frontend to be ready
timeout /t 3 /nobreak >nul

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║           All servers running!           ║
echo  ║                                          ║
echo  ║   Frontend:  http://localhost:5173       ║
echo  ║   Backend:   http://localhost:8000       ║
echo  ║   API Docs:  http://localhost:8000/docs  ║
echo  ║                                          ║
echo  ║   Close the server windows to stop.      ║
echo  ╚══════════════════════════════════════════╝
echo.

:: Open browser
start http://localhost:5173

echo  Browser opened. You can close this window.
timeout /t 5 /nobreak >nul

