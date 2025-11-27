#!/usr/bin/env node

/**
 * Nginx Diagnostic Script for Procurement System
 * This script diagnoses why /procurement/login is serving the wrong file
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function section(title) {
  log('\n' + '='.repeat(70), colors.cyan);
  log(title, colors.bright + colors.cyan);
  log('='.repeat(70), colors.cyan);
}

function exec(command, options = {}) {
  try {
    return execSync(command, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
      ...options,
    });
  } catch (error) {
    if (!options.ignoreErrors) {
      log(`Error: ${error.message}`, colors.red);
    }
    return null;
  }
}

// Diagnostic functions
function checkNginxConfig() {
  section('1. Active Nginx Configuration for /procurement');

  const config = exec('sudo nginx -T 2>/dev/null');
  if (!config) {
    log('❌ Could not read Nginx config', colors.red);
    return;
  }

  // Extract procurement-related locations
  const lines = config.split('\n');
  let inProcurement = false;
  let procurementConfig = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes('location') && line.includes('procurement')) {
      inProcurement = true;
      procurementConfig.push(line);
    } else if (inProcurement) {
      procurementConfig.push(line);
      if (line.trim() === '}') {
        // Check if this closes the location block
        const openBraces = procurementConfig.filter(l => l.includes('{')).length;
        const closeBraces = procurementConfig.filter(l => l.trim() === '}').length;
        if (openBraces === closeBraces) {
          inProcurement = false;
        }
      }
    }
  }

  if (procurementConfig.length > 0) {
    log(procurementConfig.join('\n'), colors.green);
  } else {
    log('❌ No procurement location found in Nginx config', colors.red);
  }
}

function checkLoginFiles() {
  section('2. Search for "login" files in /var/www/html');

  const result = exec('find /var/www/html -name "*login*" -type f 2>/dev/null', { ignoreErrors: true });

  if (result && result.trim()) {
    log('Found login-related files:', colors.yellow);
    log(result, colors.white);
  } else {
    log('✓ No login files found in /var/www/html', colors.green);
  }
}

function testRequest() {
  section('3. Test Request to /procurement/login');

  log('Testing with curl -v...', colors.blue);
  const result = exec('curl -v http://localhost/procurement/login 2>&1 | head -30', { ignoreErrors: true });

  if (result) {
    // Extract important info
    const lines = result.split('\n');
    lines.forEach(line => {
      if (line.includes('HTTP/') || line.includes('Content-Type') ||
          line.includes('Content-Length') || line.includes('Location') ||
          line.includes('ETag') || line.includes('Last-Modified')) {
        log(line, colors.white);
      }
    });

    // Check file size
    const sizeMatch = result.match(/Content-Length: (\d+)/);
    if (sizeMatch) {
      const size = parseInt(sizeMatch[1]);
      if (size === 21512) {
        log('\n❌ PROBLEM: Serving wrong file (21512 bytes = /var/www/html/index.html)', colors.red);
      } else if (size === 1291) {
        log('\n✓ Correct file size (1291 bytes = procurement index.html)', colors.green);
      } else {
        log(`\nFile size: ${size} bytes`, colors.yellow);
      }
    }
  }
}

function checkAccessLog() {
  section('4. Recent Nginx Access Log');

  const result = exec('sudo tail -3 /var/log/nginx/access.log 2>/dev/null', { ignoreErrors: true });
  if (result) {
    log(result, colors.white);
  }
}

function findIndexFiles() {
  section('5. All index.html files in /var/www');

  const result = exec('sudo find /var/www -name "index.html" -type f -exec ls -lh {} \\; 2>/dev/null', { ignoreErrors: true });

  if (result) {
    const lines = result.split('\n');
    lines.forEach(line => {
      if (line.includes('21512') || line.includes('21.0K') || line.includes('21K')) {
        log(`❌ ${line}`, colors.red);
      } else if (line.includes('1291') || line.includes('1.3K') || line.includes('1.2K')) {
        log(`✓ ${line}`, colors.green);
      } else if (line.trim()) {
        log(line, colors.white);
      }
    });
  }
}

function checkSymlinks() {
  section('6. Check Symlinks and Directory Structure');

  log('Checking /var/www/html/:', colors.blue);
  const html = exec('ls -la /var/www/html/ | grep procurement', { ignoreErrors: true });
  if (html && html.trim()) {
    log(html, colors.green);
  } else {
    log('❌ No procurement symlink in /var/www/html/', colors.red);
  }

  log('\nChecking actual dist directory:', colors.blue);
  const dist = exec('ls -la /var/www/OpenGISData-Thailand/procurement-system/client/dist/', { ignoreErrors: true });
  if (dist) {
    log(dist.split('\n').slice(0, 5).join('\n'), colors.white);
  }
}

function checkPathResolution() {
  section('7. Nginx Path Resolution (root/alias directives)');

  const config = exec('sudo nginx -T 2>/dev/null | grep -E "root |alias " | grep -v "#"', { ignoreErrors: true });
  if (config) {
    const lines = config.split('\n').filter(l => l.trim());
    lines.forEach(line => {
      if (line.includes('/var/www/html')) {
        log(`❌ ${line.trim()}`, colors.red);
      } else if (line.includes('procurement')) {
        log(`✓ ${line.trim()}`, colors.green);
      } else if (line.trim()) {
        log(`  ${line.trim()}`, colors.white);
      }
    });
  }
}

function analyzeIssue() {
  section('ANALYSIS AND RECOMMENDATIONS');

  log('\n🔍 Based on the diagnostics above, here are likely issues:', colors.yellow);

  // Check if wrong file is being served
  const testResult = exec('curl -I http://localhost/procurement/login 2>/dev/null | grep "Content-Length"', { ignoreErrors: true });
  if (testResult && testResult.includes('21512')) {
    log('\n❌ CONFIRMED ISSUE: /procurement/login returns wrong file', colors.red);
    log('   Expected: 1291 bytes (procurement index.html)', colors.red);
    log('   Actual: 21512 bytes (/var/www/html/index.html)', colors.red);

    log('\n💡 Possible causes:', colors.yellow);
    log('   1. Nginx try_files fallback is resolving to wrong location', colors.white);
    log('   2. The /procurement location is not matching correctly', colors.white);
    log('   3. The fallback path in try_files needs to be absolute', colors.white);

    log('\n🔧 Recommended fix:', colors.green);
    log('   Use root + symlink approach instead of alias directive', colors.green);
  } else if (testResult && testResult.includes('1291')) {
    log('\n✓ Good news! /procurement/login is serving the correct file', colors.green);
  }
}

function provideSolution() {
  section('PROPOSED SOLUTION');

  log('\nTo fix the issue, run these commands:\n', colors.yellow);

  const solution = `
# Create symlink
sudo ln -sf /var/www/OpenGISData-Thailand/procurement-system/client/dist /var/www/html/procurement

# Update Nginx config
sudo tee /etc/nginx/sites-available/procurement > /dev/null <<'EOF'
server {
    listen 80 default_server;
    server_name 202.29.4.66 49.231.27.66 _;

    root /var/www/html;

    # API proxy
    location ^~ /procurement/api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\$host;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\$scheme;
        proxy_cache_bypass \\$http_upgrade;
    }

    # Procurement frontend
    location /procurement/ {
        try_files \\$uri \\$uri/ /procurement/index.html;
    }

    # Redirect /procurement to /procurement/
    location = /procurement {
        return 301 /procurement/;
    }

    # Default location
    location / {
        try_files \\$uri \\$uri/ =404;
    }
}
EOF

# Test and reload Nginx
sudo nginx -t && sudo nginx -s reload

# Test the fix
curl -I http://localhost/procurement/login
`;

  log(solution, colors.cyan);
}

// Main execution
function main() {
  log('\n' + '='.repeat(70), colors.bright + colors.blue);
  log('Nginx Procurement System Diagnostic Tool', colors.bright + colors.blue);
  log('='.repeat(70) + '\n', colors.bright + colors.blue);

  try {
    checkNginxConfig();
    checkLoginFiles();
    testRequest();
    checkAccessLog();
    findIndexFiles();
    checkSymlinks();
    checkPathResolution();
    analyzeIssue();
    provideSolution();

    log('\n' + '='.repeat(70), colors.green);
    log('✓ Diagnostic Complete', colors.bright + colors.green);
    log('='.repeat(70) + '\n', colors.green);
  } catch (error) {
    log(`\n❌ Diagnostic failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

main();
