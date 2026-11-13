// Renders the cat's poses to an HTML sheet for checking (node mocks/cat-preview.cjs, then render it).
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const root = path.join(__dirname, "..");
const js = ts.transpileModule(fs.readFileSync(path.join(root, "lib/cat.ts"), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const m = { exports: {} };
new Function("exports", "module", js)(m.exports, m);
const { paintCat, paintSide, CAT_W, CAT_H } = m.exports;
const frames = [];
const add = (label, o) => frames.push({ label, rows: paintCat({ t: 0, hover: -1, pet: -1, phase: "idle", p: 0, ...o }) });
add("sleep in", { pose: "sleep", t: 0.6 });
add("sleep out", { pose: "sleep", t: 1.9 });
add("sleep hover", { pose: "sleep", t: 2, hover: 0.5 });
add("bat 1", { pose: "bat", t: 0.2 });
add("bat 2", { pose: "bat", t: 0.4 });
add("bat 3", { pose: "bat", t: 0.75 });
add("bat hover", { pose: "bat", t: 1, hover: 0.5 });
add("watch L", { pose: "watch", t: 0.2 });
add("watch R", { pose: "watch", t: 1.8 });
add("watch hover", { pose: "watch", t: 2, hover: 0.6, pet: 0.3 });
add("badge", { pose: "badge", t: 1 });
add("badge look", { pose: "badge", t: 5.5 });
add("peek", { pose: "peek", t: 0.3 });
add("peek R", { pose: "peek", t: 3 });
add("peek duck", { pose: "peek", t: 7 });
add("peek hover", { pose: "peek", t: 2, hover: 0.5 });
add("perch", { pose: "perch", t: 0.9 });
add("perch pet", { pose: "perch", t: 2, hover: 1, pet: 0.5 });
add("landed", { pose: "perch", phase: "in", p: 0.2 });
add("peek rise", { pose: "peek", phase: "in", p: 0.5 });
for (let i = 0; i < 4; i++) frames.push({ label: "walk " + i, rows: paintSide("walk", i) });
for (let i = 0; i < 4; i++) frames.push({ label: "run " + i, rows: paintSide("run", i) });
frames.push({ label: "crouch", rows: paintSide("crouch") });
frames.push({ label: "air", rows: paintSide("air") });
const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;font:12px monospace}section{display:grid;grid-template-columns:repeat(11,1fr);gap:6px;padding:10px}figure{margin:0}canvas{width:100%;image-rendering:pixelated;display:block}figcaption{padding:2px 0 6px}</style>
<section id="day" style="background:#f4f0dc;color:#182630"></section><section id="night" style="background:#15212d;color:#f4f0dc"></section>
<script>const F=${JSON.stringify(frames)},W=${CAT_W},H=${CAT_H};
const pal={day:{"0":"#f4f0dc",s:"#d3ccb4",o:"#f26b3a",k:"#182630",K:"#182630",i:"#182630",h:"#f26b3a"},night:{"0":"#f4f0dc",s:"#d3ccb4",o:"#f26b3a",k:"#070c12",K:"#070c12",i:"#f4f0dc",h:"#f26b3a"}};
for(const th of ["day","night"]){const sec=document.getElementById(th);for(const f of F){const fig=document.createElement("figure");const c=document.createElement("canvas");c.width=W;c.height=H;const g=c.getContext("2d");
// a line where the ground is, so hanging paws and tails can be judged
g.fillStyle=th==="day"?"#bccbb4":"#24384c";g.fillRect(0,27,W,1);
f.rows.forEach((line,y)=>[...line].forEach((ch,x)=>{if(ch!=="."){g.fillStyle=pal[th][ch];g.fillRect(x,y,1,1)}}));
const cap=document.createElement("figcaption");cap.textContent=f.label;fig.append(c,cap);sec.append(fig)}}</script>`;
fs.writeFileSync(path.join(__dirname, "cat-preview.html"), html);
console.log("wrote", frames.length, "frames");
