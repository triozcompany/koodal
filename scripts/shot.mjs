#!/usr/bin/env node
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const [route = '/', size = '390x844'] = process.argv.slice(2);
const [width, height] = size.split('x').map(Number);

if (!width || !height) {
  console.error('Usage: pnpm shot <route> <WxH>   e.g. pnpm shot / 390x844');
  process.exit(1);
}

const base = process.env.SHOT_BASE_URL || 'http://localhost:3000';
const url = base + (route.startsWith('/') ? route : '/' + route);
const slug = route.replace(/^\/+/, '').replace(/\//g, '__') || 'home';
const outDir = 'screenshots/my';
mkdirSync(outDir, { recursive: true });
const out = join(outDir, `${slug}-${size}.png`);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height } });

await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
// Wait for the loading spinner to disappear (citizen app shows one while Firestore connects)
await page.waitForTimeout(1800);

await page.screenshot({ path: out, clip: { x: 0, y: 0, width, height } });
await browser.close();

console.log(`Saved: ${out}  (${width}×${height})`);
