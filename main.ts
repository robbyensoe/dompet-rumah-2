// DompetRumah — the hand-in program (Node 22, standard library only).
//
// It copies app/ and screenshots/ from beside this file into the output
// directory and writes /output/dossier.json with the vendored make.fun
// library, exactly as the kit's starter does. Before it builds anything it
// checks the entry against the scorer's caps, and after writing the dossier
// it reads the file back and confirms the image count matches the shots on
// disk, so a bad hand-in fails here instead of on the server.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const MAX_SHOT_BYTES = 262144;
const MAX_SHOTS = 4;
const MIN_SHOTS = 3;

function fail(message) {
  throw new Error(`DompetRumah hand-in refused: ${message}`);
}

function shotFiles() {
  const dir = join(here, 'screenshots');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => !name.startsWith('.'))
    .filter((name) => /\.(png|jpe?g)$/i.test(name))
    .sort();
}

// Pre-flight: the scorer's own limits, checked before any bytes are written.
function preflight() {
  const index = join(here, 'app', 'index.html');
  if (!existsSync(index)) fail('app/index.html is missing');
  if (statSync(index).size > 1048576) fail('app/index.html is over 1 MiB');
  const shots = shotFiles();
  if (shots.length < MIN_SHOTS || shots.length > MAX_SHOTS) {
    fail(`screenshots/ holds ${shots.length} images, need ${MIN_SHOTS} to ${MAX_SHOTS}`);
  }
  for (const name of shots) {
    const file = join(here, 'screenshots', name);
    const size = statSync(file).size;
    if (size > MAX_SHOT_BYTES) fail(`${name} is ${size} bytes, over the 256 KiB cap`);
    // A whole JPEG or PNG, by its magic bytes — a truncated or renamed file fails here.
    const head = readFileSync(file).subarray(0, 8);
    const isJpeg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
    const isPng = head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47;
    if (!isJpeg && !isPng) fail(`${name} is not a whole JPEG or PNG file`);
  }
  return shots;
}

preflight();

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// buildDossier returns the dossier's bytes. Write those bytes as they are:
// stringifying a Uint8Array would turn it into a dictionary of byte values.
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: MAX_SHOTS, max_bytes: MAX_SHOT_BYTES },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(out, 'dossier.json'), dossier);

// Read the dossier back and confirm it describes the shots we shipped.
const parsed = JSON.parse(readFileSync(join(out, 'dossier.json'), 'utf8'));
const expected = shotFiles().length;
if (!Array.isArray(parsed.images) || parsed.images.length !== expected) {
  fail(`dossier lists ${parsed.images?.length ?? 0} images, disk holds ${expected}`);
}
if (typeof parsed.cover !== 'number' || parsed.cover < 0 || parsed.cover >= expected) {
  fail(`dossier cover index ${parsed.cover} is outside 0..${expected - 1}`);
}

console.log(`DompetRumah: ${expected} screenshots, dossier ${dossier.length} bytes, cover ${parsed.cover}`);
