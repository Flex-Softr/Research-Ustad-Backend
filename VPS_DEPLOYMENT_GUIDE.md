# VPS Deployment - File Upload Fix Guide

## Problem Analysis for VPS Deployment

Since your application is deployed on a VPS (not Vercel), the 413 "Request Entity Too Large" error is likely caused by one of these factors:

### 1. **Reverse Proxy Configuration (Most Common)**
If you're using Nginx or Apache as a reverse proxy, they have their own file size limits:

#### **Nginx Configuration**
```nginx
# /etc/nginx/sites-available/your-site
server {
    client_max_body_size 100M;  # Increase from default 1M
    client_body_timeout 60s;
    client_header_timeout 60s;
    
    location / {
        proxy_pass http://localhost:5000;  # Your Node.js app port
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Additional proxy settings for file uploads
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_request_buffering off;  # For large file uploads
    }
}
```

#### **Apache Configuration**
```apache
# /etc/apache2/sites-available/your-site.conf
<VirtualHost *:80>
    ServerName your-domain.com
    
    # Increase file upload limits
    LimitRequestBody 104857600  # 100MB in bytes
    
    # Proxy settings
    ProxyPreserveHost On
    ProxyPass / http://localhost:5000/
    ProxyPassReverse / http://localhost:5000/
    
    # Timeout settings
    ProxyTimeout 300
    ProxyReadTimeout 300
</VirtualHost>
```

### 2. **PM2 Configuration**
If using PM2, ensure it's configured for larger payloads:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'research-ustad-backend',
    script: 'dist/server.js',
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    // Increase max HTTP header size
    node_args: '--max-http-header-size=80000'
  }]
}
```

### 3. **System-Level Limits**
Check and increase system limits if needed:

```bash
# Check current limits
ulimit -a

# Increase file size limits (temporary)
ulimit -f unlimited

# Make permanent by adding to /etc/security/limits.conf
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf
```

## Updated Application Configuration

### 1. **CORS Configuration (Already Fixed)**
✅ Added `https://researchustad.org` to allowed origins
✅ Enhanced CORS headers for file uploads

### 2. **File Upload Limits (Optimized for VPS)**
✅ Increased to 50MB per file
✅ Up to 20 files per request
✅ 100MB Express body limits

### 3. **Environment Variables Required**
```env
# .env file on your VPS
NODE_ENV=production
PORT=5000
DATABASE_URL=your_mongodb_connection_string
FRONTEND_URLS=https://researchustad.org,https://www.researchustad.org,http://localhost:3000
BACKEND_URL=https://api.researchustad.org
JWT_ACCESS_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

## Troubleshooting Steps

### 1. **Check Nginx/Apache Logs**
```bash
# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Apache error logs
sudo tail -f /var/log/apache2/error.log
```

### 2. **Check Application Logs**
```bash
# If using PM2
pm2 logs research-ustad-backend

# If using systemd
sudo journalctl -u your-service-name -f
```

### 3. **Test File Upload Directly**
```bash
# Test with curl to bypass browser issues
curl -X POST \
  -F "file=@test-image.jpg" \
  -F "data={\"title\":\"Test Event\"}" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.researchustad.org/api/v1/event
```

### 4. **Check Network Configuration**
```bash
# Check if reverse proxy is running
sudo systemctl status nginx
# or
sudo systemctl status apache2

# Check if Node.js app is running
sudo systemctl status your-node-app
# or
pm2 status
```

## Quick Fix Commands

### **For Nginx Users:**
```bash
# Edit nginx config
sudo nano /etc/nginx/sites-available/your-site

# Add or update this line:
client_max_body_size 100M;

# Test and reload nginx
sudo nginx -t
sudo systemctl reload nginx
```

### **For Apache Users:**
```bash
# Edit apache config
sudo nano /etc/apache2/sites-available/your-site.conf

# Add this line:
LimitRequestBody 104857600

# Enable mod and restart
sudo a2enmod headers
sudo systemctl restart apache2
```

## Deployment Checklist

- [ ] ✅ CORS configuration updated
- [ ] ✅ File upload limits increased to 50MB
- [ ] ✅ Express body limits increased to 100MB
- [ ] 🔄 **Nginx/Apache client_max_body_size increased**
- [ ] 🔄 **Environment variables set correctly**
- [ ] 🔄 **Application restarted after changes**
- [ ] 🔄 **Test file upload with 1.08MB file**

## Expected Results

After implementing these fixes:
- ✅ CORS errors should be resolved
- ✅ 413 errors should be resolved for files up to 50MB
- ✅ Your 1.08MB file should upload successfully
- ✅ Multiple files can be uploaded simultaneously

## Next Steps

1. **Update your reverse proxy configuration** (Nginx/Apache)
2. **Restart your web server** and Node.js application
3. **Test the file upload** with your 1.08MB file
4. **Monitor logs** for any remaining issues

The most likely culprit is the reverse proxy configuration, so start there!
