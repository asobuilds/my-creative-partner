import { spawn } from 'node:child_process';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const BLENDER_BIN = process.env.BLENDER_PATH || 'blender';
const SCRIPT_PATH = process.env.BLENDER_SCRIPT || path.join(process.cwd(), 'scripts', 'build_scene.py');
const RENDER_ROOT = process.env.BLENDER_OUTPUT_PATH || path.join(os.tmpdir(), 'synthetix-renders');

export const blenderReady = existsSync(SCRIPT_PATH);

export function buildScene(spec, jobId) {
  return new Promise(async (resolve, reject) => {
    if (!blenderReady) return reject(new Error('Blender script missing at ' + SCRIPT_PATH));
    const jobDir = path.join(RENDER_ROOT, jobId);
    await mkdir(jobDir, { recursive: true });
    const specPath = path.join(jobDir, 'spec.json');
    await writeFile(specPath, JSON.stringify(spec, null, 2), 'utf8');

    const child = spawn(BLENDER_BIN, ['--background', '--python', SCRIPT_PATH, '--', specPath, jobDir], {
      env: { ...process.env, BLENDER_OUTPUT_PATH: jobDir },
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });

    const timeout = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error('Blender timeout after 180s'));
    }, 180000);

    child.on('close', (code) => {
      clearTimeout(timeout);
      if (code !== 0) return reject(new Error('Blender exited ' + code + ': ' + stderr.slice(-400)));
      const lines = stdout.split('\n').filter(Boolean);
      let result = null;
      for (const line of lines.reverse()) {
        const t = line.trim();
        if (t.startsWith('{') && t.endsWith('}')) {
          try { result = JSON.parse(t); break; } catch (e) {}
        }
      }
      if (!result || result.status !== 'ok') return reject(new Error('Blender no result: ' + stdout.slice(-300)));
      resolve({ preview: result.preview, glb: result.glb, objects: result.objects, jobDir });
    });

    child.on('error', reject);
  });
}

export function checkBlenderVersion() {
  return new Promise((resolve) => {
    const child = spawn(BLENDER_BIN, ['--version']);
    let out = '';
    child.stdout.on('data', (d) => { out += d.toString(); });
    child.on('close', () => resolve(out.split('\n')[0]));
    child.on('error', () => resolve(null));
  });
}
