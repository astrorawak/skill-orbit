// Generate self-contained preview.html (FORGE + RADAR) dari modul yang sama.
import { readFileSync, writeFileSync } from "fs";
import { generateSkill } from "./src/forge.js";
import { SKILLS, PATTERNS } from "./src/data.js";

const css = readFileSync("./src/index.css", "utf8");

const md = generateSkill(
  {
    name: "rekap-keuangan-ternak",
    desc: "Rekap keuangan dan untung-rugi usaha ternak otomatis.",
    author: "Karman (karman-astro), Hermes Agent",
    tags: "Agro, Ternak, Keuangan, Otomasi",
    related: "",
    summary: "",
    behaviors: ["tajam", "terukur"],
    tools: ["files", "execute"],
    niche: true,
  },
  "id"
);

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const max = Math.max(...SKILLS.map((r) => r.stars));
const rowsHtml = SKILLS.map(
  (r, i) => `<tr>
    <td class="muted">${String(i + 1).padStart(2, "0")}</td>
    <td><div class="repo"><a href="https://github.com/${r.repo}" target="_blank">${r.repo}</a><div class="bar"><i style="width:${(r.stars / max) * 100}%;background:${r.color}"></i></div></div></td>
    <td class="r stars">${r.stars.toLocaleString()}</td>
    <td class="r muted">${r.forks.toLocaleString()}</td>
    <td><span class="tag" style="color:${r.color}">${r.pattern}</span></td>
    <td class="note">${r.note}</td>
  </tr>`
).join("");

const legendHtml = PATTERNS.map(
  (p) => `<span class="legend-item"><span class="dot" style="background:${p.c}"></span>${p.k}: <em>${p.d}</em></span>`
).join("");

const html = `<!doctype html>
<html lang="id"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>SKILL//ORBIT — pratinjau</title>
<style>${css}
  /* pratinjau khusus: tampilkan dua tab bersusun */
  .stage{display:block}
  .group2{display:grid;grid-template-columns:440px 1fr;gap:18px;align-items:start;margin-top:26px}
  body.scrollable{overflow:auto;height:auto}
  .preview-banner{border:1px dashed var(--accent);color:var(--accent);text-align:center;padding:8px 12px;border-radius:8px;font-size:12px;margin-bottom:18px;letter-spacing:.04em}
  @media(max-width:900px){.group2{grid-template-columns:1fr}}
</style></head>
<body class="scrollable"><div class="shell">
<div class="bg-grid" aria-hidden="true"></div>
<div class="orb o1" aria-hidden="true"></div><div class="orb o2" aria-hidden="true"></div>

<header class="top">
  <div class="brand"><span class="brand-star">✦</span><span class="brand-name">SKILL<span class="accent">//</span>ORBIT</span></div>
  <nav class="tabs">
    <button class="tab on"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-3a8 8 0 0 1-.2 1.8l2 1.5-2 3.5-2.4-1a8 8 0 0 1-3 1.7L13.9 21h-3.8l-.5-2.5a8 8 0 0 1-3-1.7l-2.4 1-2-3.5 2-1.5A8 8 0 0 1 4 12a8 8 0 0 1 .2-1.8l-2-1.5 2-3.5 2.4 1a8 8 0 0 1 3-1.7L10.1 3h3.8l.5 2.5a8 8 0 0 1 3 1.7l2.4-1 2 3.5-2 1.5c.1.6.2 1.2.2 1.8Z"/></svg> FORGE</button>
    <button class="tab"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 9 9M12 12l4-4M12 7a5 5 0 0 0-5 5"/></svg> RADAR</button>
  </nav>
  <div class="lang"><button class="lg on">ID</button><button class="lg">EN</button></div>
</header>

<main class="stage">
  <div class="preview-banner">PRATINJAU STATIS — aplikasi interaktifnya berjalan di localhost:5199</div>

  <section class="panel"> <h2 class="pnl-title"><span style="color:var(--accent)">◆</span> FORGE · PERACIK SKILL</h2>
    <div class="out"><div class="out-head"><h3 class="pnl-title" style="color:var(--cyan)">PRATINJAU</h3>
      <div class="out-actions"><button class="ghost">SALIN</button><button class="solid">UNDUH</button></div></div>
      <pre class="md">${esc(md)}</pre></div>
  </section>

  <section class="panel" style="margin-top:26px"> <h2 class="pnl-title"><span style="color:var(--accent)">◉</span> RADAR — trending agent skills <span class="muted">(bintang live dari GitHub API di versi interaktif)</span></h2>
    <div class="legend">${legendHtml}</div>
    <div class="table-wrap"><table class="table">
      <thead><tr><th>#</th><th>Repo</th><th class="r">★ stars</th><th class="r">⭑ forks</th><th>Pola</th><th>Catatan</th></tr></thead>
      <tbody>${rowsHtml}</tbody></table></div>
    <p class="data-note">Snapshot: 2026-09-02/03 via GitHub REST API. Pola = label editorial (analisa formula viral), bukan metrik resmi.</p>
  </section>
</main>

<footer class="foot"><span>SKILL//ORBIT — pendahulu untuk gelombang skills.</span><span class="pulse-dot"></span><span>live</span></footer>
</div></body></html>`;

writeFileSync("./preview.html", html);
console.log("preview.html written:", html.length, "bytes");
