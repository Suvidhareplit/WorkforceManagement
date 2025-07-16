#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Start backend server
const backend = spawn('tsx', ['server/index.ts'], {
  cwd: __dirname,
  env: { ...process.env, NODE_ENV: 'development' },
  stdio: 'inherit'
});

// Start frontend server
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: join(__dirname, 'client'),
  stdio: 'inherit'
});

// Handle process termination
process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});

console.log('Starting HRMS development servers...');
console.log('Backend API: http://localhost:5000');
console.log('Frontend: http://localhost:3000');