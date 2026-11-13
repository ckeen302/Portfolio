// Records the local site in a real (headless) browser at full speed and lays the frames out as a sheet,
// so animation can be checked. Usage: node mocks/record.mjs <name> <scenario.json>
//   scenario: { url, width, height, clip:[x,y,w,h], scale, every, cols, prep, steps:[{ at, js }], until }
import { spawn } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const [name, file] = process.argv.slice(2);
const sc = JSON.parse(readFileSync(file, "utf8"));
const W = sc.width ?? 1440, H = sc.height ?? 900;
const port = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", "--disable-gpu", "--hide-scrollbars", "--autoplay-policy=no-user-gesture-required", "--mute-audio", `--remote-debugging-port=${port}`, `--window-size=${W},${H}`,
  `--user-data-dir=${process.env.TMPDIR ?? "/tmp"}/rec-chrome-${port}`, "about:blank",
], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws;
try {
  let info;
  for (let i = 0; i < 50 && !info; i++) {
    await sleep(150);
    info = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json()).catch(() => null);
  }
  const page = info.find((t) => t.type === "page");
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const waiting = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && waiting.has(m.id)) {
      waiting.get(m.id)(m.result ?? m.error);
      waiting.delete(m.id);
    }
  };
  const send = (method, params = {}) => new Promise((r) => { waiting.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });
  const run = (js) => send("Runtime.evaluate", { expression: js, awaitPromise: true, returnByValue: true }).then((r) => r?.result?.value);
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: sc.url ?? "http://localhost:3210/" });
  await sleep(sc.settle ?? 2500);
  if (sc.prep) await run(sc.prep);
  await sleep(300);
  const dir = join(here, "out", "rec-" + name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const [cx, cy, cw, ch] = sc.clip ?? [0, 0, W, H];
  const steps = [...(sc.steps ?? [])].sort((a, b) => a.at - b.at);
  const t0 = Date.now();
  const frames = [];
  let n = 0;
  while (Date.now() - t0 < (sc.until ?? 3000)) {
    const t = Date.now() - t0;
    while (steps.length && steps[0].at <= t) await run(steps.shift().js);
    const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 70 }); // the whole window; the sheet crops it
    const f = `f${String(n++).padStart(3, "0")}.jpg`;
    writeFileSync(join(dir, f), Buffer.from(shot.data, "base64"));
    // with "track", each frame is cropped around the cat instead of a fixed part of the window
    const at = sc.track ? await run(`(() => { const m = document.querySelector('.mascot'); if (!m || m.hidden) return null; const k = new DOMMatrix(getComputedStyle(m).transform); const o = getComputedStyle(m).transformOrigin.split(' ').map(parseFloat); return [k.e + o[0] - scrollX, k.f + o[1] - scrollY]; })()`) : null;
    frames.push({ f, t: Date.now() - t0, at });
    const wait = (sc.every ?? 60) - (Date.now() - t0 - t);
    if (wait > 0) await sleep(wait);
  }
  const cols = sc.cols ?? 6;
  const px = cw < W ? (cx / (W - cw)) * 100 : 0;
  const py = ch < H ? (cy / (H - ch)) * 100 : 0;
  writeFileSync(join(here, `rec-${name}.html`), `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#333;font:11px monospace;color:#fff}main{display:grid;grid-template-columns:repeat(${cols},1fr);gap:4px;padding:4px}figure{margin:0;position:relative;aspect-ratio:${cw}/${ch};background-repeat:no-repeat;background-size:${(W / cw) * 100}% auto;background-position:${px}% ${py}%}figcaption{position:absolute;left:2px;top:2px;background:#000a;padding:0 3px}</style><main>${frames.map((x) => {
    let pos = "";
    if (sc.track) {
      const ax = Math.max(0, Math.min(W - cw, (x.at ? x.at[0] : W / 2) - cw / 2));
      const ay = Math.max(0, Math.min(H - ch, (x.at ? x.at[1] : H / 2) - ch * 0.62));
      pos = `;background-position:${(ax / (W - cw)) * 100}% ${(ay / (H - ch)) * 100}%`;
    }
    return `<figure style="background-image:url(out/rec-${name}/${x.f})${pos}"><figcaption>${x.t}ms${sc.track && !x.at ? " (no cat)" : ""}</figcaption></figure>`;
  }).join("")}</main>`);
  console.log("frames", frames.length, "last at", frames.at(-1)?.t, "ms");
} finally {
  try { ws?.close(); } catch {}
  chrome.kill();
}
