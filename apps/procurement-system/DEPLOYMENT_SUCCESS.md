# Procurement System - Deployment Success! 🎉

**Deployment Date:** November 24, 2025
**Server:** 202.29.4.66 / 49.231.27.66
**Application URL:** http://49.231.27.66/procurement/

---

## ✅ Deployment Summary

The procurement system has been successfully deployed as a **subdirectory application** at `/procurement`.

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Browser: http://49.231.27.66/procurement/             │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  Nginx (Port 80)                                        │
│  - Serves static files from symlink                     │
│  - Proxies API requests to backend                      │
└─────────────────────────────────────────────────────────┘
         │                              │
         │ Static Files                 │ API Requests
         ▼                              ▼
┌──────────────────────┐    ┌──────────────────────────┐
│ Frontend (React SPA) │    │ Backend (Express.js)     │
│ /var/www/html/       │    │ PM2: procurement-backend │
│   procurement/       │    │ Port: 3000               │
│   (symlink)          │    │                          │
└──────────────────────┘    └──────────────────────────┘
```

---

## 🔧 Key Configurations

### 1. Frontend Configuration

**File:** `client/src/App.jsx`
- React Router `basename="/procurement"`

**File:** `client/src/services/api.js`
- API URL: `/procurement/api`
- Login redirect: `/procurement/login`

**File:** `client/vite.config.js`
- Build base: `/procurement`

### 2. Nginx Configuration

**Location:** `/etc/nginx/sites-available/procurement`

```nginx
server {
    listen 80 default_server;
    server_name 202.29.4.66 49.231.27.66 _;
    root /var/www/html;

    # API proxy
    location ^~ /procurement/api/ {
        proxy_pass http://localhost:3000/api/;
        ...
    }

    # Frontend (via symlink)
    location /procurement/ {
        try_files $uri $uri/ /procurement/index.html;
    }

    # Redirect /procurement to /procurement/
    location = /procurement {
        return 301 /procurement/;
    }

    # Default location
    location / {
        try_files $uri $uri/ =404;
    }
}
```

**Symlink:**
```bash
/var/www/html/procurement → /var/www/OpenGISData-Thailand/apps/procurement-system/client/dist
```

### 3. Backend Configuration

**Process Manager:** PM2
**Process Name:** `procurement-backend`
**Working Directory:** `/var/www/OpenGISData-Thailand/apps/procurement-system/server`
**Port:** 3000

---

## 📁 Directory Structure

```
/var/www/OpenGISData-Thailand/apps/procurement-system/
├── client/
│   ├── src/
│   │   ├── App.jsx (basename="/procurement")
│   │   └── services/
│   │       └── api.js (API_URL="/procurement/api")
│   ├── dist/ (build output)
│   │   ├── index.html
│   │   └── assets/
│   └── vite.config.js (base="/procurement")
├── server/
│   ├── server.js
│   ├── routes/
│   └── data/ (SQLite database)
├── nginx.conf.production (Nginx config)
├── clean-install.cjs (Automated installation script)
└── diagnose-nginx.cjs (Diagnostic tool)

/var/www/html/
└── procurement/ → (symlink to dist/)
```

---

## 🚀 Testing & Verification

All endpoints have been tested and confirmed working:

### Frontend
- ✅ **http://49.231.27.66/procurement/** - Main application
- ✅ **http://49.231.27.66/procurement/login** - Login page
- ✅ **http://49.231.27.66/procurement/dashboard** - Dashboard
- ✅ Static assets (CSS, JS) load correctly

### Backend
- ✅ **http://49.231.27.66/procurement/api/** - API health check
- ✅ Authentication endpoints working
- ✅ Projects endpoints working
- ✅ All CRUD operations functional

### System
- ✅ Client-side routing works correctly
- ✅ API calls use correct `/procurement/api` prefix
- ✅ No 404 errors on navigation
- ✅ PM2 process running stable

---

## 🔄 Maintenance Commands

### Check System Status
```bash
# Check PM2 status
pm2 status

# Check PM2 logs
pm2 logs procurement-backend

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Restart Services
```bash
# Restart backend
pm2 restart procurement-backend

# Reload Nginx
sudo nginx -s reload

# Test Nginx config
sudo nginx -t
```

### Update Application
```bash
# Pull latest code
cd /var/www/OpenGISData-Thailand
git pull origin master

# Rebuild frontend
cd apps/procurement-system/client
npm run build

# Restart backend (if needed)
pm2 restart procurement-backend
```

---

## 🛠 Troubleshooting

### If frontend shows 404 errors

1. Check symlink exists:
```bash
ls -la /var/www/html/procurement
```

2. Recreate symlink if needed:
```bash
sudo ln -sf /var/www/OpenGISData-Thailand/apps/procurement-system/client/dist /var/www/html/procurement
```

3. Check permissions:
```bash
sudo chown -R www-data:www-data /var/www/OpenGISData-Thailand/apps/procurement-system/client/dist
sudo chmod -R 755 /var/www/OpenGISData-Thailand/apps/procurement-system/client/dist
```

### If API returns errors

1. Check PM2 status:
```bash
pm2 status
pm2 logs procurement-backend --lines 50
```

2. Restart backend:
```bash
pm2 restart procurement-backend
```

### Run Diagnostics

Use the diagnostic script to identify issues:
```bash
sudo node /var/www/OpenGISData-Thailand/apps/procurement-system/diagnose-nginx.cjs
```

---

## 📝 Clean Reinstallation

If you need to reinstall from scratch:

```bash
cd /tmp
git clone https://github.com/chingchai/OpenGISData-Thailand.git
cd OpenGISData-Thailand
git checkout master
sudo node apps/procurement-system/clean-install.cjs
```

**Note:** This will delete all existing data and configurations!

---

## 🎯 Features Deployed

- ✅ User Authentication (Login/Logout)
- ✅ Dashboard with Statistics
- ✅ Projects Management (CRUD)
- ✅ Project Steps Tracking
- ✅ Overdue Projects Monitoring
- ✅ User Management (Admin)
- ✅ Department Management
- ✅ File Upload (Images, Documents)
- ✅ Excel Import/Export
- ✅ Map Visualization (Leaflet)
- ✅ Notifications System
- ✅ Supervisor Reviews

---

## 📚 Documentation Files

- `CLEAN_INSTALL.md` - Clean installation guide
- `DEPLOYMENT_FIX.md` - Common deployment issues and fixes
- `diagnose-nginx.cjs` - Nginx diagnostic tool
- `clean-install.cjs` - Automated installation script
- `nginx.conf.production` - Production Nginx configuration

---

## ✨ Deployment Success Criteria

All criteria have been met:

- [x] Application accessible at `/procurement` subdirectory
- [x] Frontend loads with correct styles and assets
- [x] API endpoints respond correctly
- [x] Client-side routing works without 404 errors
- [x] Login and authentication functional
- [x] All CRUD operations working
- [x] PM2 process running and stable
- [x] Nginx configuration optimized
- [x] No errors in logs
- [x] System can coexist with other applications on same server

---

## 🎉 Deployment Complete!

The procurement system is now live and fully functional at:

**http://49.231.27.66/procurement/**

Enjoy your new procurement management system! 🚀
