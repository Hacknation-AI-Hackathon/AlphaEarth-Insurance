# Starting the Backend - Quick Fix Guide

## Issue Found
The backend was trying to start on port 5001 (from .env file), but that port is already in use.

## Solution Applied
✅ Changed `.env` file from `PORT=5001` to `PORT=5000`

## Steps to Start Backend

### 1. Check for Running Processes
```powershell
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Check if port 5001 is in use (old backend)
netstat -ano | findstr :5001
```

### 2. Kill Any Old Backend Processes (if needed)
```powershell
# If you see a process on port 5001, kill it:
# Find the process ID from netstat output, then:
Stop-Process -Id <PID> -Force
```

### 3. Start the Backend
```powershell
cd backend
npm run dev
```

You should see:
```
🚀 AlphaEarth Backend API running on port 5000
```

### 4. Verify Backend is Running
```powershell
# In a new terminal
Invoke-RestMethod -Uri "http://localhost:5000/health"
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-01-XX...",
  "service": "AlphaEarth Backend API"
}
```

## Troubleshooting

### Port 5000 Still in Use
If port 5000 is also in use:
1. Find the process: `netstat -ano | findstr :5000`
2. Kill it: `Stop-Process -Id <PID> -Force`
3. Or change port in `.env`: `PORT=5002`

### Backend Won't Start
1. Check for errors in console
2. Verify `node_modules` are installed: `npm install`
3. Check `.env` file exists and has correct format
4. Make sure no syntax errors in code

### Earth Engine Errors
If you see Earth Engine errors, they're OK for now - claim processing just won't work until you authenticate:
```powershell
earthengine authenticate
```

## Next Steps After Backend Starts

1. ✅ Run quick test: `.\quick-test.ps1`
2. ✅ Run full test: `.\test-api.ps1`
3. ✅ Test individual endpoints manually
4. ✅ Verify all APIs work before frontend integration

## Port Configuration

- **Default Port**: 5000 (set in `server.js`)
- **.env Override**: Can set `PORT=5000` in `.env`
- **Frontend Proxy**: Configured to use port 5000 in `vite.config.ts`

## Testing

Once backend is running on port 5000:

```powershell
# Quick test
cd backend
.\quick-test.ps1

# Full test
.\test-api.ps1
```

