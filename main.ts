import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildDossier } from "./vendor/makefun-frontend.ts";

// DompetRumah — the hand-in. The site itself is the static files under
// app/ (open app/index.html through serve.ts); this program copies app/
// and screenshots/ into the output directory and writes the dossier that
// describes them, exactly as the kit's harness prescribes.
// buildDossier returns the dossier file's bytes directly.
//
//   MAKEFUN_OUTPUT_DIR=out node main.ts      (or: node main.ts, writes /output)
//
// Before building, the program refuses early — with the reason named —
// when the hand-in would fail the scorer's own caps: app/index.html
// missing, the wrong number of screenshots, or a screenshot over 256 KiB.
// Catching that here beats a silent invalid entry on the grader.

const out = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const here = new URL(".", import.meta.url).pathname;
const SHOT_MAX_BYTES = 262144;

const appIndex = join(here, "app", "index.html");
if (!existsSync(appIndex)) throw new Error(`refusing: ${appIndex} is missing`);

const shotDir = join(here, "screenshots");
const shots = readdirSync(shotDir).filter((f) => !f.startsWith("."));
if (shots.length < 3 || shots.length > 4) {
  throw new Error(`refusing: ${shots.length} screenshots, the gate wants 3 or 4`);
}
for (const shot of shots) {
  const size = statSync(join(shotDir, shot)).size;
  if (size > SHOT_MAX_BYTES) {
    throw new Error(`refusing: screenshots/${shot} is ${size} bytes, over the 262144 cap`);
  }
}

mkdirSync(out, { recursive: true });
cpSync(join(here, "app"), join(out, "app"), { recursive: true });
mkdirSync(join(out, "screenshots"), { recursive: true });
cpSync(join(here, "screenshots"), join(out, "screenshots"), { recursive: true });

// The scorer's own caps, as the starter's main.ts passes them: only
// text_max_bytes shapes the bytes; the others refuse an entry the scorer
// would refuse (more than 4 screenshots or one over 256 KiB; more than 993
// files and directories in app/ or 16 MiB of app files).
const dossier = buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 });
writeFileSync(join(out, "dossier.json"), dossier);

// A quick read-back: the dossier must parse, and its image count must
// match the screenshots that were just handed in. (A Uint8Array's own
// toString would give comma-joined bytes, so decode it properly first.)
const parsed = JSON.parse(new TextDecoder().decode(dossier));
if (!Array.isArray(parsed.images) || parsed.images.length !== shots.length) {
  throw new Error(`refusing: dossier holds ${parsed.images?.length ?? 0} images for ${shots.length} screenshots`);
}

console.log(`dompetrumah: app/ and ${shots.length} screenshots handed in, dossier.json (${dossier.length} bytes, ${parsed.images.length} images) written to ${out}`);
