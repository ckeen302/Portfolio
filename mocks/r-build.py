"""Builds three variations of the handheld-RPG mockup (r1, r2, r3) from one template."""
import re

src = open("g1-handheld.html").read()
props = src[src.index("/* window */"):src.index("</script>")]   # the pixel-art props, reused as drawn

STEP = "polygon(0 8px,8px 8px,8px 0,calc(100% - 8px) 0,calc(100% - 8px) 8px,100% 8px,100% calc(100% - 8px),calc(100% - 8px) calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,8px calc(100% - 8px),0 calc(100% - 8px))"

LIGHT = dict(paper="#f4f0dc", grid="rgba(24,38,48,.05)", card="#f4f0dc", frame="#182630", line="#bccbb4", ink="#182630",
             mut="#2f4858", soft="#bccbb4", inv="#f4f0dc", shadow="rgba(47,72,88,.30)",
             P="{0:'#f4f0dc',1:'#bccbb4',2:'#6f8a86',3:'#2f4858',k:'#182630',o:'#f26b3a',y:'#f2c14e',d:'#f4f0dc'}")
NIGHT = dict(paper="#0d151e", grid="rgba(244,240,220,.035)", card="#15212d", frame="#f4f0dc", line="#2f4858", ink="#f4f0dc",
             mut="#a9bcb6", soft="#2f4858", inv="#0d151e", shadow="rgba(0,0,0,.5)",
             P="{0:'#f4f0dc',1:'#24384c',2:'#1b2c3d',3:'#101b26',k:'#070c12',o:'#f26b3a',y:'#f2c14e',d:'#2f4a63'}")

VARIANTS = {
  "r1-clean": dict(title="R1 — Same look, clearer text", pal=LIGHT, layout="A",
    fonts="family=Silkscreen:wght@400;700&family=VT323",
    fd='"Silkscreen"', ft='"VT323"', fv='"VT323"', wd=700, wt=400, wv=400,
    s=dict(brand=24, small=24, h1=50, role=24, facts=27, factsLH=32, statL=23, statV=31, dialog=40, dialogLH=48, menu=32, tag=16, btn=16, factsMT=26, statsMT=16), upper="uppercase"),
  "r2-mono": dict(title="R2 — Pixel titles, mono text", pal=LIGHT, layout="B",
    fonts="family=Silkscreen:wght@400;700&family=Space+Mono:wght@400;700",
    fd='"Silkscreen"', ft='"Space Mono"', fv='"Space Mono"', wd=700, wt=400, wv=700,
    s=dict(brand=24, small=15, h1=50, role=23, facts=17, factsLH=30, statL=14, statV=17, dialog=23, dialogLH=37, menu=25, tag=16, btn=16, factsMT=28, statsMT=18), upper="none"),
  "r3-night": dict(title="R3 — Night shift", pal=NIGHT, layout="A",
    fonts="family=Jersey+20&family=VT323",
    fd='"Jersey 20"', ft='"VT323"', fv='"Jersey 20"', wd=400, wt=400, wv=400,
    s=dict(brand=36, small=24, h1=74, role=32, facts=26, factsLH=30, statL=24, statV=28, dialog=38, dialogLH=46, menu=46, tag=25, btn=25, factsMT=20, statsMT=12), upper="uppercase"),
}

def page(key, v):
    p, s, B = v["pal"], v["s"], v["layout"] == "B"
    W = 272 if B else 164
    shift = 104 if B else 0
    glow = ('<div class="glow" style="left:%dpx;top:120px"></div>' % (215)) if p is NIGHT else ""
    status_inner = f'''
  <div class="row1"><span class="tag">STATUS</span><span class="cls">CLASS OF 2027</span></div>
  <h1>CADEN KEEN</h1>
  <div class="role">SOFTWARE ENGINEER</div>
  <ul class="facts">
    <li>Computer Science senior</li>
    <li>University of Delaware</li>
    <li>Graduating May 2027</li>
  </ul>'''
    stats = '''
    <div class="stat"><div class="l"><span>CI tests</span><b>500+</b></div><i class="bar"><u style="width:38%"></u></i></div>
    <div class="stat"><div class="l"><span>Bot users</span><b>4,000+</b></div><i class="bar"><u style="width:55%"></u></i></div>
    <div class="stat"><div class="l"><span>Orders</span><b>31K+</b></div><i class="bar"><u style="width:72%"></u></i></div>
    <div class="stat"><div class="l"><span>Songs</span><b>680K</b></div><i class="bar o"><u style="width:92%"></u></i></div>'''
    menu = '''
  <ul>
    <li class="sel"><svg width="16" height="28" viewBox="0 0 4 7"><path d="M0 0h1v7h-1zM1 1h1v5h-1zM2 2h1v3h-1zM3 3h1v1h-1z"/></svg><span>WORK</span><small>2</small></li>
    <li><span>EXPERIENCE</span><small>3</small></li>
    <li><span>ABOUT</span></li>
    <li><span>CONTACT</span></li>
  </ul>'''
    dialog = '''
  <div class="who">CADEN</div>
  <div class="in">
    <p>Computer Science senior at the <em>University of Delaware</em>, graduating <em>May 2027</em>. Based in Newark, DE. Open to work.</p>
    <svg class="more" width="28" height="16" viewBox="0 0 7 4"><path fill="#f26b3a" d="M0 0h7v1h-7zM1 1h5v1h-5zM2 2h3v1h-3zM3 3h1v1h-1z"/></svg>
  </div>'''
    plate = '''<div class="plate"><svg width="12" height="16" viewBox="0 0 6 8"><path fill="currentColor" d="M1 0h4v1h1v3h-1v1h-1v2h-1v1h-1v-3h-1v-1h-1v-3h1z"/></svg>NEWARK, DE</div>'''
    if not B:
        body = f'''
<section class="box status" style="left:40px;top:100px;width:508px;height:496px"><div class="in">{status_inner}
  <div class="stats">{stats}</div>
</div></section>
<section class="box scene" style="left:564px;top:100px;width:836px;height:496px"><div class="in">
  <canvas id="c" width="{W}" height="96" style="width:820px;height:480px"></canvas>{glow}{plate}
</div></section>
<section class="box dialog" style="left:40px;top:616px;width:916px;height:252px">{dialog}</section>
<nav class="box menu" style="left:972px;top:616px;width:428px;height:252px"><div class="in">{menu}</div></nav>'''
    else:
        body = f'''
<section class="box scene" style="left:40px;top:100px;width:1360px;height:496px"><div class="in">
  <canvas id="c" width="{W}" height="96" style="width:1360px;height:480px"></canvas>
  <div class="card status">{status_inner}</div>
  <div class="plate r">{plate[len('<div class="plate">'):]}
</div></section>
<section class="box dialog" style="left:40px;top:616px;width:640px;height:252px">{dialog}</section>
<section class="box statbox" style="left:696px;top:616px;width:308px;height:252px"><div class="in"><span class="tag">STATS</span><div class="stats one">{stats}</div></div></section>
<nav class="box menu" style="left:1020px;top:616px;width:380px;height:252px"><div class="in">{menu}</div></nav>'''

    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{v["title"]}</title>
<link href="https://fonts.googleapis.com/css2?{v["fonts"]}&display=swap" rel="stylesheet">
<style>
:root{{--paper:{p["paper"]};--card:{p["card"]};--frame:{p["frame"]};--line:{p["line"]};--ink:{p["ink"]};--mut:{p["mut"]};--soft:{p["soft"]};--inv:{p["inv"]};--or:#f26b3a;--ye:#f2c14e;
  --fd:{v["fd"]},monospace;--ft:{v["ft"]},monospace;--step:{STEP}}}
*{{box-sizing:border-box;margin:0;padding:0}}
html,body{{width:1440px;height:900px;overflow:hidden}}
body{{position:relative;color:var(--ink);font-family:var(--ft);font-weight:{v["wt"]};
  background:linear-gradient({p["grid"]} 1px,transparent 1px) 0 0/100% 4px,linear-gradient(90deg,{p["grid"]} 1px,transparent 1px) 0 0/4px 100%,var(--paper)}}
svg{{display:block;shape-rendering:crispEdges}}
.top{{position:absolute;left:40px;right:40px;top:26px;height:56px;display:flex;align-items:center;justify-content:space-between}}
.brand{{display:flex;align-items:center;gap:16px}}
.mono{{width:48px;height:48px;background:var(--frame);color:var(--inv);font:{v["wd"]} {s["brand"]}px var(--fd);display:grid;place-items:center}}
.brand b{{font:{v["wd"]} {s["brand"]}px var(--fd);letter-spacing:1px}}
.brand span{{font-size:{s["small"]}px;color:var(--mut);padding-left:16px;border-left:4px solid var(--line);text-transform:{v["upper"]};letter-spacing:.5px}}
.tr{{display:flex;align-items:center;gap:28px;font-size:{s["small"]}px;text-transform:{v["upper"]};letter-spacing:.5px}}
.tr .open{{display:flex;align-items:center;gap:10px}}
.tr .open i{{width:12px;height:12px;background:var(--or);box-shadow:0 0 0 4px rgba(242,107,58,.28)}}
.btn{{display:inline-flex;align-items:center;gap:12px;height:48px;padding:0 20px;background:var(--frame);color:var(--inv);font:{v["wd"]} {s["btn"]}px var(--fd);letter-spacing:1px;box-shadow:6px 6px 0 var(--or)}}
.btn path{{fill:var(--inv)}}
.box{{position:absolute;filter:drop-shadow(8px 8px 0 {p["shadow"]})}}
.box::before{{content:"";position:absolute;inset:0;background:var(--frame);clip-path:var(--step)}}
.box>.in{{position:absolute;inset:8px;background:var(--card);clip-path:var(--step);overflow:hidden}}
.box>.in::after{{content:"";position:absolute;inset:6px;border:2px solid var(--line);pointer-events:none}}
.status .in,.card.status{{padding:28px 30px 0}}
.row1{{display:flex;justify-content:space-between;align-items:center}}
.tag{{display:inline-block;background:var(--frame);color:var(--inv);font:{v["wd"]} {s["tag"]}px var(--fd);padding:4px 12px 6px;letter-spacing:2px}}
.cls{{font-size:{s["small"]}px;color:var(--mut);letter-spacing:1px;text-transform:{v["upper"]}}}
h1{{font:{v["wd"]} {s["h1"]}px/1 var(--fd);margin-top:22px;white-space:nowrap;letter-spacing:.5px}}
.role{{display:inline-block;margin-top:16px;background:var(--or);color:#182630;font:{v["wd"]} {s["role"]}px/1.1 var(--fd);padding:6px 14px 8px;box-shadow:6px 6px 0 var(--frame)}}
.facts{{list-style:none;margin-top:{s["factsMT"]}px;font-size:{s["facts"]}px;line-height:{s["factsLH"]}px;color:var(--ink)}}
.facts li{{display:flex;align-items:center;gap:12px}}
.facts li::before{{content:"";width:8px;height:8px;background:var(--or)}}
.stats{{margin-top:{s["statsMT"]}px;padding-top:{s["statsMT"]}px;border-top:4px dotted var(--mut);display:grid;grid-template-columns:1fr 1fr;gap:14px 28px}}
.stats.one{{grid-template-columns:1fr;gap:6px;margin-top:10px;padding-top:10px}}
.stat .l{{display:flex;justify-content:space-between;align-items:baseline;font-size:{s["statL"]}px;line-height:1.15}}
.stat .l span{{color:var(--mut);text-transform:{v["upper"]};letter-spacing:.5px}}
.stat .l b{{font:{v["wv"]} {s["statV"]}px/1 {v["fv"]},monospace}}
.bar{{display:block;position:relative;height:14px;margin-top:5px;background:repeating-linear-gradient(90deg,var(--soft) 0 10px,transparent 10px 12px)}}
.bar u{{position:absolute;left:0;top:0;bottom:0;background:repeating-linear-gradient(90deg,var(--ink) 0 10px,transparent 10px 12px)}}
.bar.o u{{background:repeating-linear-gradient(90deg,var(--or) 0 10px,transparent 10px 12px)}}
.stats.one .bar{{height:8px;margin-top:3px}}
.scene canvas{{position:absolute;left:0;top:0;image-rendering:pixelated}}
.scene>.in::after{{display:none}}
.plate{{position:absolute;left:16px;top:16px;background:#182630;color:#f4f0dc;font:{v["wd"]} {s["tag"]}px var(--fd);padding:5px 12px 7px;display:flex;gap:10px;align-items:center;z-index:2;letter-spacing:1px}}
.plate.r{{left:auto;right:28px;top:auto;bottom:22px}}
.card.status{{position:absolute;left:28px;top:60px;width:478px;height:330px;background:var(--card);border:8px solid var(--frame);box-shadow:8px 8px 0 rgba(24,38,48,.35);z-index:2}}
.glow{{position:absolute;width:300px;height:300px;border-radius:50%;background:radial-gradient(closest-side,rgba(242,193,78,.36),rgba(242,193,78,0));mix-blend-mode:screen;pointer-events:none}}
.who{{position:absolute;left:36px;top:-14px;z-index:3;background:var(--frame);color:var(--inv);font:{v["wd"]} {s["tag"]}px var(--fd);letter-spacing:2px;padding:5px 16px 7px;box-shadow:4px 4px 0 var(--or)}}
.dialog .in{{padding:42px 40px 0}}
.dialog p{{font-size:{s["dialog"]}px;line-height:{s["dialogLH"]}px}}
.dialog p em{{font-style:normal;background:linear-gradient(transparent 64%,rgba(242,193,78,{".9" if p is LIGHT else ".45"}) 64% 92%,transparent 92%)}}
.more{{position:absolute;right:30px;bottom:26px}}
.statbox .in{{padding:16px 22px 0}}
.menu .in{{padding:22px 24px}}
.menu ul{{list-style:none}}
.menu li{{position:relative;height:48px;display:flex;align-items:center;padding-left:52px;font:{v["wd"]} {s["menu"]}px/1 var(--fd);letter-spacing:1px}}
.menu li.sel{{background:var(--frame);color:var(--inv)}}
.menu li.sel svg{{position:absolute;left:18px;top:10px;fill:var(--or)}}
.menu li small{{margin-left:auto;margin-right:16px;font:{v["wt"]} {s["statV"]}px var(--ft);color:var(--mut)}}
.menu li.sel small{{color:var(--or)}}
</style>
</head>
<body>
<header class="top">
  <div class="brand"><div class="mono">CK</div><b>CADEN KEEN</b><span>Software Engineer</span></div>
  <div class="tr"><div class="open"><i></i>Open to work</div>
    <a class="btn">RÉSUMÉ <svg width="12" height="14" viewBox="0 0 6 7"><path d="M2 0h2v3h2v1h-1v1h-1v1h-2v-1h-1v-1h-1v-1h2zM0 6h6v1h-6z"/></svg></a></div>
</header>
{body}
<script>
const cv=document.getElementById('c'),g=cv.getContext('2d'),W={W};
const P={p["P"]};
const r=(x,y,w,h,c)=>{{g.fillStyle=P[c];g.fillRect(x,y,w,h)}};
/* wall + floor, full width */
r(0,0,W,66,1);
for(let j=3;j<60;j+=6)for(let i=(j%12<6?2:6);i<W;i+=8)r(i,j,1,1,'d');
r(0,61,W,1,2); r(0,62,W,4,3);
r(0,66,W,30,2);
[73,81,89].forEach(y=>r(0,y,W,1,3));
[[66,6],[74,22],[82,12],[90,28]].forEach(([y,o])=>{{for(let i=o;i<W;i+=34)r(i,y,1,(y==90?6:7),3)}});
g.translate({shift},0);
{props}
</script>
</body>
</html>
'''

for key, v in VARIANTS.items():
    open(key + ".html", "w").write(page(key, v))
    print("wrote", key)
