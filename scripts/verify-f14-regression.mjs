import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';

const root=process.cwd();
const master=path.join(root,'assets/math-art/F14-infrastructure-viability-geometry-v4.svg');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'f14-regression-'));
const generated=path.join(tmp,'F14.svg');
try {
  execFileSync(process.execPath,[path.join(root,'scripts/generate-f14.mjs'),generated],{stdio:'inherit'});
  const a=fs.readFileSync(master);
  const b=fs.readFileSync(generated);
  const sha=crypto.createHash('sha256').update(a).digest('hex');
  if (!a.equals(b)) {
    console.error('FAIL F14: regenerated SVG differs byte-for-byte from committed master');
    process.exit(1);
  }
  console.log(`PASS F14 deterministic regeneration sha256=${sha}`);
} finally {
  fs.rmSync(tmp,{recursive:true,force:true});
}
