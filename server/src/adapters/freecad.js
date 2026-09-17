/**
 * FreeCAD headless adapter for STL generation.
 * Requires: `freecadcmd` binary (part of FreeCAD install).
 */
import { spawn } from 'node:child_process';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const FREECAD_BIN = process.env.FREECAD_PATH || 'freecadcmd';
const WORK = path.join(os.tmpdir(), 'synthetix-freecad');
if (!existsSync(WORK)) { try { await mkdir(WORK, { recursive: true }); } catch {} }

export const freecadReady = await new Promise((resolve) => {
  const c = spawn(FREECAD_BIN, ['--version']);
  c.on('error', () => resolve(false));
  c.on('close', (code) => resolve(code === 0));
});

export function generateBoxSTL({ width = 20, height = 20, depth = 20, jobId }) {
  return new Promise((resolve, reject) => {
    if (!freecadReady) return reject(new Error('FreeCAD not installed'));
    const jobDir = path.join(WORK, jobId || ('job-' + Date.now()));
    mkdir(jobDir, { recursive: true }).then(() => {
      const script = `import Part\nbox = Part.makeBox(${width}, ${height}, ${depth})\nbox.exportStl("${jobDir}/out.stl")\n`;
      const scriptPath = path.join(jobDir, 'gen.py');
      writeFile(scriptPath, script).then(() => {
        const child = spawn(FREECAD_BIN, [scriptPath]);
        let err = '';
        child.stderr.on('data', (d) => { err += d; });
        child.on('close', (code) => {
          if (code !== 0) return reject(new Error('FreeCAD ' + code + ': ' + err.slice(-200)));
          resolve({ stlPath: path.join(jobDir, 'out.stl'), url: '/stl/' + path.basename(jobDir) + '/out.stl' });
        });
        child.on('error', reject);
      });
    });
  });
}
