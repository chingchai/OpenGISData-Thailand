const path = require('path');

module.exports = {
  apps: [
    {
      name: 'procurement-api',
      cwd: path.join(__dirname, 'server'),
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: path.join(__dirname, 'server/logs/pm2-error.log'),
      out_file: path.join(__dirname, 'server/logs/pm2-out.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
