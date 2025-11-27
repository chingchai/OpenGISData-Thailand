# Fix 404 Error on Assets

## Problem
Static assets (CSS/JS) are returning 404 errors even though files exist at the correct location with correct permissions.

## Root Cause
The Nginx configuration has a nested `location` block inside the `/procurement/` location that uses `alias`. Nested location blocks inside alias locations can cause path resolution issues.

## Solution

### Step 1: Update Nginx Configuration on Production Server

SSH to production server and update the Nginx configuration:

```bash
# 1. Backup current config
sudo cp /etc/nginx/sites-available/procurement /etc/nginx/sites-available/procurement.backup

# 2. Edit the config
sudo nano /etc/nginx/sites-available/procurement
```

Replace with this configuration:

```nginx
server {
    listen 80;
    server_name 202.29.4.66 49.231.27.66 _;

    # Redirect root to /procurement
    location = / {
        return 301 /procurement/;
    }

    # Redirect /procurement to /procurement/
    location = /procurement {
        return 301 /procurement/;
    }

    # API proxy to backend
    location /procurement/api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve frontend static files
    location /procurement/ {
        alias /var/www/OpenGISData-Thailand/procurement-system/client/dist/;
        try_files $uri $uri/ /procurement/index.html;

        # Cache control for all files
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Default page
    location / {
        root /var/www/html;
        index procurement.html index.html;
    }
}
```

### Step 2: Test and Reload Nginx

```bash
# Test configuration
sudo nginx -t

# If test passes, reload Nginx
sudo nginx -s reload
```

### Step 3: Clear Browser Cache and Test

```bash
# Test assets from command line
curl -I http://localhost/procurement/assets/index-BK2eVJHf.css

# Should return: HTTP/1.1 200 OK
```

### Step 4: Verify in Browser

1. Open browser and clear cache (Ctrl+Shift+Delete)
2. Visit: http://49.231.27.66/procurement/
3. Check if page loads correctly with styles

## Key Changes Made

1. **Removed nested location block** - The nested `location ~* \.(js|css|...)$` block was causing path resolution issues
2. **Simplified cache headers** - Applied cache control at the main location level
3. **Updated path** - Changed from `/home/user/...` to `/var/www/...` for correct production path

## Verification Commands

```bash
# Check if files exist
ls -la /var/www/OpenGISData-Thailand/procurement-system/client/dist/assets/

# Check file permissions (should be www-data:www-data)
ls -l /var/www/OpenGISData-Thailand/procurement-system/client/dist/

# Test endpoints
curl -I http://localhost/procurement/
curl -I http://localhost/procurement/api/
curl -I http://localhost/procurement/assets/index-BK2eVJHf.css

# Check Nginx error log if issues persist
sudo tail -50 /var/log/nginx/error.log
```

## Alternative: Use root Instead of alias

If the issue persists, you can try using `root` instead of `alias`:

```nginx
location /procurement/ {
    root /var/www/OpenGISData-Thailand/procurement-system/client/dist;
    try_files $uri $uri/ /procurement/index.html;
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

Note: With `root`, Nginx will look for files at: `/var/www/OpenGISData-Thailand/procurement-system/client/dist/procurement/...`

So you'd need to adjust the directory structure accordingly. The `alias` approach is preferred for subdirectory deployments.
