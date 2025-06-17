#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Lancer Vite depuis le dossier client
const viteProcess = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5173'], {
  cwd: join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true
});

viteProcess.on('close', (code) => {
  console.log(`Vite process exited with code ${code}`);
});

viteProcess.on('error', (err) => {
  console.error('Failed to start Vite:', err);
});

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  viteProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  viteProcess.kill('SIGTERM');
  process.exit(0);
});