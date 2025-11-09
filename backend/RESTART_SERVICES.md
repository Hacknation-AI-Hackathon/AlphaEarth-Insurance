# Restart Services After Python Service Update

## Important: Restart Both Services

After updating the Python service health endpoint, you need to **restart both services**:

### 1. Restart Python Service

**Stop the current Python service** (Ctrl+C in the terminal where it's running), then:

```bash
cd backend/python-service
python earth_engine_service.py
```

### 2. Restart Node.js Backend

**Stop the current Node.js backend** (Ctrl+C in the terminal where it's running), then:

```bash
cd backend
npm run dev
```

## Verify Services Are Running

### Test Python Service Health
```powershell
Invoke-WebRequest -Uri "http://localhost:5001/health" -Method GET
```

Should return:
```json
{
  "status": "ok",
  "service": "earth_engine_python_service",
  "earth_engine": "checking"
}
```

### Test Node.js Backend
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method GET
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "...",
  "service": "AlphaEarth Backend API"
}
```

## Troubleshooting

### If Node.js still shows Earth Engine errors:

1. **Clear Node.js cache**:
   ```bash
   # Stop the server
   # Delete node_modules/.cache if it exists
   rm -rf node_modules/.cache
   # Restart
   npm run dev
   ```

2. **Check if Python service is accessible**:
   ```powershell
   Test-NetConnection -ComputerName localhost -Port 5001
   ```

3. **Check Python service logs** for any errors

### If Python service won't start:

1. **Check if port 5001 is already in use**:
   ```powershell
   netstat -ano | findstr :5001
   ```

2. **Try a different port**:
   ```bash
   export PYTHON_SERVICE_PORT=5002
   python earth_engine_service.py
   ```
   Then update Node.js `.env`:
   ```
   PYTHON_SERVICE_URL=http://localhost:5002
   ```

## Expected Behavior

After restarting both services:

1. ✅ Python service should start without errors (Earth Engine warnings are OK)
2. ✅ Node.js backend should connect to Python service successfully
3. ✅ Health checks should return `{"status": "ok"}`
4. ✅ Claim processing should work (even if Earth Engine needs authentication)

## Next Steps

Once both services are running:

1. **Authenticate Earth Engine** (if not done already):
   ```bash
   earthengine authenticate
   ```

2. **Test claim processing** from the frontend

3. **Check logs** in both services for any errors

