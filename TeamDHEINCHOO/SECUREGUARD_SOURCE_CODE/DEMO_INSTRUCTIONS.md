# Demo Instructions

This file is the single runbook for the current system.

## 1) Prerequisites

- Windows PowerShell
- Python virtual environment at `.venv`
- Node modules installed in `New_project/New project`

If first-time setup is needed:

```powershell
# from repo root
Set-Location "C:\Users\aarya\OneDrive\Desktop\IIT MANDI"

# Python deps
& ".\.venv\Scripts\Activate.ps1"
pip install -r ".\FINAL\requirements.txt"

# Frontend/backend deps
Set-Location ".\New_project\New project"
npm install
```

## 2) Start Services (3 terminals)

### Terminal A — Vulnerable Store (Flask)

```powershell
Set-Location "C:\Users\aarya\OneDrive\Desktop\IIT MANDI\FINAL"
& "C:\Users\aarya\OneDrive\Desktop\IIT MANDI\.venv\Scripts\python.exe" app.py
```

Expected URL: `http://127.0.0.1:5000`

### Terminal B — Security Backend (Node + Socket.IO)

```powershell
Set-Location "C:\Users\aarya\OneDrive\Desktop\IIT MANDI\New_project\New project"
npm run dev:server
```

Expected URL: `http://127.0.0.1:8000`

### Terminal C — Dashboard Frontend (Vite)

```powershell
Set-Location "C:\Users\aarya\OneDrive\Desktop\IIT MANDI\New_project\New project"
npm run dev:client
```

Expected URL: usually `http://127.0.0.1:5174` (or whatever Vite prints).

## 3) Run Demo

1. Open dashboard in browser.
2. Start a scan with target: `http://127.0.0.1:5000`.
3. Observe scan activity, vulnerability detection, and contract/audit updates.

## 4) If Port Conflicts Occur

```powershell
Get-NetTCPConnection -LocalPort 5000,8000,5173,5174 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
```

Then restart all 3 terminals.

## 5) Notes

- `.env` files are ignored by Git.
- The agent is configured to keep the scan flow stable even when Gemini rate limits occur.
