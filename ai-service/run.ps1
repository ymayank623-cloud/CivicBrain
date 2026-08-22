Write-Host "Setting up CivicBrain AI Service..." -ForegroundColor Cyan
cd C:\CivicBrain\ai-service

Write-Host "Creating Python Virtual Environment..." -ForegroundColor Yellow
python -m venv venv
.\venv\Scripts\Activate.ps1

Write-Host "Installing AI Dependencies (FastAPI, OpenCV, Geopy)..." -ForegroundColor Yellow
pip install -r requirements.txt

Write-Host "Starting AI Vision Engine on port 8000..." -ForegroundColor Green
uvicorn main:app --reload --port 8000
