#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { basename, extname, dirname, join } from 'path';

const [mine, ref] = process.argv.slice(2);
if (!mine || !ref) {
  console.error('Usage: pnpm diff <mine.png> <reference.png>');
  process.exit(1);
}

const img1 = PNG.sync.read(readFileSync(mine));
const img2 = PNG.sync.read(readFileSync(ref));

if (img1.width !== img2.width || img1.height !== img2.height) {
  console.error(`Size mismatch: ${img1.width}×${img1.height} vs ${img2.width}×${img2.height}`);
  process.exit(1);
}

const { width, height } = img1;
const diff = new PNG({ width, height });

const numDiff = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });
const pct = ((numDiff / (width * height)) * 100).toFixed(2);

const diffPath = join(dirname(mine), basename(mine, extname(mine)) + '-diff.png');
writeFileSync(diffPath, PNG.sync.write(diff));

const ok = parseFloat(pct) <= 1;
console.log(`${ok ? '✓' : '⚠'} ${pct}% different (${numDiff}/${width * height} px)`);
console.log(`  mine : ${mine}`);
console.log(`  ref  : ${ref}`);
console.log(`  diff : ${diffPath}`);
process.exit(ok ? 0 : 1);
