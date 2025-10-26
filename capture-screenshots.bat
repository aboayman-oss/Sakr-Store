@echo off
setlocal ENABLEDELAYEDEXPANSION

REM Change to the directory of this script
cd /d "%~dp0"

echo [Sakr-Store] Screenshot capture starting...

REM Prefer Python + Playwright (full-page, reliable)
where python >NUL 2>&1
if %ERRORLEVEL%==0 (
  echo Detected Python. Trying Playwright-based capture...
  python -c "import playwright.sync_api" >NUL 2>&1
  if %ERRORLEVEL%==0 (
    python "%~dp0capture_screenshots.py" --out "screenshots/auto"
    if %ERRORLEVEL%==0 (
      echo Done via Python. Screenshots in screenshots\auto
      goto :end
    ) else (
      echo Python script failed; falling back to PowerShell method...
    )
  ) else (
    echo Playwright not found in Python; falling back to PowerShell method...
  )
) else (
  echo Python not found; using PowerShell method...
)

REM Fallback: PowerShell + Edge/Chrome headless (viewport-only)
powershell -ExecutionPolicy Bypass -File "%~dp0capture-screenshots.ps1"
if %ERRORLEVEL%==0 (
  echo Done via PowerShell. Screenshots in screenshots\auto
) else (
  echo ERROR: PowerShell method failed. See output above.
  exit /b 1
)

:end
endlocal
exit /b 0
