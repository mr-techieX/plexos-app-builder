# Troubleshooting Guide

## Common Issues and Solutions

### 1. "npm start" not working from root directory

**Problem**: `npm start` fails with "package.json not found"

**Solution**: 
- Make sure you're in the root directory (`plexos-app-builder`)
- Run `npm install` first
- Then run `npm start`

### 2. Port already in use

**Problem**: Port 3000 or 5000 is already occupied

**Solution**:
```bash
# Kill processes on those ports (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### 3. Database upload fails

**Problem**: "Database missing required tables" error

**Solution**:
- Ensure your database file is a valid SQLite file
- The backend now automatically detects table names
- Check the console for available tables in your database
- Common table name variations are supported

### 4. Frontend can't connect to backend

**Problem**: API calls fail with connection errors

**Solution**:
- Ensure backend is running: `npm run server`
- Check if backend is on port 5000
- Verify CORS settings in server/index.js
- Check API base URL in client/src/services/api.js

### 5. Heroicons not loading

**Problem**: Icon import errors

**Solution**:
- The project now uses Heroicons v2
- Import paths have been updated
- Run `npm install` in the client directory

### 6. Dependencies not installed

**Problem**: Module not found errors

**Solution**:
```bash
# Install all dependencies
npm run install-all

# Or install individually
cd server && npm install
cd ../client && npm install
```

## Quick Fixes

### Reset Everything
```bash
# Stop all processes
# Delete node_modules and reinstall
rm -rf node_modules
rm -rf client/node_modules
rm -rf server/node_modules

# Reinstall everything
npm run install-all
npm start
```

### Check if services are running
```bash
# Test backend
curl http://localhost:5000/api/health

# Test frontend
curl http://localhost:3000
```

### Manual Start
```bash
# Start backend only
npm run server

# Start frontend only (in new terminal)
npm run client
```

## Getting Help

1. **Check the console** for error messages
2. **Verify ports** are not in use
3. **Test individual services** using the manual start commands
4. **Check the health endpoint**: http://localhost:5000/api/health
5. **Review the logs** in the terminal where you ran `npm start`

## File Structure Verification

Ensure your project structure looks like this:
```
plexos-app-builder/
├── package.json          # Root package.json
├── README.md            # Main documentation
├── start.bat            # Windows startup script
├── test-setup.js        # Setup verification
├── client/              # React frontend
│   ├── package.json
│   └── src/
└── server/              # Express backend
    ├── package.json
    ├── index.js
    └── uploads/
```

## Environment Variables

If you need to change ports, you can set environment variables:

```bash
# Windows
set PORT=5001 && npm run server
set PORT=3001 && npm run client

# Or modify the files directly
# server/index.js - change PORT variable
# client/package.json - add "PORT": "3001" to scripts
``` 