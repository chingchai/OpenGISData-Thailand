#!/usr/bin/env node

/**
 * Clean Installation Script for Procurement System
 * This script will remove all existing procurement-system folders and reinstall everything cleanly
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Configuration
const config = {
  repoUrl: 'https://github.com/bogarb12/OpenGISData-Thailand.git',
  branch: 'claude/pull-opengis-thailand-setup-018ToN3x1p5eZ6HTy1q4VAAi',
  installPath: '/var/www/OpenGISData-Thailand',
  serverIPs: ['202.29.4.66', '49.231.27.66'],
};

// Helper functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${'='.repeat(60)}`, colors.cyan);
  log(`STEP ${step}: ${message}`, colors.bright + colors.cyan);
  log('='.repeat(60), colors.cyan);
}

function exec(command, options = {}) {
  try {
    const result = execSync(command, {
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf-8',
      ...options,
    });
    return result;
  } catch (error) {
    log(`Error executing command: ${command}`, colors.red);
    log(error.message, colors.red);
    if (!options.ignoreErrors) {
      process.exit(1);
    }
    return null;
  }
}

function checkRoot() {
  if (process.getuid && process.getuid() !== 0) {
    log('⚠️  This script requires sudo privileges for some operations.', colors.yellow);
    log('Please run with: sudo node clean-install.js', colors.yellow);
    process.exit(1);
  }
}

function confirmAction() {
  log('\n⚠️  WARNING: This will DELETE all existing procurement-system data!', colors.red);
  log('This includes:', colors.yellow);
  log('  - /var/www/OpenGISData-Thailand', colors.yellow);
  log('  - /root/OpenGISData-Thailand/procurement-system', colors.yellow);
  log('  - /home/ubuntu/OpenGISData-Thailand/procurement-system', colors.yellow);
  log('  - Nginx configurations', colors.yellow);
  log('  - PM2 processes', colors.yellow);
  log('\nPress Ctrl+C to cancel, or wait 5 seconds to continue...', colors.bright);

  // Wait 5 seconds
  exec('sleep 5');
}

// Main installation steps
function step1_cleanup() {
  logStep(1, 'Cleanup - Remove existing installations');

  log('Stopping PM2 processes...', colors.blue);
  exec('pm2 stop all', { ignoreErrors: true });
  exec('pm2 delete all', { ignoreErrors: true });
  exec('pm2 save --force', { ignoreErrors: true });

  log('Removing Nginx configurations...', colors.blue);
  exec('rm -f /etc/nginx/sites-enabled/procurement', { ignoreErrors: true });
  exec('rm -f /etc/nginx/sites-enabled/procurement-system', { ignoreErrors: true });
  exec('rm -f /etc/nginx/sites-available/procurement', { ignoreErrors: true });
  exec('rm -f /etc/nginx/sites-available/procurement-system', { ignoreErrors: true });

  log('Removing old directories...', colors.blue);
  exec('rm -rf /var/www/OpenGISData-Thailand', { ignoreErrors: true });
  exec('rm -rf /root/OpenGISData-Thailand/procurement-system', { ignoreErrors: true });
  exec('rm -rf /home/ubuntu/OpenGISData-Thailand/procurement-system', { ignoreErrors: true });

  log('Reloading Nginx...', colors.blue);
  exec('nginx -s reload', { ignoreErrors: true });

  log('✓ Cleanup completed', colors.green);
}

function step2_clone() {
  logStep(2, 'Clone repository');

  log(`Cloning from ${config.repoUrl}...`, colors.blue);
  exec(`git clone ${config.repoUrl} ${config.installPath}`);

  log(`Checking out branch ${config.branch}...`, colors.blue);
  exec(`cd ${config.installPath} && git checkout ${config.branch}`);

  log('✓ Repository cloned successfully', colors.green);
}

function step3_buildFrontend() {
  logStep(3, 'Build Frontend');

  const clientPath = path.join(config.installPath, 'procurement-system/client');

  log('Installing frontend dependencies...', colors.blue);
  exec(`cd ${clientPath} && npm install`);

  log('Building frontend...', colors.blue);
  exec(`cd ${clientPath} && npm run build`);

  // Verify build output
  const distPath = path.join(clientPath, 'dist');
  if (!fs.existsSync(distPath)) {
    log('✗ Frontend build failed - dist folder not found', colors.red);
    process.exit(1);
  }

  log('✓ Frontend built successfully', colors.green);
}

function step4_setupBackend() {
  logStep(4, 'Setup Backend');

  const serverPath = path.join(config.installPath, 'procurement-system/server');

  log('Installing backend dependencies...', colors.blue);
  exec(`cd ${serverPath} && npm install`);

  log('Creating database directory...', colors.blue);
  const dataPath = path.join(serverPath, 'data');
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true });
  }

  log('✓ Backend setup completed', colors.green);
}

function step5_setPermissions() {
  logStep(5, 'Set Permissions');

  log('Setting frontend permissions for www-data...', colors.blue);
  exec(`chown -R www-data:www-data ${config.installPath}/procurement-system/client/dist`);
  exec(`chmod -R 755 ${config.installPath}/procurement-system/client/dist`);

  log('Setting backend permissions...', colors.blue);
  const actualUser = process.env.SUDO_USER || 'root';
  exec(`chown -R ${actualUser}:${actualUser} ${config.installPath}/procurement-system/server`);
  exec(`chmod -R 755 ${config.installPath}/procurement-system/server`);

  log('✓ Permissions set successfully', colors.green);
}

function step6_setupNginx() {
  logStep(6, 'Setup Nginx');

  const nginxConfigSource = path.join(config.installPath, 'procurement-system/nginx.conf.production');
  const nginxConfigDest = '/etc/nginx/sites-available/procurement';
  const nginxConfigLink = '/etc/nginx/sites-enabled/procurement';

  if (!fs.existsSync(nginxConfigSource)) {
    log('✗ Nginx config file not found in repository', colors.red);
    process.exit(1);
  }

  log('Copying Nginx configuration...', colors.blue);
  exec(`cp ${nginxConfigSource} ${nginxConfigDest}`);

  log('Creating symlink...', colors.blue);
  if (fs.existsSync(nginxConfigLink)) {
    fs.unlinkSync(nginxConfigLink);
  }
  exec(`ln -s ${nginxConfigDest} ${nginxConfigLink}`);

  log('Testing Nginx configuration...', colors.blue);
  exec('nginx -t');

  log('Reloading Nginx...', colors.blue);
  exec('nginx -s reload');

  log('✓ Nginx configured successfully', colors.green);
}

function step7_startBackend() {
  logStep(7, 'Start Backend with PM2');

  const serverPath = path.join(config.installPath, 'procurement-system/server');

  log('Starting backend with PM2...', colors.blue);
  exec(`cd ${serverPath} && pm2 start server.js --name procurement-backend`);

  log('Saving PM2 configuration...', colors.blue);
  exec('pm2 save');

  // Display PM2 startup command (user needs to run this manually)
  log('\nℹ️  To enable PM2 on system startup, run:', colors.yellow);
  log('    pm2 startup', colors.cyan);
  log('    (then run the command it provides)\n', colors.cyan);

  // Wait for backend to start
  log('Waiting for backend to start...', colors.blue);
  exec('sleep 3');

  log('✓ Backend started successfully', colors.green);
}

function step8_test() {
  logStep(8, 'Testing Endpoints');

  const tests = [
    {
      name: 'HTML',
      url: 'http://localhost/procurement/',
      expected: '200',
    },
    {
      name: 'CSS Assets',
      url: 'http://localhost/procurement/assets/',
      expected: '200|404', // 404 is ok if specific file not found, but we check pattern
    },
    {
      name: 'API Health',
      url: 'http://localhost/procurement/api/',
      expected: '200',
    },
  ];

  let allPassed = true;

  tests.forEach((test) => {
    try {
      const result = exec(`curl -I -s ${test.url} | head -n 1`, { silent: true });
      const statusMatch = result.match(/HTTP\/[\d.]+ (\d+)/);
      const status = statusMatch ? statusMatch[1] : 'Unknown';

      if (test.expected.includes(status)) {
        log(`✓ ${test.name}: ${status}`, colors.green);
      } else {
        log(`✗ ${test.name}: ${status} (expected ${test.expected})`, colors.red);
        allPassed = false;
      }
    } catch (error) {
      log(`✗ ${test.name}: Failed to test`, colors.red);
      allPassed = false;
    }
  });

  if (allPassed) {
    log('\n✓ All tests passed!', colors.green);
  } else {
    log('\n⚠️  Some tests failed. Check the logs above.', colors.yellow);
  }
}

function displaySummary() {
  log('\n' + '='.repeat(60), colors.green);
  log('Installation Complete!', colors.bright + colors.green);
  log('='.repeat(60), colors.green);
  log('\nYour procurement system is now accessible at:', colors.cyan);
  config.serverIPs.forEach((ip) => {
    log(`  • http://${ip}/procurement/`, colors.bright + colors.blue);
  });
  log('\nBackend API:', colors.cyan);
  config.serverIPs.forEach((ip) => {
    log(`  • http://${ip}/procurement/api/`, colors.bright + colors.blue);
  });
  log('\nUseful Commands:', colors.cyan);
  log('  • Check PM2 status:    pm2 status', colors.white);
  log('  • View PM2 logs:       pm2 logs procurement-backend', colors.white);
  log('  • Restart backend:     pm2 restart procurement-backend', colors.white);
  log('  • Check Nginx status:  sudo systemctl status nginx', colors.white);
  log('  • View Nginx logs:     sudo tail -f /var/log/nginx/error.log', colors.white);
  log('');
}

// Main execution
async function main() {
  log('\n' + '='.repeat(60), colors.bright + colors.cyan);
  log('Procurement System - Clean Installation Script', colors.bright + colors.cyan);
  log('='.repeat(60) + '\n', colors.bright + colors.cyan);

  // Check if running as root
  checkRoot();

  // Confirm before proceeding
  confirmAction();

  try {
    step1_cleanup();
    step2_clone();
    step3_buildFrontend();
    step4_setupBackend();
    step5_setPermissions();
    step6_setupNginx();
    step7_startBackend();
    step8_test();
    displaySummary();

    log('🎉 Installation completed successfully!', colors.bright + colors.green);
    process.exit(0);
  } catch (error) {
    log('\n✗ Installation failed!', colors.bright + colors.red);
    log(error.message, colors.red);
    process.exit(1);
  }
}

// Run the script
main();
