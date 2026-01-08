@echo off
echo Starting Smart Multiplayer Strategy Game Platform...

start "AI Service" cmd /k "cd SmartStrategyGame.AI && pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo Waiting for AI service to initialize...
timeout /t 5

start "Backend Service" cmd /k "cd SmartStrategyGame.Backend && dotnet run"

echo Services started!
echo Backend: http://localhost:5000
echo AI Service: http://localhost:8000
echo Swagger UI: http://localhost:5000/swagger
pause
