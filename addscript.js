require('dotenv').config();
const { execSync } = require('child_process');
const { userInfo } = require('os');

const path = 'node_modules/office-addin-sso/lib/scripts/addAppSecret.ps1';
const appName = 'testingsso';
const user = userInfo().username;
const secret = process.env.CLIENT_SECRET;

execSync(
    `powershell -ExecutionPolicy Bypass -File "${path}" "${appName}" "${user}" "${secret}"`, { stdio: 'pipe' }
);