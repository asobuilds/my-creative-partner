/**
 * GIMP headless adapter — image manipulation via Script-Fu/Python-Fu.
 * Requires: `gimp` binary in PATH.
 */
import { spawn } from 'node:child_process';
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const GIMP_BIN = process.env.GIMP_PATH || 'gimp';
const WORK = path.join(os.tmpdir(), 'synthetix-gimp');
if (!existsSync(WORK)) { try { await mkdir(WORK, { recursive: true }); } catch {} }

export const gimpReady = await new Promise((resolve) => {
  const c = spawn(GIMP_BIN, ['--version']);
  c.on('error', () => resolve(false));
  c.on('close', (code) => resolve(code === 0));
});

/**
 * Run a GIMP Script-Fu command on an image.
 */
export function runGimpScript(scriptPath) {
  return new Promise((resolve, reject) => {
    if (!gimpReady) return reject(new Error('GIMP not installed'));
    const child = spawn(GIMP_BIN, ['-i', '-b', '(load "' + scriptPath + '")', '-b', '(gimp-quit 0)']);
    let out = '', err = '';
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { err += d; });
    child.on('close', (code) => {
      if (code !== 0) reject(new Error('GIMP exit ' + code + ': ' + err.slice(-300)));
      else resolve(out);
    });
    child.on('error', reject);
  });
}
