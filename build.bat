@echo off
echo Building African Nations League application...

REM Install backend dependencies
cd backend
pip install -r ..\requirements.txt
cd ..

REM Install frontend dependencies
npm install

REM Build React app
npm run build

echo Build completed successfully!
pause
