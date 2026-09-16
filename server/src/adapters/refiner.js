import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const BLENDER_BIN = process.env.BLENDER_PATH || 'blender';
const REFINE_SCRIPT = path.join(process.cwd(), 'scripts', 'refine_mesh.py');
const WORK_ROOT = path.join(os.tmpdir(), 'synthetix-refine');

export const refinerReady = existsSync(REFINE_SCRIPT);

async function downloadGLB(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Download failed: ' + res.status);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(destPath, buf);
  return destPath;
}

export function refineMesh(inputGlbPath, outputDir, seedColor) {
  return new Promise((resolve, reject) => {
    if (!refinerReady) return reject(new Error('refine_mesh.py not found'));
    const args = ['--background', '--python', REFINE_SCRIPT, '--', inputGlbPath, outputDir];
    if (seedColor) args.push(seedColor);
    const child = spawn(BLENDER_BIN, args);
    let stdout = '', stderr = '';
    child.stdout.on('data', d => { stdout += d.toString(); });
    child.stderr.on('data', d => { stderr += d.toString(); });
    const t = setTimeout(() => { child.kill('SIGKILL'); reject(new Error('Refine timeout')); }, 90000);
    child.on('close', code => {
      clearTimeout(t);
      if (code !== 0) return reject(new Error('Blender refine exit ' + code + ': ' + stderr.slice(-300)));
      const lines = stdout.split('\n').filter(Boolean).reverse();
      for (const line of lines) {
        const s = line.trim();
        if (s.startsWith('{') && s.endsWith('}')) {
          try { const r = JSON.parse(s); if (r.status === 'ok') return resolve(r); } catch {}
        }
      }
      reject(new Error('No JSON result from refine. stdout tail: ' + stdout.slice(-200)));
    });
    child.on('error', reject);
  });
}

export async function refineRemoteGLB(glbUrl, runId, seedColor) {
  const dir = path.join(WORK_ROOT, runId);
  await mkdir(dir, { recursive: true });
  const localPath = path.join(dir, 'draft.glb');
  await downloadGLB(glbUrl, localPath);
  const result = await refineMesh(localPath, dir, seedColor);
  return result.refined_glb;
}
