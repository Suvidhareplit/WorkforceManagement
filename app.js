#!/usr/bin/env node

import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Blue Collar HRMS Platform...\n');

// Function to kill processes on specific ports
function killPortProcess(port) {
  return new Promise((resolve) => {
    console.log(`🔍 Checking for existing processes on port ${port}...`);
    
    // Use multiple methods to find and kill processes
    const commands = [
      `lsof -ti :${port}`,
      `netstat -tulpn 2>/dev/null | grep :${port} | awk '{print $7}' | cut -d'/' -f1`,
      `ss -tulpn 2>/dev/null | grep :${port} | awk '{print $6}' | cut -d',' -f2 | cut -d'=' -f2`
    ];
    
    let foundPids = new Set();
    let completedCommands = 0;
    
    commands.forEach(cmd => {
      const findProcess = spawn('sh', ['-c', cmd]);
      let pids = '';
      
      findProcess.stdout.on('data', (data) => {
        pids += data.toString();
      });
      
      findProcess.on('close', () => {
        if (pids.trim()) {
          const pidList = pids.trim().split('\n').filter(pid => pid && !isNaN(pid));
          pidList.forEach(pid => foundPids.add(parseInt(pid)));
        }
        
        completedCommands++;
        if (completedCommands === commands.length) {
          // All commands completed, now kill found processes
          if (foundPids.size > 0) {
            console.log(`⚡ Found ${foundPids.size} process(es) on port ${port}, killing...`);
            
            foundPids.forEach(pid => {
              try {
                process.kill(pid, 'SIGTERM');
                console.log(`✅ Killed process ${pid} on port ${port}`);
                // Also try SIGKILL as backup
                setTimeout(() => {
                  try {
                    process.kill(pid, 'SIGKILL');
                  } catch (e) {
                    // Process already dead, ignore
                  }
                }, 500);
              } catch (error) {
                console.log(`⚠️  Process ${pid} already terminated or not accessible`);
              }
            });
            
            // Wait longer for processes to terminate
            setTimeout(resolve, 2000);
          } else {
            console.log(`✅ Port ${port} is free`);
            resolve();
          }
        }
      });
      
      findProcess.on('error', () => {
        completedCommands++;
        if (completedCommands === commands.length) {
          if (foundPids.size === 0) {
            console.log(`✅ Port ${port} is free`);
            resolve();
          }
        }
      });
    });
  });
}

// Kill existing processes on required ports
async function startPlatform() {
  console.log('🧹 Cleaning up existing processes...');
  await killPortProcess(5000); // Backend port
  await killPortProcess(3000); // Frontend port
  console.log('✅ Port cleanup complete\n');

  // Check if required directories exist
  const serverDir = join(__dirname, 'server');
  const clientDir = join(__dirname, 'client');

  if (!existsSync(serverDir)) {
    console.error('❌ Server directory not found!');
    process.exit(1);
  }

  if (!existsSync(clientDir)) {
    console.error('❌ Client directory not found!');
    process.exit(1);
  }

  // Function to start a process with colored output
  function startProcess(name, command, args, cwd, color) {
    const colorCodes = {
      blue: '\x1b[34m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      red: '\x1b[31m',
      reset: '\x1b[0m'
    };

    console.log(`🔧 Starting ${name}...`);
    
    const process = spawn(command, args, { 
      cwd, 
      stdio: 'pipe',
      shell: true 
    });

    // Handle stdout with colored prefix
    process.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        console.log(`${colorCodes[color]}[${name}]${colorCodes.reset} ${line}`);
      });
    });

    // Handle stderr with colored prefix
    process.stderr.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        console.log(`${colorCodes[color]}[${name} ERROR]${colorCodes.reset} ${line}`);
      });
    });

    // Handle process exit
    process.on('close', (code) => {
      if (code !== 0) {
        console.log(`${colorCodes.red}❌ ${name} exited with code ${code}${colorCodes.reset}`);
      }
    });

    return process;
  }

  // Start backend server (port 5000)
  const backendProcess = startProcess(
    'Backend Server',
    'npm',
    ['run', 'dev'],
    serverDir,
    'blue'
  );

  // Wait a bit for backend to start, then start frontend
  setTimeout(() => {
    // Start frontend server (port 3000)
    const frontendProcess = startProcess(
      'Frontend Server',
      'npm',
      ['run', 'dev'],
      clientDir,
      'green'
    );

    // Display startup information
    setTimeout(() => {
      console.log('\n============================================================');
      console.log('🎉 Blue Collar HRMS Platform is running!');
      console.log('============================================================');
      console.log('📱 Frontend: http://localhost:3000');
      console.log('🔧 Backend:  http://localhost:5000');
      console.log('🗄️  Database: MySQL (hrms_db)');
      console.log('============================================================');
      console.log('💡 Press Ctrl+C to stop all servers');
      console.log('============================================================');
    }, 2000);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down servers...');
      backendProcess.kill('SIGTERM');
      frontendProcess.kill('SIGTERM');
      setTimeout(() => {
        console.log('✅ All servers stopped.');
        process.exit(0);
      }, 1000);
    });

  }, 2000);
}

// Start the platform
startPlatform().catch(console.error);
