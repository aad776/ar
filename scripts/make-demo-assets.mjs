// Generates the bundled demo media (illustrated "memories", cover art and a
// music-box rendition of "Happy Birthday" — public domain melody).
// Run: node scripts/make-demo-assets.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const out = join(process.cwd(), "public", "demo");
mkdirSync(out, { recursive: true });

const W = 800;
const H = 1000;
const svg = (body, defs = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs>${defs}</defs>${body}</svg>`;

const heart = (x, y, s, fill, op = 1) =>
  `<path transform="translate(${x} ${y}) scale(${s})" fill="${fill}" opacity="${op}" d="M0 6C-6-6-22-4-22 8c0 10 12 18 22 26C10 26 22 18 22 8 22-4 6-6 0 6z"/>`;
const sparkle = (x, y, s, fill, op = 1) =>
  `<path transform="translate(${x} ${y}) scale(${s})" fill="${fill}" opacity="${op}" d="M0-20C2-6 6-2 20 0 6 2 2 6 0 20-2 6-6 2-20 0-6-2-2-6 0-20z"/>`;
const grain = `<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.4  0 0 0 0 0.45  0 0 0 0.07 0"/></filter>`;
const grainRect = `<rect width="100%" height="100%" filter="url(#grain)"/>`;

const files = {
  "sunset-beach.svg": svg(
    `<rect width="800" height="1000" fill="url(#sky)"/>
     <circle cx="400" cy="560" r="150" fill="url(#sun)"/>
     <rect y="600" width="800" height="400" fill="url(#sea)"/>
     ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${250 - i * 18}" y="${630 + i * 34}" width="${300 + i * 36}" height="6" rx="3" fill="#fff" opacity="${0.5 - i * 0.07}"/>`).join("")}
     <path d="M0 860 Q200 820 400 860 T800 860 V1000 H0z" fill="#ffe3c4"/>
     <g transform="translate(330 760)"><circle cx="0" cy="0" r="22" fill="#6b3a4e"/><rect x="-18" y="18" width="36" height="70" rx="16" fill="#6b3a4e"/></g>
     <g transform="translate(400 770)"><circle cx="0" cy="0" r="20" fill="#7a4560"/><path d="M-22 18h44l10 68h-64z" fill="#7a4560"/></g>
     ${heart(366, 700, 1.1, "#ff7aa8")}
     ${sparkle(120, 180, 1.2, "#fff", 0.9)}${sparkle(650, 120, 0.8, "#fff", 0.8)}${sparkle(700, 300, 0.6, "#fff", 0.7)}
     ${grainRect}`,
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9a4ff"/><stop offset=".45" stop-color="#ffb0c8"/><stop offset=".75" stop-color="#ffcfa6"/></linearGradient>
     <radialGradient id="sun"><stop offset="0" stop-color="#fff6d8"/><stop offset=".6" stop-color="#ffd59a"/><stop offset="1" stop-color="#ffb38a" stop-opacity="0"/></radialGradient>
     <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9fb9"/><stop offset="1" stop-color="#9c86e8"/></linearGradient>${grain}`
  ),
  "coffee-chats.svg": svg(
    `<rect width="800" height="1000" fill="#f8e6d8"/>
     <rect y="560" width="800" height="440" fill="#e9c8ad"/>
     <rect y="560" width="800" height="16" fill="#d8b294"/>
     <rect x="80" y="110" width="250" height="300" rx="16" fill="#ffd6e2"/><rect x="100" y="130" width="210" height="260" rx="10" fill="#fff4f7"/>
     ${heart(205, 240, 2.2, "#ff8fb4")}
     <g transform="translate(250 560)"><path d="M-110 -170h220l-20 170h-180z" fill="#fff"/><path d="M110 -140c60 0 60 80 0 80" stroke="#fff" stroke-width="22" fill="none"/><ellipse cx="0" cy="-170" rx="110" ry="18" fill="#a8704f"/><path d="M-30 -230c0-20 30-20 30-40M20 -230c0-20 30-20 30-40" stroke="#fff" stroke-width="8" stroke-linecap="round" fill="none" opacity=".8"/></g>
     <g transform="translate(560 560)"><path d="M-100 -150h200l-18 150h-164z" fill="#ffc8d8"/><path d="M100 -124c54 0 54 70 0 70" stroke="#ffc8d8" stroke-width="20" fill="none"/><ellipse cx="0" cy="-150" rx="100" ry="16" fill="#c98f6b"/>${heart(0, -155, 0.9, "#fff")}</g>
     <circle cx="660" cy="200" r="70" fill="#fff" opacity=".6"/><circle cx="700" cy="250" r="40" fill="#fff" opacity=".5"/>
     <g transform="translate(400 800)"><rect x="-160" y="-30" width="320" height="60" rx="30" fill="#fff" opacity=".7"/><text x="0" y="12" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="#a8546f">coffee &amp; chaos</text></g>
     ${grainRect}`,
    grain
  ),
  "picnic-day.svg": svg(
    `<rect width="800" height="1000" fill="url(#sky2)"/>
     <circle cx="640" cy="170" r="70" fill="#fff2b8"/>
     <path d="M0 520 Q200 440 420 500 T800 470 V1000 H0z" fill="#bfe6c9"/>
     <path d="M0 600 Q260 540 520 600 T800 590 V1000 H0z" fill="#a6dbb6"/>
     <g transform="translate(400 760) skewX(-12)"><rect x="-260" y="-120" width="520" height="260" fill="#fff"/>${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${-260 + i * 87}" y="-120" width="43" height="260" fill="#ff9fbd" opacity=".75"/>`).join("")}${[0, 1, 2].map((i) => `<rect x="-260" y="${-120 + i * 87}" width="520" height="43" fill="#ff9fbd" opacity=".45"/>`).join("")}</g>
     <g transform="translate(300 700)"><path d="M-60 0h120l-14 80h-92z" fill="#d79b6e"/><path d="M-50 0c0-60 100-60 100 0" stroke="#b97d52" stroke-width="10" fill="none"/></g>
     ${[[480, 700], [520, 720], [500, 680], [545, 690]].map(([x, y]) => `<g transform="translate(${x} ${y})"><path d="M0 -14c14 0 20 10 16 22-4 12-12 18-16 18s-12-6-16-18c-4-12 2-22 16-22z" fill="#ff5d7e"/><path d="M-8 -14l8 -8 8 8" stroke="#5fbf72" stroke-width="5" fill="none"/></g>`).join("")}
     ${[[120, 640], [690, 660], [200, 900], [620, 920]].map(([x, y]) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map((a) => `<ellipse rx="10" ry="18" cy="-16" transform="rotate(${a})" fill="#fff"/>`).join("")}<circle r="9" fill="#ffd166"/></g>`).join("")}
     ${grainRect}`,
    `<linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe8ff"/><stop offset="1" stop-color="#ffe6f0"/></linearGradient>${grain}`
  ),
  "city-lights.svg": svg(
    `<rect width="800" height="1000" fill="url(#night)"/>
     ${Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 197) % 800}" cy="${(i * 113) % 480}" r="${1 + (i % 3)}" fill="#fff" opacity="${0.3 + (i % 5) * 0.12}"/>`).join("")}
     <circle cx="620" cy="160" r="54" fill="#fff4d6"/><circle cx="645" cy="145" r="50" fill="#2a2060"/>
     ${[[40, 520, 110], [160, 440, 90], [260, 560, 120], [390, 400, 100], [500, 500, 130], [640, 450, 120]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="${1000 - y}" fill="#3a2b6e"/>${Array.from({ length: 12 }, (_, j) => `<rect x="${x + 14 + (j % 3) * (w / 3.4)}" y="${y + 24 + Math.floor(j / 3) * 46}" width="14" height="20" rx="3" fill="#ffd98a" opacity="${(j * 7 + x) % 3 ? 0.85 : 0.25}"/>`).join("")}`).join("")}
     <path d="M0 860 Q400 820 800 860 V1000 H0z" fill="#1d1640"/>
     ${Array.from({ length: 14 }, (_, i) => `<circle cx="${30 + i * 57}" cy="${300 + Math.sin(i / 2) * 30}" r="8" fill="${["#ffd98a", "#ff9fc4", "#c7b4ff"][i % 3]}" opacity=".9"/>`).join("")}
     <path d="M0 290 ${Array.from({ length: 15 }, (_, i) => `L${30 + i * 57} ${300 + Math.sin(i / 2) * 30}`).join(" ")}" stroke="#fff" stroke-opacity=".3" stroke-width="2" fill="none"/>
     ${grainRect}`,
    `<linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1446"/><stop offset=".6" stop-color="#4b2a74"/><stop offset="1" stop-color="#c06a9c"/></linearGradient>${grain}`
  ),
  "flower-market.svg": svg(
    `<rect width="800" height="1000" fill="#fff0f4"/>
     <circle cx="400" cy="420" r="320" fill="#ffe0ea"/>
     ${[[-120, 0, "#ff9fbd"], [0, -60, "#ffc2d6"], [120, 0, "#f7a8b8"], [-60, 90, "#d9b8ff"], [70, 100, "#ffd0a6"], [-170, 120, "#ffb3cb"], [180, 120, "#c9a7ff"]].map(([dx, dy, c]) => `<g transform="translate(${400 + dx} ${360 + dy})">${[0, 60, 120, 180, 240, 300].map((a) => `<ellipse rx="34" ry="52" cy="-44" transform="rotate(${a})" fill="${c}"/>`).join("")}<circle r="26" fill="#fff3c4"/></g>`).join("")}
     ${[-60, -20, 20, 60].map((dx) => `<path d="M${400 + dx * 2} 520 L${400 + dx / 2} 820" stroke="#7fbf8a" stroke-width="10"/>`).join("")}
     <path d="M250 560 L400 900 L550 560z" fill="#fff" stroke="#f3b4c8" stroke-width="6"/>
     <path d="M330 760 q70 -40 140 0" stroke="#f0619a" stroke-width="16" fill="none"/>
     <g transform="translate(400 770)"><path d="M0 0c-60-50-90 10-60 30 20 14 60-30 60-30zM0 0c60-50 90 10 60 30-20 14-60-30-60-30z" fill="#f0619a"/><circle r="12" fill="#d94a85"/></g>
     ${sparkle(120, 140, 1, "#f0619a", 0.5)}${sparkle(690, 860, 1.2, "#c9a7ff", 0.6)}
     ${grainRect}`,
    grain
  ),
  "ice-cream.svg": svg(
    `<rect width="800" height="1000" fill="url(#ic)"/>
     ${Array.from({ length: 30 }, (_, i) => `<circle cx="${(i * 233) % 800}" cy="${(i * 157) % 1000}" r="10" fill="#fff" opacity=".35"/>`).join("")}
     <g transform="translate(400 520)">
       <path d="M-120 60 L0 400 L120 60z" fill="#f2c08a"/>
       ${[-80, -40, 0, 40, 80].map((x) => `<path d="M${x - 40} 60 L${x + 60} 330" stroke="#d99a5f" stroke-width="6" opacity=".7"/>`).join("")}
       <circle cx="0" cy="-130" r="110" fill="#ffb3cb"/><circle cx="-80" cy="-10" r="100" fill="#fff1d6"/><circle cx="80" cy="-10" r="100" fill="#c9a7ff"/>
       <path d="M-180 40 q30 40 60 0 q30 40 60 0 q30 40 60 0 q30 40 60 0 q30 40 60 0 q30 40 60 0" fill="#ff8fb4"/>
       <circle cx="0" cy="-250" r="28" fill="#e2335e"/><path d="M0 -276 q10 -40 40 -50" stroke="#5fbf72" stroke-width="6" fill="none"/>
       ${[[-40, -150, "#fff"], [30, -110, "#ffd166"], [-110, -20, "#f0619a"], [60, -40, "#7cc6ff"], [100, 20, "#fff"], [-30, 10, "#7cc6ff"]].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="22" height="7" rx="3" fill="${c}" transform="rotate(${(x * 3) % 60} ${x} ${y})"/>`).join("")}
     </g>
     ${grainRect}`,
    `<linearGradient id="ic" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd9e6"/><stop offset="1" stop-color="#e6dcff"/></linearGradient>${grain}`
  ),
  "fairy-lights.svg": svg(
    `<rect width="800" height="1000" fill="url(#fl)"/>
     ${[0, 1, 2, 3].map((r) => `<path d="M-20 ${150 + r * 220} Q400 ${260 + r * 220} 820 ${150 + r * 220}" stroke="#fff" stroke-opacity=".35" stroke-width="2" fill="none"/>${Array.from({ length: 11 }, (_, i) => { const t = i / 10; const x = -20 + 840 * t; const y = 150 + r * 220 + 4 * 110 * t * (1 - t); return `<circle cx="${x}" cy="${y + 10}" r="26" fill="url(#bulb)"/><circle cx="${x}" cy="${y + 10}" r="7" fill="#fff8dc"/>`; }).join("")}`).join("")}
     <g transform="translate(400 560)"><rect x="-170" y="-110" width="340" height="220" rx="20" fill="#fff" opacity=".9" transform="rotate(-4)"/><text x="0" y="-10" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="46" fill="#7a4560" transform="rotate(-4)">best night</text><text x="0" y="50" text-anchor="middle" font-family="Georgia, serif" font-size="30" fill="#c06a9c" transform="rotate(-4)">ever ✶</text></g>
     ${grainRect}`,
    `<linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d1b4e"/><stop offset="1" stop-color="#8e4a7c"/></linearGradient><radialGradient id="bulb"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".9"/><stop offset="1" stop-color="#ffb3cb" stop-opacity="0"/></radialGradient>${grain}`
  ),
  "best-friends.svg": svg(
    `<rect width="800" height="1000" fill="#fff6e9"/>
     <circle cx="400" cy="470" r="300" fill="#ffe0ea"/>
     <g transform="translate(300 520)"><circle r="120" fill="#ffc8a8"/><circle cx="-40" cy="-10" r="12" fill="#5b2140"/><circle cx="40" cy="-10" r="12" fill="#5b2140"/><path d="M-36 34 q36 34 72 0" stroke="#5b2140" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="-70" cy="30" r="18" fill="#ff8fb4" opacity=".6"/><circle cx="70" cy="30" r="18" fill="#ff8fb4" opacity=".6"/><path d="M-120 -20 q0 -130 120 -130 q120 0 120 130 q-40 -80 -120 -80 q-80 0 -120 80z" fill="#6b3a2e"/></g>
     <g transform="translate(520 540)"><circle r="110" fill="#f1c5a0"/><path d="M-50 -6 q12 -14 24 0M26 -6 q12 -14 24 0" stroke="#3d2a66" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M-30 34 q30 30 60 0" stroke="#3d2a66" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="-64" cy="26" r="16" fill="#ff8fb4" opacity=".6"/><circle cx="64" cy="26" r="16" fill="#ff8fb4" opacity=".6"/><path d="M-115 0 q-10 -130 115 -125 q125 5 115 125 q-30 -60 -60 -60 q-40 0 -55 -30 q-30 50 -115 90z" fill="#2e1d14"/><g transform="translate(70 -100)"><path d="M0 0c-40-34-60 6-40 20 14 10 40-20 40-20zM0 0c40-34 60 6 40 20-14 10-40-20-40-20z" fill="#f0619a"/><circle r="9" fill="#d94a85"/></g></g>
     ${heart(410, 330, 1.6, "#f0619a")}${heart(250, 300, 0.8, "#ff8fb4", 0.7)}${heart(600, 330, 0.9, "#c9a7ff", 0.8)}
     <text x="400" y="830" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="52" fill="#9a5a78">us, basically</text>
     ${grainRect}`,
    grain
  ),
  "cover-art.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb3cb"/><stop offset=".55" stop-color="#d6c2ff"/><stop offset="1" stop-color="#ffd9c2"/></linearGradient>${grain}</defs>
     <rect width="600" height="600" fill="url(#g)"/>
     ${Array.from({ length: 24 }, (_, i) => sparkle((i * 151) % 600, (i * 89) % 600, 0.3 + (i % 4) * 0.15, "#fff", 0.7)).join("")}
     <g transform="translate(300 290)"><circle r="150" fill="#2b1b3f"/>${[130, 110, 90, 70].map((r) => `<circle r="${r}" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width="2"/>`).join("")}<circle r="52" fill="#ff8fb4"/><circle r="8" fill="#2b1b3f"/>${heart(0, -14, 0.9, "#fff")}</g>
     <text x="300" y="530" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="44" fill="#5b2140">a little song for you</text>
     <rect width="600" height="600" filter="url(#grain)"/></svg>`,
};

for (const [name, content] of Object.entries(files)) {
  writeFileSync(join(out, name), content.replace(/\n\s+/g, "\n"));
}

// ---------------------------------------------------------------- music box
const SR = 22050;
const BEAT = 0.52;
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
const N = { G4: 67, A4: 69, B4: 71, C5: 72, D5: 74, E5: 76, F5: 77, G5: 79, C4: 60, E4: 64, F4: 65, G3: 55, B3: 59, D4: 62, A3: 57, C3: 48, F3: 53 };
const melody = [
  ["G4", 0.75], ["G4", 0.25], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 2],
  ["G4", 0.75], ["G4", 0.25], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 2],
  ["G4", 0.75], ["G4", 0.25], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 2],
  ["F5", 0.75], ["F5", 0.25], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 3],
];
// chord arpeggios per 3-beat bar (pickup handled loosely)
const chords = [
  ["C3", "E4", "G4"], ["G3", "D4", "F4"], ["G3", "B3", "D4"], ["C3", "E4", "G4"],
  ["C3", "E4", "G4"], ["F3", "A3", "C4"], ["C3", "E4", "G4"], ["G3", "B3", "F4"], ["C3", "E4", "G4"],
];
const melodyBeats = melody.reduce((s, [, d]) => s + d, 0);
const passes = 2;
const gap = 2;
const totalSec = (melodyBeats * passes + gap * passes) * BEAT + 2.5;
const buf = new Float32Array(Math.ceil(totalSec * SR));

function pluck(t0, freq, dur, amp) {
  const start = Math.floor(t0 * SR);
  const len = Math.floor(Math.min(dur + 1.6, 3) * SR);
  for (let i = 0; i < len && start + i < buf.length; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.004) * Math.exp(-t * 3.2);
    const s =
      Math.sin(2 * Math.PI * freq * t) * 0.6 +
      Math.sin(2 * Math.PI * freq * 2 * t) * 0.22 * Math.exp(-t * 6) +
      Math.sin(2 * Math.PI * freq * 3.01 * t) * 0.1 * Math.exp(-t * 9) +
      Math.sin(2 * Math.PI * freq * 4.2 * t) * 0.05 * Math.exp(-t * 14);
    buf[start + i] += s * env * amp;
  }
}

let t = 0.4;
for (let p = 0; p < passes; p++) {
  const oct = p === 1 ? 12 : 0;
  let bt = t;
  for (const [n, d] of melody) {
    pluck(bt, midi(N[n] + oct), d * BEAT, 0.42);
    if (p === 1) pluck(bt + 0.01, midi(N[n]), d * BEAT, 0.12);
    bt += d * BEAT;
  }
  // arpeggio bed
  const bars = Math.ceil(melodyBeats / 3);
  for (let b = 0; b < bars; b++) {
    const ch = chords[b % chords.length];
    for (let k = 0; k < 3; k++) {
      pluck(t + (1 + b * 3 + k) * BEAT, midi(N[ch[k]] + (p === 1 ? 12 : 0)), BEAT, 0.12);
    }
  }
  t = bt + gap * BEAT;
}

// gentle reverb-ish echo
const delay = Math.floor(0.19 * SR);
for (let i = delay; i < buf.length; i++) buf[i] += buf[i - delay] * 0.28;
let peak = 0;
for (const v of buf) peak = Math.max(peak, Math.abs(v));
const gain = 0.85 / peak;
// fade tail
const fade = Math.floor(1.5 * SR);
for (let i = 0; i < fade; i++) buf[buf.length - 1 - i] *= i / fade;

const pcm = Buffer.alloc(44 + buf.length * 2);
pcm.write("RIFF", 0);
pcm.writeUInt32LE(36 + buf.length * 2, 4);
pcm.write("WAVEfmt ", 8);
pcm.writeUInt32LE(16, 16);
pcm.writeUInt16LE(1, 20);
pcm.writeUInt16LE(1, 22);
pcm.writeUInt32LE(SR, 24);
pcm.writeUInt32LE(SR * 2, 28);
pcm.writeUInt16LE(2, 32);
pcm.writeUInt16LE(16, 34);
pcm.write("data", 36);
pcm.writeUInt32LE(buf.length * 2, 40);
for (let i = 0; i < buf.length; i++) {
  pcm.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(buf[i] * gain * 32767))), 44 + i * 2);
}
writeFileSync(join(out, "music-box.wav"), pcm);
console.log("demo assets written to", out, `(${totalSec.toFixed(1)}s audio)`);
