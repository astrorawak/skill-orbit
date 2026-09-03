import { useMemo, useState, useEffect, useRef } from "react";
import { SKILLS, PATTERNS } from "./data";
import { BEHAVIORS, TOOL_OPTS, generateSkill, validateDesc } from "./forge";
import GALLERY from "./gallery";
import { stashList, stashAdd, stashDel, stashExport, stashImport, parseSkillFile } from "./stash";
import { getToken, getEmail, setSession, clearSession, register, login, syncUp, syncDown, forgotPassword, resetPassword, deleteAccount } from "./cloud";

// mapping kategori galeri -> perilaku + alat (dipakai "Compose dari Galeri")
function galMap(slug) {
  const s = slug.toLowerCase();
  if (/humaniz|unslop|prose|natur/.test(s)) return { bs: ["tajam"], ts: ["files"] };
  if (/market|seo|sales|gtm|creative|twitter|scrap/.test(s)) return { bs: ["terukur", "cerita"], ts: ["web"] };
  if (/whatsapp|pdf|docx|pptx|xlsx|slide|present/.test(s)) return { bs: ["terukur"], ts: ["files", "execute"] };
  if (/search|research|source|evidence/.test(s)) return { bs: ["cerita", "bijak"], ts: ["web", "execute"] };
  if (/superpower|lab|plan|brainstorm/.test(s)) return { bs: ["bijak", "tajam"], ts: ["files"] };
  return { bs: ["terukur"], ts: ["files"] };
}

function Icon({ d, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  head: "M17.7 8.5a6 6 0 0 0-11.4 0A4.5 4.5 0 0 0 7 17.5 4.5 4.5 0 0 0 12 19 4.5 4.5 0 0 0 17 17.5a4.5 4.5 0 0 0 .7-9Z",
  radar: "M12 3a9 9 0 1 0 9 9M12 12l4-4M12 7a5 5 0 0 0-5 5",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-3a8 8 0 0 1-.2 1.8l2 1.5-2 3.5-2.4-1a8 8 0 0 1-3 1.7L13.9 21h-3.8l-.5-2.5a8 8 0 0 1-3-1.7l-2.4 1-2-3.5 2-1.5A8 8 0 0 1 4 12a8 8 0 0 1 .2-1.8l-2-1.5 2-3.5 2.4 1a8 8 0 0 1 3-1.7L10.1 3h3.8l.5 2.5a8 8 0 0 1 3 1.7l2.4-1 2 3.5-2 1.5c.1.6.2 1.2.2 1.8Z",
  copy: "M9 9h10v10H9zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1",
  dl: "M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2",
  check: "M5 12l4 4L19 6",
  refresh: "M20 11a8 8 0 1 0-2 6m2-6v5m0-5h-5",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.5-4.5",
  box: "M21 8l-9-5-9 5v8l9 5 9-5V8Zm-9-3v5m0-5L3 8m9-3 9 3m-9 3 9-3m-9 3 0 9m0-9-9 3M3 8v8l9 5",
  tour: "M12 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4M13 16l5 2 4-6-5-1-4 5Zm-2 1-1.5 3 3-1.5",
  help: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3m.08 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
};

export default function App() {
  const [tab, setTab] = useState("home");
  const [lang, setLang] = useState("id");
  const [draft, setDraft] = useState(null);
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [firstRun, setFirstRun] = useState(false);
  const [pageHelp, setPageHelp] = useState(null);

  // kunjungan pertama → tawarkan tur (banner sekali; tombol Tour selalu ada di pojok)
  useEffect(() => {
    if (!localStorage.getItem("so_tour_v1")) setFirstRun(true);
  }, []);
  function startTour() {
    setTourStep(0);
    setTourOpen(true);
  }
  function endTour(done) {
    setTourOpen(false);
    if (done) localStorage.setItem("so_tour_v1", "1");
    setFirstRun(false);
  }

  function loadDraft(d) {
    setDraft(d);
    setTab("forge");
  }

  return (
    <div className="shell">
      <div className="bg-grid" aria-hidden="true" />
      <div className="orb o1" aria-hidden="true" />
      <div className="orb o2" aria-hidden="true" />
      <Header tab={tab} setTab={setTab} lang={lang} setLang={setLang} onHome={() => setTab("home")} />
      <main className="stage">
        {tab === "home" ? (
          <Home lang={lang} onGo={setTab} onHelp={setPageHelp} />
        ) : tab === "forge" ? (
          <Forge lang={lang} draft={draft} setDraft={setDraft} onHelp={setPageHelp} />
        ) : tab === "radar" ? (
          <Radar lang={lang} onHelp={setPageHelp} />
        ) : (
          <Arsip lang={lang} onOpen={loadDraft} onRegistered={startTour} onHelp={setPageHelp} />
        )}
      </main>
      <footer className="foot">
        <span>SKILL//ORBIT — {lang === "id" ? "pendahulu untuk gelombang skills. angka dari GitHub API." : "precursor to the skills wave. numbers from GitHub API."}</span>
        <span className="pulse-dot" /> <span>live</span>
      </footer>

      {firstRun && (
        <div className="tour-banner">
          <span className="tour-banner-ico">✦</span>
          <span className="tour-banner-t">{lang === "id" ? "Baru di sini?" : "New here?"}</span>
          <button className="ghost sm accent" onClick={startTour}>
            {lang === "id" ? "Mulai tur singkat →" : "Take a quick tour →"}
          </button>
          <button className="tour-banner-x" onClick={() => endTour(false)} aria-label={lang === "id" ? "Tutup" : "Close"}>✕</button>
        </div>
      )}

      <button className="tour-fab" onClick={startTour} title={lang === "id" ? "Panduan penggunaan" : "Usage guide"}>
        <Icon d={ICONS.tour} size={18} /> {lang === "id" ? "Tour" : "Tour"}
      </button>

      {tourOpen && (
        <Tour
          lang={lang}
          step={tourStep}
          setStep={setTourStep}
          onSkip={() => endTour(false)}
          onDone={() => endTour(true)}
          onGo={setTab}
        />
      )}

      {pageHelp && (
        <PageHelp lang={lang} page={pageHelp} onClose={() => setPageHelp(null)} />
      )}
    </div>
  );
}

// ===== Tur panduan (bisa dibuka ulang kapan pun) =====
function Tour({ lang, step, setStep, onSkip, onDone, onGo }) {
  const L = lang === "id" ? LID : LEN;
  const s = L.TOUR_STEPS[step];
  const last = step === L.TOUR_STEPS.length - 1;
  function next() {
    if (last) return onDone();
    if (s.go) onGo(s.go);
    setStep(step + 1);
  }
  return (
    <div className="tour-mask" onClick={onSkip}>
      <div className="tour-card" onClick={(e) => e.stopPropagation()}>
        <div className="tour-grab">{step + 1}/{L.TOUR_STEPS.length} <span>·</span> {L.tourTag}</div>
        <h3 className="tour-title">{s.t}</h3>
        <p className="tour-body">{s.b}</p>
        <div className="tour-dots">
          {L.TOUR_STEPS.map((_, i) => (
            <span key={i} className={i === step ? "t-dot on" : "t-dot"} />
          ))}
        </div>
        <div className="tour-actions">
          <button className="ghost sm" onClick={onSkip}>{L.tourSkip}</button>
          <button className="solid ok" onClick={next}>
            {last ? L.tourDone : (s.btn || L.tourNext)} {last ? "✓" : "→"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Panduan per halaman (tombol ? tetap ada di header tiap modul) =====
function PageHelp({ lang, page, onClose }) {
  const L = lang === "id" ? LID : LEN;
  const items = L.HELP[page] || [];
  const GUIDE = { forge: "guide-forge.html", radar: "guide-radar.html", arsip: "guide-arsip.html", home: "guide-forge.html" };
  const h = GUIDE[page] || "guide-forge.html";
  return (
    <div className="tour-mask" onClick={onClose}>
      <div className="tour-card help-card" onClick={(e) => e.stopPropagation()}>
        <div className="tour-grab">✦ {L.helpTag}</div>
        <h3 className="tour-title">{L.HELP_T[page]}</h3>
        <ol className="help-list">
          {items.map((it, i) => <li key={i}>{it}</li>)}
        </ol>
        <p className="help-persist">⟳ {L.helpPersist}</p>
        <div className="tour-actions">
          <button className="ghost sm" onClick={onClose}>{L.helpClose} ✓</button>
          <a className="solid ok btn-full" href={h} target="_blank" rel="noopener">{L.helpFull}</a>
        </div>
      </div>
    </div>
  );
}

// ===== Landing: kartu-kartu besar, bisa diklik =====
function Home({ lang, onGo, onHelp }) {
  const stashCount = useMemo(() => stashList().length, []);
  const L = lang === "id" ? LID : LEN;
  const cards = [
    {
      key: "forge",
      icon: ICONS.gear,
      apex: "F",
      title: L.homeForgeT,
      desc: L.homeForgeD,
      btn: L.homeForgeB,
      badge: null,
    },
    {
      key: "radar",
      icon: ICONS.radar,
      apex: "R",
      title: L.homeRadarT,
      desc: L.homeRadarD,
      btn: L.homeRadarB,
      badge: `${PATTERNS.length} ${lang === "id" ? "pola" : "patterns"}`,
    },
    {
      key: "arsip",
      icon: ICONS.box,
      apex: "A",
      title: L.homeArsipT,
      desc: L.homeArsipD,
      btn: L.homeArsipB,
      badge: stashCount > 0 ? `${stashCount} skill` : null,
    },
  ];
  return (
    <section className="home">
      <div className="home-hero">
        <h1 className="home-kicker">{lang === "id" ? "GELEMBANG SKILL · PENDULU" : "SKILLS WAVE · PRECURSOR"}</h1>
        <p className="home-note">{L.homeNote}</p>
      </div>
      <div className="card-grid">
        {cards.map((c) => (
          <button key={c.key} className="h-card" onClick={() => onGo(c.key)} aria-label={c.title}>
            <span className="h-apex" aria-hidden="true">{c.apex}</span>
            <span className="h-icon"><Icon d={c.icon} size={34} /></span>
            <span className="h-body">
              <span className="h-title">{c.title}</span>
              <span className="h-desc">{c.desc}</span>
            </span>
            {c.badge && <span className="h-badge">{c.badge}</span>}
            <span className="h-go" aria-hidden="true">→</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function Header({ tab, setTab, lang, setLang, onHome }) {
  return (
    <header className="top">
      <button className="brand" onClick={onHome} aria-label="Beranda">
        <span className="brand-star">✦</span>
        <span className="brand-name">SKILL<span className="accent">//</span>ORBIT</span>
      </button>
      <nav className="tabs">
        <button className={tab === "home" ? "tab on" : "tab"} onClick={() => setTab("home")}>
          {lang === "id" ? "HOME" : "HOME"}
        </button>
        <button className={tab === "forge" ? "tab on" : "tab"} onClick={() => setTab("forge")}>
          <Icon d={ICONS.gear} /> FORGE
        </button>
        <button className={tab === "radar" ? "tab on" : "tab"} onClick={() => setTab("radar")}>
          {lang === "id" ? "RADAR · Tren" : "RADAR"}
        </button>
        <button className={tab === "arsip" ? "tab on" : "tab"} onClick={() => setTab("arsip")}>
          {lang === "id" ? "ARSIP" : "STASH"}
        </button>
      </nav>
      <div className="lang">
        <button className={lang === "id" ? "lg on" : "lg"} onClick={() => setLang("id")}>ID</button>
        <button className={lang === "en" ? "lg on" : "lg"} onClick={() => setLang("en")}>EN</button>
      </div>
    </header>
  );
}

function Field({ label, hint, note, children }) {
  return (
    <label className="field">
      <span className="flabel">{label}</span>
      {children}
      {hint ? <span className="fhint">{hint}</span> : null}
      {note ? <span className="fnote">{note}</span> : null}
    </label>
  );
}

function Chip({ active, onClick, children, tone }) {
  return (
    <button className={active ? "chip on" : "chip"} onClick={onClick} data-tone={tone}>
      {children}
    </button>
  );
}

function Forge({ lang, draft = null, setDraft, onHelp }) {
  const [name, setName] = useState("rekap-keuangan-ternak");
  const [desc, setDesc] = useState(lang === "id" ? "Rekap keuangan dan untung-rugi usaha ternak otomatis." : "Auto bookkeeping & P&L for a livestock venture.");
  const [author, setAuthor] = useState("Karman (karman-astro), Hermes Agent");
  const [tags, setTags] = useState("Agro, Ternak, Keuangan, Otomasi");
  const [related, setRelated] = useState("");
  const [src, setSrc] = useState("");
  const [summary, setSummary] = useState("");
  const [behaviors, setBehaviors] = useState(["tajam", "terukur"]);
  const [tools, setTools] = useState(["files", "execute"]);
  const [niche, setNiche] = useState(true);
  const [copied, setCopied] = useState(false);
  const [gal, setGal] = useState([]);
  const [galQ, setGalQ] = useState("");
  const galFiltered = GALLERY.filter(
    (g) => g.slug.toLowerCase().includes(galQ.toLowerCase()) || g.desc.toLowerCase().includes(galQ.toLowerCase())
  );

  // muat draft dari ARSIP (pilih "Racik lagi →")
  useEffect(() => {
    if (!draft) return;
    setName(draft.name || name);
    setDesc(draft.desc || "");
    setAuthor(draft.author || author);
    if (draft.tags) setTags(draft.tags);
    setRelated(draft.related || "");
    const src = draft.src;
    setSrc(src || "");
  }, [draft]);

  // simpan skill hasil racikan ke ARSIP (perangkat ini)
  const [saved, setSaved] = useState(false);
  function saveToStash() {
    stashAdd({ name, desc, md: markdown, lang, src });
    setSaved(true);
    setTab("arsip");
  }

  // ===== telusur GitHub → tarik SKILL.md publik =====
  const [ghQ, setGhQ] = useState("");
  const [ghRes, setGhRes] = useState([]);
  const [ghLoading, setGhLoading] = useState(false);
  const [ghErr, setGhErr] = useState("");
  const [ghDone, setGhDone] = useState(false);
  const [sel, setSel] = useState(null);
  async function ghSearch() {
    if (!ghQ.trim()) return;
    setGhLoading(true);
    setGhErr("");
    setGhDone(false);
    setGhRes([]);
    try {
      const url =
        "https://api.github.com/search/repositories?q=" +
        encodeURIComponent(ghQ.trim() + " in:name,description,readme") +
        "&sort=stars&order=desc&per_page=14";
      const r = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
      if (!r.ok) {
        if (r.status === 403 || r.status === 429) {
          setGhErr(L.errLimit);
        } else {
          setGhErr(L.errSearch + r.status);
        }
        return;
      }
      const j = await r.json();
      const seen = new Set();
      setGhRes(
        (j.items || []).filter((it) => {
          const key = it.full_name.toLowerCase();
          const dup = seen.has(key);
          seen.add(key);
          return !dup;
        })
      );
    } catch (e) {
      setGhErr(L.errSearch + e.message);
    } finally {
      setGhLoading(false);
      setGhDone(true);
    }
  }
  async function loadFromRepo(repo, branch, realDesc = "") {
    setSel(null);
    setGhLoading(true);
    setGhErr("");
    setGhInfo("");
    const bases = [
      "SKILL.md",
      "skills/SKILL.md",
      "Skills/SKILL.md",
      "skill.md",
      "skills/skill.md",
      "docs/SKILL.md",
      "SKILL.md.an.md",
    ];
    for (const b of bases) {
      const url = `https://raw.githubusercontent.com/${repo}/${branch}/${b}`;
      try {
        const r = await fetch(url);
        if (!r.ok) continue;
        const text = await r.text();
        if (!text.trim()) continue;
        const p = parseSkillFile(text);
        setName(p.name || repo.split("/").pop());
        setDesc(p.desc || "");
        if (p.author) setAuthor(p.author);
        setTags(p.tags || "");
        setRelated(p.related || "");
        setSrc(`https://github.com/${repo}`);
        setGhErr("");
        setGhDone(false);
        setTab("forge");
        setDraft(null);
        setLoadedFrom(`${repo} · ${b}`);
        return true;
      } catch {
        /* coba basis berikutnya */
      }
    }
    // Repo tak punya SKILL.md → coba README sebagai draf (tidak buntu).
    try {
      const rd = await fetch(`https://raw.githubusercontent.com/${repo}/${branch}/README.md`);
      if (rd.ok) {
        const text = (await rd.text()).trim();
        if (text) {
          const p = parseSkillFile(text);
          const name = p.name || repo.split("/").pop().replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
          const first = p.desc || realDesc || (text.replace(/[#>*_`]/g, "").split(/\n\s*\n/)[0] || "").trim();
          setName(name);
          setDesc((first || L.ghNoSkillDraft(repo)).slice(0, 60));
          if (p.author) setAuthor(p.author);
          setTags("");
          setRelated("");
          setSrc(`https://github.com/${repo}`);
          setTab("forge");
          setDraft(null);
          setLoadedFrom(`${repo} · README`);
          setGhInfo(L.ghNoSkillInfo);
          return true;
        }
      }
    } catch { /* lanjut: draf dari nama */ }
    // Paling buruk: draf dari nama repo — user tetap sampai di editor, bukan error.
    setName(repo.split("/").pop().replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
    setDesc((realDesc || L.ghNoSkillDraft(repo)).slice(0, 60));
    setAuthor(repo.split("/")[0]);
    setSrc(`https://github.com/${repo}`);
    setTab("forge");
    setDraft(null);
    setLoadedFrom(repo);
    setGhInfo(L.ghNoSkillInfo);
    return true;
  }
  const [ghInfo, setGhInfo] = useState("");
  const [loadedFrom, setLoadedFrom] = useState("");
  const [done, setDone] = useState({});
  function focusField(id) {
    const el = document.getElementById(id);
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
  function applyGallery() {
    if (!gal.length) return;
    const picked = GALLERY.filter((g) => gal.includes(g.slug));
    const slugName =
      picked
        .map((g) => g.slug)
        .join("-")
        .replace(/[^a-z0-9-]/g, "")
        .slice(0, 40)
        .replace(/-+$/, "") || "composed-skill";
    setName(slugName);
    let d = picked
      .map((g) => g.desc)
      .join(" + ")
      .replace(/\s+/g, " ")
      .trim();
    if (d.length > 58) d = d.slice(0, 55).trimEnd() + "…";
    setDesc(d);
    const bs = new Set(), ts = new Set();
    for (const g of picked) {
      galMap(g.slug).bs.forEach((b) => bs.add(b));
      galMap(g.slug).ts.forEach((t) => ts.add(t));
    }
    setBehaviors([...bs]);
    setTools([...ts]);
  }

  const v = validateDesc(desc);
  const markdown = useMemo(
    () =>
      generateSkill(
        { name, desc, author, tags, related, summary, behaviors, tools, niche },
        lang
      ),
    [name, desc, author, tags, related, summary, behaviors, tools, niche, lang]
  );

  const L = lang === "id" ? LID : LEN;
  useEffect(() => {
    if (loadedFrom || draft) return; // jangan timpa deskripsi asli repo / draf dari ARSIP
    if (lang === "id") setDesc("Rekap keuangan dan untung-rugi usaha ternak otomatis.");
    else setDesc("Auto bookkeeping & P&L for a livestock venture.");
  }, [lang]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  }
  function dl() {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${name || "skill"}.SKILL.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const toggle = (arr, setArr, id) =>
    setArr(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

  return (
    <div className="forge">
      <section className="panel inputs">
        <h2 className="pnl-title">
          <Icon d={ICONS.gear} /> {L.forgeTitle}
          <button className="help-chip" onClick={() => onHelp("forge")} title={L.helpBtnT}><Icon d={ICONS.help} size={15} />{L.helpBtn}</button>
        </h2>
        {loadedFrom && (
          <div className="draft-note">
            <b>⟡ {L.draftTag}</b> {L.draftHint} <span className="muted">({loadedFrom})</span>
          </div>
        )}
        {loadedFrom && (
          <div className="mine">
            <div className="mine-head"><span className="grp">{L.mmTitle}</span></div>
            <p className="mine-sub">{L.mmSub}</p>
            {[
              { id: "f-name", t: L.mmName, h: L.mmNameH },
              { id: "f-desc", t: L.mmDesc, h: L.mmDescH },
              { id: "f-tags", t: L.mmTags, h: L.mmTagsH },
              { id: "f-summ", t: L.mmBody, h: L.mmBodyH },
            ].map((it, i) => (
              <div className={done[it.id] ? "mine-row done" : "mine-row"} key={it.id}>
                <label className="mine-ck">
                  <input
                    type="checkbox"
                    checked={!!done[it.id]}
                    onChange={() => setDone({ ...done, [it.id]: !done[it.id] })}
                  />
                  <span>{i + 1}. {it.t}</span>
                </label>
                <span className="mine-hint">{it.h}</span>
                <button className="ghost sm mine-go" onClick={() => focusField(it.id)}>{L.mmFocus}</button>
              </div>
            ))}
          </div>
        )}
        <div className="block gal">
          <div className="gal-head">
            <span className="grp">{L.gal}</span>
            <span className="gal-ctl">
              <input className="gal-search" value={galQ} onChange={(e) => setGalQ(e.target.value)} placeholder={L.galPh} />
              <button className="ghost sm" onClick={applyGallery} disabled={!gal.length}>
                {L.galApply} ({gal.length})
              </button>
            </span>
          </div>
          <div className="gal-grid">
            {galFiltered.map((g) => {
              const on = gal.includes(g.slug);
              return (
                <button
                  key={g.slug}
                  className={on ? "g-card on" : "g-card"}
                  onClick={() => setGal(on ? gal.filter((x) => x !== g.slug) : [...gal, g.slug])}
                >
                  <span className="g-name">{g.slug}</span>
                  <span className="g-cat">{g.cat}</span>
                  <span className="g-desc">{g.desc}</span>
                </button>
              );
            })}
            {galFiltered.length === 0 && <span className="muted gal-empty">— {L.galPhNo} —</span>}
          </div>
        </div>
        <div className="block gh">
          <div className="gh-head">
            <span className="grp">{L.ghTitle}</span>
            <span className="gal-ctl">
              <input
                className="gal-search"
                placeholder={L.ghPh}
                value={ghQ}
                onChange={(e) => setGhQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && ghSearch()}
              />
              <button className="ghost sm" onClick={ghSearch} disabled={ghLoading}>
                {ghLoading ? L.ghLoading : L.ghSearch}
              </button>
            </span>
          </div>
          {ghErr && <div className="g-err">{ghErr}</div>}
          {ghInfo && <div className="g-info">{ghInfo}</div>}
          {ghDone && !ghErr && ghRes.length === 0 && (
            <div className="muted gal-empty">— {L.ghNone} —</div>
          )}
          {ghRes.length > 0 && (
            <div className="gh-grid">
              {ghRes.map((r) => {
                const selId = sel && sel.full_name === r.full_name;
                return (
                  <div
                    className={selId ? "g-card gh-row sel" : "g-card gh-row"}
                    key={r.id}
                    onClick={() => setSel(selId ? null : r)}
                  >
                    <div className="gh-name">
                      {r.full_name}
                      <span className="gh-stars">★ {Math.round(r.stargazers_count / 100) / 10}k</span>
                    </div>
                    <div className="gh-desc">
                      {r.description || L.ghNoDesc}
                      {selId && <span className="gh-sel-tag">{L.ghSelTag} · {L.ghSelUnsel}</span>}
                    </div>
                    <div className="gh-actions">
                      <button className="ghost sm" onClick={(e) => { e.stopPropagation(); setSel(selId ? null : r); }}>
                        {selId ? L.ghSelTag : L.ghPick}
                      </button>
                      <a className="g-link" href={r.html_url} target="_blank" rel="noreferrer">
                        github ↗
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {sel && (
            <div className="gh-panel">
              <div className="gh-panel-head">
                <span className="grp">{L.ghSelTitle}</span>
                <button className="ghost sm" onClick={() => setSel(null)}>{L.ghSelCancel}</button>
              </div>
              <div className="gh-panel-name">{sel.full_name}</div>
              <div className="gh-panel-desc">{sel.description || L.ghNoDesc}</div>
              <div className="gh-panel-meta">
                <span>★ {Math.round(sel.stargazers_count / 100) / 10}k</span>
                {sel.language && <span>{sel.language}</span>}
                <span>{L.ghSelMeta}{sel.updated_at ? sel.updated_at.slice(0, 10) : ""}</span>
              </div>
              {sel.topics && sel.topics.length > 0 && (
                <div className="gh-panel-topics">
                  {sel.topics.map((t) => <span key={t}>{t}</span>)}
                </div>
              )}
              <p className="gh-panel-hint">{L.ghSelHint}</p>
              <div className="gh-panel-act">
                <button className="ph" disabled={ghLoading} onClick={() => loadFromRepo(sel.full_name, sel.default_branch || "main", sel.description)}>
                  {ghLoading ? L.ghLoading : L.ghRacik}
                </button>
                <a className="g-link" href={sel.html_url} target="_blank" rel="noreferrer">github ↗</a>
              </div>
            </div>
          )}
        </div>
        <Field label={L.nLabel} note={L.nNote}>
          <input id="f-name" value={name} onChange={(e) => setName(e.target.value)} spellCheck="false" />
        </Field>
        <Field
          label={L.dLabel}
          hint={<span className={v.ok ? "s ok" : "s bad"}>{v.len}{L.dLimit}</span>}
          note={L.dNote}
        >
          <textarea id="f-desc" rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} spellCheck="false" />
        </Field>
        <div className="row2">
          <Field label="author" note={L.authorNote}>
            <input value={author} onChange={(e) => setAuthor(e.target.value)} />
          </Field>
          <Field label="tags" note={L.tagsNote}>
            <input id="f-tags" value={tags} onChange={(e) => setTags(e.target.value)} />
          </Field>
        </div>
        <Field label={L.rLabel}>
          <input value={related} onChange={(e) => setRelated(e.target.value)} placeholder={L.rPh} />
        </Field>
        <Field label={L.sLabel} note={L.sNote}>
          <textarea id="f-summ" rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder={L.sPh} />
        </Field>

        <div className="block">
          <span className="grp">{L.behav}</span>
          <p className="fnote">{L.behavNote}</p>
          <div className="chips">
            {BEHAVIORS.map((b) => (
              <Chip key={b.id} active={behaviors.includes(b.id)} onClick={() => toggle(behaviors, setBehaviors, b.id)}>
                {lang === "id" ? b.id_label : b.en}
              </Chip>
            ))}
          </div>
        </div>
        <div className="block">
          <span className="grp">{L.tools}</span>
          <p className="fnote">{L.toolsNote}</p>
          <div className="chips">
            {TOOL_OPTS.map((t) => (
              <Chip key={t.id} active={tools.includes(t.id)} onClick={() => toggle(tools, setTools, t.id)}>
                {lang === "id" ? t.id_label : t.en}
              </Chip>
            ))}
          </div>
        </div>
        <div className="block">
          <label className="toggle">
            <input type="checkbox" checked={niche} onChange={(e) => setNiche(e.target.checked)} />
            <span>{L.niche}</span>
          </label>
        </div>
      </section>

      <section className="panel out">
        <div className="out-head">
          <h2 className="pnl-title"><Icon d={ICONS.head} /> {L.preview}</h2>
          <div className="out-actions">
            {loadedFrom && <span className="loaded-note">⬒ {L.loaded}({loadedFrom})</span>}
            <button className="ghost" onClick={copy}>
              <Icon d={copied ? ICONS.check : ICONS.copy} /> {copied ? "OK" : L.copy}
            </button>
            <button className="ghost" onClick={() => saveToStash()}>
              <Icon d={ICONS.box} /> {saved ? L.saved : L.saveStash}
            </button>
            <button className="solid" onClick={dl}>
              <Icon d={ICONS.dl} /> {L.dl}
            </button>
          </div>
        </div>
        <div className="md-cap">{L.previewCap}</div>
        <pre className="md">{markdown}</pre>
      </section>
    </div>
  );
}

function Arsip({ lang, onOpen, onRegistered, onHelp }) {
  const [items, setItems] = useState(stashList);
  const fileRef = useRef(null);
  const L = lang === "id" ? LID : LEN;
  const [msg, setMsg] = useState("");

  // ---- akun online (cloud) ----
  const [email, setEmail] = useState(getEmail());
  const [pw, setPw] = useState("");
  const [logged, setLogged] = useState(!!getToken());
  const [cldMsg, setCldMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetMode, setResetMode] = useState(false); // mode "Lupa sandi?"
  const [gotCode, setGotCode] = useState(false);     // kode sudah keluar
  const [issuedCode, setIssuedCode] = useState("");
  const [sentEmail, setSentEmail] = useState(false); // kode dikirim via email (bukan inline)
  const [code, setCode] = useState("");
  const [newPw, setNewPw] = useState("");
  function flash(m) { setCldMsg(m); setTimeout(() => setCldMsg(""), 2600); }
  async function doRegister(ev) {
    ev.preventDefault();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return flash(L.cldMailBad);
    if (pw.length < 6) return flash(L.cldPwShort);
    setBusy(true);
    try { await register(email.trim().toLowerCase(), pw); setLogged(true); flash(L.cldRegOk); onRegistered && onRegistered(); }
    catch (e) { flash(L.cldFail + " " + e.message); }
    setBusy(false);
  }
  async function doLogin(ev) {
    ev.preventDefault();
    if (!email || !pw) return;
    setBusy(true);
    try { await login(email.trim().toLowerCase(), pw); setLogged(true); flash(L.cldLoginOk); }
    catch (e) { flash(L.cldFail + " " + e.message); }
    setBusy(false);
  }
  function doLogout() { clearSession(); setLogged(false); setPw(""); setResetMode(false); setGotCode(false); setCode(""); setNewPw(""); flash(L.cldLogout); }
  async function doForgot(ev) {
    ev.preventDefault();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return flash(L.cldMailBad);
    setBusy(true);
    try { const r = await forgotPassword(email.trim().toLowerCase()); const se = !!r.sent_email; setSentEmail(se); setGotCode(true); setIssuedCode(se ? "" : (r.reset_token || "")); flash(se ? L.cldCodeEmailed : `${L.cldCodeOk} ${r.reset_token}`); }
    catch (e) { flash(L.cldFail + " " + e.message); }
    setBusy(false);
  }
  async function doReset(ev) {
    ev.preventDefault();
    if (!code || newPw.length < 6) return flash(L.cldPwShort);
    setBusy(true);
    try { await resetPassword(email.trim().toLowerCase(), code.trim(), newPw); setResetMode(false); setLogged(true); setNewPw(""); setCode(""); setGotCode(false); setSentEmail(false); flash(L.cldResetOk); }
    catch (e) { flash(L.cldFail + " " + e.message); }
    setBusy(false);
  }
  async function doDeleteAccount() {
    if (!window.confirm(L.cldDelConfirm)) return;
    setBusy(true);
    try { await deleteAccount(); setLogged(false); setEmail(""); setPw(""); reload(); flash(L.cldDelOk); }
    catch (e) { flash(L.cldFail + " " + e.message); }
    setBusy(false);
  }
  async function doPush() {
    setBusy(true);
    try { const r = await syncUp(items); flash(`${L.cldPushed} ${r.added} · ${L.cldSkipped} ${r.skipped}`); }
    catch (e) { flash(L.cldNeedAuth + " " + e.message); }
    setBusy(false);
  }
  async function doPull() {
    setBusy(true);
    try {
      const r = await syncDown(stashImport);
      reload();
      flash(`${L.cldPulled} ${r.down} · ${L.cldAdded} ${r.added}`);
    } catch (e) { flash(L.cldNeedAuth + " " + e.message); }
    setBusy(false);
  }

  function reload() {
    setItems(stashList());
  }
  function remove(id) {
    stashDel(id);
    reload();
  }
  function copyMd(md, nm) {
    navigator.clipboard?.writeText(md);
    setMsg(`${L.arsipCopied} ${nm}`);
    setTimeout(() => setMsg(""), 1600);
  }
  function dlMd(it) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([it.md], { type: "text/markdown" }));
    a.download = `${it.name || "skill"}.SKILL.md`;
    a.click();
  }
  function doExport() {
    const blob = new Blob([stashExport()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "skillorbit-stash.json";
    a.click();
  }
  function onImport(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const rdr = new FileReader();
    rdr.onload = () => {
      const res = stashImport(String(rdr.result));
      reload();
      setMsg(res.error ? L.importerr : `${L.arsipImported} ${res.added}/${res.total}`);
      setTimeout(() => setMsg(""), 3000);
    };
    rdr.readAsText(f);
    e.target.value = "";
  }

  return (
    <section className="panel arsip">
      <h2 className="pnl-title">
        <Icon d={ICONS.box} /> {L.arsipTitle}
        <button className="help-chip" onClick={() => onHelp("arsip")} title={L.helpBtnT}><Icon d={ICONS.help} size={15} />{L.helpBtn}</button>
      </h2>
      <p className="muted">{L.arsipSub}</p>
      <p className="local-note">⚠️ {L.arsipLocalNote}</p>
      <div className="cloud-panel">
        {!logged ? (
          <div className="cloud-anon">
            <form className="cloud-form" onSubmit={doLogin}>
              <span className="cloud-h">☁️ {L.cldTitle}</span>
              <input className="inp" type="email" placeholder={L.cldMailPh} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              <input className="inp" type="password" placeholder={L.cldPwPh} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
              <div className="cloud-row">
                <button className="ghost sm" type="submit" disabled={busy}>{busy ? "…" : L.cldLogin}</button>
                <button className="ghost sm accent" type="button" disabled={busy} onClick={doRegister}>{busy ? "…" : L.cldReg}</button>
              </div>
              <button type="button" className="cloud-link" onClick={() => { setResetMode(!resetMode); setGotCode(false); setIssuedCode(""); setCode(""); setNewPw(""); setSentEmail(false); }}>
                {resetMode ? L.cldBackLogin : L.cldForgot}
              </button>
            </form>
            {resetMode && (
              <form className="cloud-form cloud-reset" onSubmit={gotCode ? doReset : doForgot}>
                <span className="cloud-h">{L.cldResetH} <em className="cloud-link-note">{L.cldResetNote}</em></span>
                {!gotCode ? (
                  <button className="ghost sm accent" type="submit" disabled={busy}>{busy ? "…" : L.cldSendCode}</button>
                ) : (
                  <>
                    {sentEmail ? (
                      <p className="cld-note">{L.cldCodeEmailed}</p>
                    ) : (
                      <p className="cld-code">{L.cldCodeIs} <b>{issuedCode}</b> <span className="muted">{L.cldCodeTtl}</span></p>
                    )}
                    <input className="inp" placeholder={L.cldCodePh} value={code || (sentEmail ? "" : issuedCode)} onChange={(e) => setCode(e.target.value)} />
                    <input className="inp" type="password" placeholder={L.cldNewPwPh} value={newPw} onChange={(e) => setNewPw(e.target.value)} autoComplete="new-password" />
                    <button className="ghost sm accent" type="submit" disabled={busy}>{busy ? "…" : L.cldResetting}</button>
                  </>
                )}
              </form>
            )}
          </div>
        ) : (
          <div className="cloud-signed">
            <span className="cloud-h">☁️ {L.cldInAs} <b>{getEmail()}</b></span>
            <div className="cloud-row">
              <button className="ghost sm" disabled={busy} onClick={doPush}>{busy ? "…" : L.cldPush}</button>
              <button className="ghost sm" disabled={busy} onClick={doPull}>{busy ? "…" : L.cldPull}</button>
              <button className="ghost sm danger" onClick={doLogout}>{L.cldLogout}</button>
            </div>
            <div className="cloud-row">
              <button className="ghost sm danger" disabled={busy} onClick={doDeleteAccount}>{busy ? "…" : L.cldDelAccount}</button>
            </div>
            <p className="muted cld-hint">{L.cldSignedHint}</p>
          </div>
        )}
        {cldMsg && <p className="loaded-note">{cldMsg}</p>}
      </div>
      <div className="arsip-actions">
        <button className="ghost sm" onClick={doExport}>
          {L.arsipExport}
        </button>
        <button className="ghost sm" onClick={() => fileRef.current && fileRef.current.click()}>
          {L.arsipImport}
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" style={{ display: "none" }} onChange={onImport} />
        {msg && <span className="loaded-note">{msg}</span>}
      </div>

      {items.length === 0 ? (
        <div className="muted gal-empty">— {L.arsipEmpty} —</div>
      ) : (
        <div className="stash-list">
          {items.map((it) => (
            <div className="g-card stash-row" key={it.id}>
              <div className="stash-head">
                <span className="stash-name">{it.name}</span>
                <span className="stash-meta">
                  {it.src ? <a className="g-link" href={it.src} target="_blank" rel="noreferrer">src ↗</a> : null}
                  <span className="stash-created">{new Date(it.created).toLocaleDateString(lang === "id" ? "id-ID" : "en-US")}</span>
                </span>
              </div>
              {it.desc && <div className="gh-desc">{it.desc}</div>}
              <div className="stash-actions">
                <button className="ghost sm" onClick={() => onOpen(it)}>{L.arsipRacik}</button>
                <button className="ghost sm" onClick={() => copyMd(it.md, it.name)}>
                  <Icon d={ICONS.copy} size={13} /> {L.arsipCopy}
                </button>
                <button className="ghost sm" onClick={() => dlMd(it)}>
                  <Icon d={ICONS.dl} size={13} /> {L.arsipDl}
                </button>
                <button className="ghost sm danger" onClick={() => remove(it.id)}>{L.arsipDel}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Radar({ lang, onHelp }) {
  const [rows, setRows] = useState(SKILLS);
  const [q, setQ] = useState("");
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(false);

  // auto-muat angka live saat Radar pertama kali dibuka
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const max = Math.max(...rows.map((r) => r.stars));

  async function refresh() {
    setLoading(true);
    try {
      const reps = SKILLS.map((s) => s.repo);
      const out = await fetch(
        `https://api.github.com/repos?${reps.map((r, i) => `names[${i}]=${encodeURIComponent(r)}`).join("&")}`
      );
      const data = await out.json();
      if (Array.isArray(data)) {
        const map = Object.fromEntries(data.filter((x) => x && x.full_name).map((x) => [x.full_name, x]));
        setRows(
          SKILLS.map((s) => ({
            ...s,
            stars: map[s.repo]?.stargazers_count ?? s.stars,
            forks: map[s.repo]?.forks_count ?? s.forks,
            liveNow: true,
          }))
        );
        setLive(true);
      }
    } catch (e) {
      setLive(false);
    }
    setLoading(false);
  }

  const list = rows.filter(
    (r) => r.name.toLowerCase().includes(q.toLowerCase()) || r.repo.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="radar">
      <div className="radar-head">
        <div>
          <h2 className="pnl-title"><Icon d={ICONS.radar} /> RADAR <span className="muted">— trending agent skills</span>
            <button className="help-chip" onClick={() => onHelp("radar")} title={lang === "id" ? "Panduan halaman ini" : "This page's guide"}><Icon d={ICONS.help} size={15} />{lang === "id" ? "Panduan" : "Guide"}</button>
          </h2>
          <p className="sub">{RADAR_SUB}</p>
        </div>
        <div className="radar-ctl">
          <div className="search">
            <Icon d={ICONS.search} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={qPh} />
          </div>
          <button className={live ? "solid ok" : "solid"} onClick={refresh} disabled={loading}>
            <Icon d={ICONS.refresh} /> {loading ? "…" : live ? "LIVE" : "REFRESH"}
          </button>
        </div>
      </div>

      <div className="legend">
        {PATTERNS.map((p) => (
          <span className="legend-item" key={p.k}>
            <span className="dot" style={{ background: p.c }} /> {p.k}: <em>{p.d}</em>
          </span>
        ))}
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>#</th><th>Repo</th><th className="r">★ stars</th><th className="r">⭑ forks</th>
              <th>Pola</th><th>Catatan</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r, i) => (
              <tr key={r.id}>
                <td className="muted">{String(i + 1).padStart(2, "0")}</td>
                <td>
                  <div className="repo">
                    <a href={`https://github.com/${r.repo}`} target="_blank" rel="noreferrer">{r.repo}</a>
                    <div className="bar"><i style={{ width: `${(r.stars / max) * 100}%`, background: r.color }} /></div>
                  </div>
                </td>
                <td className="r stars">{r.stars.toLocaleString()}</td>
                <td className="r muted">{r.forks.toLocaleString()}</td>
                <td><span className="tag" style={{ color: r.color }}>{r.pattern}</span></td>
                <td className="note">{r.note}</td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan="6" className="empty">— {qPhEmpty} —</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="data-note">{dataNote}</p>
    </div>
  );
}

const LID = {
  forgeTitle: "FORGE · PERACIK SKILL",
  homeNote: "Simpan, rakit, dan bawa koleksi skillmu ke mana saja.",
  homeForgeT: "Forge — Racik skill",
  homeForgeD: "Buat skill baru: dari galeri, dari repo GitHub, atau dari nol.",
  homeForgeB: "Buka Forge →",
  homeRadarT: "Radar — tren skill",
  homeRadarD: "Lihat skill yang lagi naik di GitHub. Bintang asli, bukan dikarang.",
  homeRadarB: "Buka Radar →",
  homeArsipT: "Arsip — koleksi & cloud",
  homeArsipD: "Simpan skillmu, masuk akun online, ambil di semua perangkat.",
  homeArsipB: "Buka Arsip →",
  tourTag: "Tur",
  tourSkip: "Lewati",
  tourNext: "Lanjut",
  tourDone: "Selesai",
  TOUR_STEPS: [
    { t: "Selamat datang", b: "SKILL//ORBIT menyimpan, meramut, dan membawa koleksi skill-mu. Tur ini memperkenalkan tiap modul — kapan pun mau, tekan tombol Tour di pojok kanan bawah.", go: null, btn: "Lanjut →" },
    { t: "Beranda", b: "Tiga kartu besar: FORGE (racik skill), RADAR (tren GitHub), ARSIP (koleksi & cloud). Klik kartu untuk masuk.", go: "home", btn: "Lanjut →" },
    { t: "FORGE — racik skill", b: "Buat skill dari galeri, dari repo GitHub, atau dari nol: isi form di kiri, lihat pratinjau file SKILL.md di kanan, lalu SIMPAN.", go: "forge", btn: "Lanjut →" },
    { t: "Telusur GitHub", b: "Cari skill publik di GitHub lalu klik Racik untuk menariknya jadi draf yang bisa kamu ubah — tak buntu walau reponya tanpa SKILL.md.", go: "forge", btn: "Lanjut →" },
    { t: "RADAR — tren", b: "Menampilkan skill yang lagi populer dengan bintang asli GitHub. Tekan REFRESH untuk angka terbaru.", go: "radar", btn: "Lanjut →" },
    { t: "ARSIP & akun", b: "Semua skill racikanmu ada di sini. Akun online (opsional) untuk menyimpan di semua perangkat — semua fitur tetap dipakai tanpa login.", go: "arsip", btn: "Selesai" },
  ],
  helpBtn: "Panduan",
  helpBtnT: "Panduan halaman ini",
  helpTag: "Panduan",
  helpClose: "Mengerti",
  draftTag: "MERACIK DI SINI",
  draftHint: "Draf sudah dimuat. Ubah kolom-kolom di panel kiri ini (nama, deskripsi, tag, isi) — pratinjau di kanan menyesuaikan otomatis.",
  nNote: "Lowercase + tanda hubung. Ini nama file & pemicu skill.",
  dNote: "1 kalimat: apa yang skill lakukan. Yang tampil di galeri & di kolom pemicu.",
  authorNote: "Kamu / tim pembuatnya.",
  tagsNote: "Kata kunci pencarian — pisah koma.",
  sNote: "Isi utama: langkah & perilaku yang dijalankan. Tuliskan cara kamu bekerja di sini (boleh sesingkat mungkin).",
  behavNote: "2–4 kata pembentuk logika: bagaimana agent bersikap.",
  toolsNote: "Alat yang diizinkan dipakai skill ini (centang yang relevan).",
  mmTitle: "JADIKAN MILIKMU — 4 yang layak kau sentuh",
  mmSub: "Draf ini dari repo orang lain. Untuk menjadikannya skill-mu, setel bagian di bawah — yang tak kau sentuh biarkan apa adanya, tetap valid.",
  mmName: "Nama",
  mmNameH: "ganti jadi nama kasusmu",
  mmDesc: "Deskripsi",
  mmDescH: "tulis dengan caramu bekerja (≤60)",
  mmTags: "Tags",
  mmTagsH: "tambah sektor / bahasa / alatmu",
  mmBody: "Isi & langkah",
  mmBodyH: "ubah urutan & contohnya sesuai caramu",
  mmFocus: "Fokus ▸",
  helpFull: "Buka panduan lengkap (tab baru) ↗",
  helpPersist: "Tombol Panduan (?) selalu ada di pojok header tiap halaman — buka kapan pun.",
  HELP_T: { home: "Beranda", forge: "FORGE · racik skill", radar: "RADAR · tren", arsip: "ARSIP & akun" },
  HELP: {
    home: [
      "Beranda memuat 3 kartu besar: Forge (buat skill), Radar (tren GitHub), Arsip (koleksi & cloud).",
      "Klik kartu untuk masuk ke modulnya; logo di kiri atas kembali ke beranda.",
      "Tombol Tour di pojok kanan bawah memandu seluruh aplikasi kapan pun.",
    ],
    forge: [
      "Kiri — galeri: pilih pola skill lalu 'Terapkan', atau isi manual (nama, deskripsi, tag, penulis, versi).",
      "Telusur GitHub: cari skill publik, klik 'Racik' untuk menariknya jadi draf yang bisa kamu ubah.",
      "Kanan — PRATINJAU: file SKILL.md hasil racikanmu; itulah yang akan disimpan.",
      "Klik SIMPAN untuk menyimpan skill ke koleksi (terbuka di tab ARSIP).",
    ],
    radar: [
      "Daftar skill yang sedang populer — jumlah bintang dibaca langsung dari GitHub API (asli, bukan dikarang).",
      "Tekan REFRESH untuk menarik angka terbaru.",
      "Klik sebuah item untuk membuka repo sumbernya di GitHub.",
    ],
    arsip: [
      "Semua skill rakitanmu tampil di sini — klik untuk membuka, mengedit, atau meng-ekspor ke file.",
      "Akun online (opsional): Daftar / Masuk untuk menyimpan skill ke server dan mengambilnya di perangkat lain.",
      "Lupa sandi? Isi email → kode reset dikirim ke email kamu (Gmail).",
      "Hapus akun membersihkan data cloud; koleksi lokal di perangkat ini tetap aman.",
    ],
  },
  gal: "Galeri (pilih untuk diracik → Terapkan)",
  galPh: "cari skill…",
  galPhNo: "tak ketemu",
  galApply: "Terapkan",
  nLabel: "Nama skill",
  dLabel: "Deskripsi (maks 60 karakter)",
  dLimit: "/60",
  rLabel: "related_skills",
  rPh: "skill lain di repo yang sama (opsional)",
  sLabel: "Ringkasan / isi skill",
  sPh: "Singkat saja: apa yang ia lakukan, apa yang tidak. Nanti dipadukan otomatis.",
  behav: "Perilaku (atur logikanya)",
  tools: "Alat (yang boleh dipakai)",
  niche: "Tajamkan: tambahkan blok 'jangan dipakai untuk hal di luar lingkup'",
  preview: "PRATINJAU",
  previewCap: "File SKILL.md (mentah) — hasil racikan yang akan kamu simpan.",
  copy: "SALIN",
  dl: "UNDUH",
  saveStash: "SIMPAN",
  saved: "Tersimpan ✓",
  loaded: "dimuat dari ",
  ghTitle: "TELUSUR GITHUB — tarik skill publik nyata",
  ghPh: "cari repo skill (mis. 'whatsapp skill')…",
  ghSearch: "Telusur",
  ghLoading: "…",
  ghNone: "tak ditemukan. coba kata kunci lain.",
  ghNoDesc: "tanpa deskripsi",
  ghRacik: "→ Racik & edit",
  ghPick: "Pilih ▸",
  ghSelTag: "✓ Dipilih",
  ghSelTitle: "DESKRIPSI ASLI REPOSITORY",
  ghSelHint:
    "Ini deskripsi yang DITULIS pemilik code di GitHub — bukan template kami. Kalau pas, tekan Racik: draf-nya otomatis memakai kata-kata ini.",
  ghSelMeta: "update ",
  ghSelCancel: "Batal ✕",
  ghSelUnsel: "klik untuk batal",
  errLimit: "⛔ Jatah API GitHub sementara habis. Tunggu sebentar, lalu coba lagi.",
  errSearch: "⚠️ Pencarian gagal: ",
  errNoSkill: (r) => `⚠️ Tak ada SKILL.md ditemukan di ${r}.`,
  ghNoSkillInfo: "Reponya tak punya file SKILL.md, jadi saya buat draf darinya (dari README atau nama repo) — silakan rapikan di Forge sebelum disimpan.",
  ghNoSkillDraft: (r) => `Draf skill dari repo ${r}.`,
  arsipTitle: "ARSIP — koleksi skill racikanmu",
  arsipSub: "Semua yang kamu simpan dari FORGE, ada di sini.",
  arsipLocalNote: "Tersimpan di perangkatmu (localStorage). Masuk akun online di atas untuk simpan & ambil skill di semua perangkat.",
  arsipEmpty: "belum ada. Racik di FORGE lalu klik SIMPAN.",
  arsipRacik: "Racik lagi →",
  arsipCopy: "Salin",
  arsipDl: "Unduh",
  arsipDel: "Hapus",
  arsipExport: "Ekspor JSON",
  arsipImport: "Impor JSON",
  arsipCopied: "Disalin: ",
  arsipImported: "Diimpor: ",
  importerr: "File JSON tidak valid.",
  cldTitle: "Akun online",
  cldMailPh: "email",
  cldPwPh: "kata sandi (min. 6)",
  cldLogin: "Masuk",
  cldReg: "Daftar akun baru",
  cldHint: "Bikin akun untuk menyimpan skill racikanmu ke cloud dan mengambinya lagi dari perangkat lain.",
  cldInAs: "Masuk sebagai",
  cldPush: "▲ Simpan ke cloud",
  cldPull: "▼ Ambil dari cloud",
  cldLogout: "Keluar",
  cldSignedHint: "Skill yang sudah tersimpan ditandai; tanggal sinkron memakai waktu server.",
  cldMailBad: "Email tak valid.",
  cldPwShort: "Kata sandi minimal 6 karakter.",
  cldRegOk: "Akun dibuat ✓",
  cldLoginOk: "Berhasil masuk ✓",
  cldLogoutMsg: "Keluar dari akun.",
  cldFail: "Gagal:",
  cldNeedAuth: "Perlu masuk akun dulu.",
  cldPushed: "Tersimpan ke cloud:",
  cldPulled: "Diambil dari cloud:",
  cldSkipped: "sudah ada,",
  cldAdded: "ditambah",
  cldForgot: "Lupa sandi?",
  cldBackLogin: "← Kembali ke masuk",
  cldResetH: "Atur ulang sandi",
  cldResetNote: "(kode ditampilkan di sini — email otomatis belum dipasang)",
  cldSendCode: "Kirim kode",
  cldCodeIs: "Kode kamu:",
  cldCodeTtl: "(berlaku 15 menit)",
  cldCodePh: "masukkan kode",
  cldNewPwPh: "sandi baru (min. 6)",
  cldResetting: "Setel ulang & masuk",
  cldCodeOk: "Kode dikirim:",
  cldCodeEmailed: "Kode telah dikirim ke emailmu. Cek inbox/spam, isi di bawah.",
  cldResetOk: "Sandi diubah, kamu masuk ✓",
  cldDelAccount: "Hapus akun",
  cldDelConfirm: "Hapus akun ini permanen? Seluruh skill di cloud ikut terhapus.",
  cldDelOk: "Akun dihapus.",
};
const LEN = {
  forgeTitle: "FORGE · SKILL COMPOSER",
  homeNote: "Stash, compose, and carry your skills anywhere.",
  homeForgeT: "Forge — Compose a skill",
  homeForgeD: "Build a new skill: from the gallery, a GitHub repo, or from scratch.",
  homeForgeB: "Open Forge →",
  homeRadarT: "Radar — trending skills",
  homeRadarD: "See skills getting popular on GitHub. Real stars, not invented.",
  homeRadarB: "Open Radar →",
  homeArsipT: "Stash — collection & cloud",
  homeArsipD: "Save your skills, sign in online, and pick them up on any device.",
  homeArsipB: "Open Stash →",
  tourTag: "Tour",
  tourSkip: "Skip",
  tourNext: "Next",
  tourDone: "Done",
  TOUR_STEPS: [
    { t: "Welcome", b: "SKILL//ORBIT helps you stash, compose, and carry your skills anywhere. This tour introduces each module — reopen it anytime via the Tour button, bottom-right.", go: null, btn: "Next →" },
    { t: "Home", b: "Three big cards: FORGE (compose skills), RADAR (GitHub trends), ARSIP (stash & cloud). Click a card to enter.", go: "home", btn: "Next →" },
    { t: "FORGE — compose", b: "Build a skill from the gallery, a GitHub repo, or from scratch: fill the form left, preview the SKILL.md file right, then SAVE.", go: "forge", btn: "Next →" },
    { t: "Browse GitHub", b: "Search public skills on GitHub and hit Racik to pull one in as a scratch draft you can edit — it never dead-ends, even if a repo lacks SKILL.md.", go: "forge", btn: "Next →" },
    { t: "RADAR — trends", b: "Shows trending skills with real GitHub stars. Hit REFRESH for fresh numbers.", go: "radar", btn: "Next →" },
    { t: "ARSIP & account", b: "Every skill you compose lands here. An online account (optional) syncs them across devices — all features still work without logging in.", go: "arsip", btn: "Done" },
  ],
  helpBtn: "Guide",
  helpBtnT: "This page's guide",
  helpTag: "Guide",
  helpClose: "Got it",
  draftTag: "COMPOSE HERE",
  draftHint: "Draft loaded. Edit the fields in this left panel (name, description, tags, body) — the preview on the right updates automatically.",
  nNote: "Lowercase, hyphenated. This becomes the file name & skill trigger.",
  dNote: "One sentence: what the skill does. Shown in the gallery & as trigger.",
  authorNote: "You / the maker team.",
  tagsNote: "Search keywords — comma-separated.",
  sNote: "The main body: steps & behaviours it runs. Write how you work here (keep it short if you like).",
  behavNote: "2–4 words shaping the logic: how the agent behaves.",
  toolsNote: "Tools this skill may use (tick what's relevant).",
  mmTitle: "MAKE IT YOURS — 4 worth touching",
  mmSub: "This draft is from someone else's repo. To turn it into your skill, tweak the bits below — leave the rest as-is, it stays valid.",
  mmName: "Name",
  mmNameH: "rename to your case",
  mmDesc: "Description",
  mmDescH: "write in your own way of working (≤60)",
  mmTags: "Tags",
  mmTagsH: "add your sector / language / tools",
  mmBody: "Body & steps",
  mmBodyH: "reorder & swap examples to your workflow",
  mmFocus: "Focus ▸",
  helpFull: "Open the full guide (new tab) ↗",
  helpPersist: "The Guide (?) button stays in the corner of each page's header — open it anytime.",
  HELP_T: { home: "Home", forge: "FORGE · compose", radar: "RADAR · trends", arsip: "ARSIP & account" },
  HELP: {
    home: [
      "Home holds 3 big cards: Forge (compose skills), Radar (GitHub trends), Arsip (stash & cloud).",
      "Click a card to enter; the logo top-left returns to home.",
      "The Tour button bottom-right walks you through the whole app anytime.",
    ],
    forge: [
      "Left — gallery: pick a skill pattern and 'Apply', or fill in manually (name, description, tags, author, version).",
      "Browse GitHub: search public skills, hit 'Racik' to pull one in as an editable draft.",
      "Right — PREVIEW: the SKILL.md file your composition produces; that's what gets saved.",
      "Click SAVE to store the skill in your collection (opens the ARSIP page).",
    ],
    radar: [
      "Lists trending skills — star counts read straight from the GitHub API (real, not made up).",
      "Hit REFRESH to pull the latest numbers.",
      "Click an item to open its source repo on GitHub.",
    ],
    arsip: [
      "Every skill you compose appears here — click to open, edit, or export to a file.",
      "Online account (optional): Register / Sign in to push skills to the server and fetch them on other devices.",
      "Forgot password? Enter your email — a reset code is emailed to you (Gmail).",
      "Deleting your account clears cloud data; your local collection on this device stays safe.",
    ],
  },
  gal: "Gallery (pick skills to compose → Apply)",
  galPh: "search skills…",
  galPhNo: "not found",
  galApply: "Apply",
  nLabel: "Skill name",
  dLabel: "Description (max 60 chars)",
  dLimit: "/60",
  rLabel: "related_skills",
  rPh: "other skills in the same repo (optional)",
  sLabel: "Summary / skill body",
  sPh: "Short: what it does, what it doesn't. Composed automatically.",
  behav: "Behaviors (shape the logic)",
  tools: "Tools (allowed set)",
  niche: "Sharpen: add 'don't use for' scope block",
  preview: "PREVIEW",
  previewCap: "SKILL.md file (raw) — the recipe you'll save.",
  copy: "COPY",
  dl: "DOWNLOAD",
  saveStash: "SAVE",
  saved: "Saved ✓",
  loaded: "loaded from ",
  ghTitle: "GITHUB SEARCH — pull real public skills",
  ghPh: "search skill repos (e.g. 'whatsapp skill')…",
  ghSearch: "Search",
  ghLoading: "…",
  ghNone: "nothing found. try another term.",
  ghNoDesc: "no description",
  ghRacik: "→ Compose",
  ghPick: "Pick ▸",
  ghSelTag: "✓ Picked",
  ghSelTitle: "REAL REPO DESCRIPTION",
  ghSelHint:
    "This is the description WRITTEN by the repo owner on GitHub — not our template. If it fits, press Compose: the draft uses these exact words.",
  ghSelMeta: "updated ",
  ghSelCancel: "Cancel ✕",
  ghSelUnsel: "click to cancel",
  errLimit: "⛔ GitHub API rate-limit reached. Wait a bit and retry.",
  errSearch: "⚠️ Search failed: ",
  errNoSkill: (r) => `⚠️ No SKILL.md found in ${r}.`,
  ghNoSkillInfo: "This repo has no SKILL.md, so I made a draft from it (its README or name) — polish it in Forge before saving.",
  ghNoSkillDraft: (r) => `Draft skill from repo ${r}.`,
  arsipTitle: "STASH — your composed skills",
  arsipSub: "Every skill you save from FORGE lives here.",
  arsipLocalNote: "Stored on this device (localStorage). Sign in above to save & fetch your skills across devices.",
  arsipEmpty: "empty. Compose in FORGE and hit SAVE.",
  arsipRacik: "Re-compose →",
  arsipCopy: "Copy",
  arsipDl: "Download",
  arsipDel: "Delete",
  arsipExport: "Export JSON",
  arsipImport: "Import JSON",
  arsipCopied: "Copied: ",
  arsipImported: "Imported: ",
  importerr: "Invalid JSON file.",
  cldTitle: "Online account",
  cldMailPh: "email",
  cldPwPh: "password (min. 6)",
  cldLogin: "Sign in",
  cldReg: "Create account",
  cldHint: "Create an account to save your composed skills to the cloud and fetch them from any device.",
  cldInAs: "Signed in as",
  cldPush: "▲ Save to cloud",
  cldPull: "▼ Fetch from cloud",
  cldLogout: "Sign out",
  cldSignedHint: "Already-saved skills are skipped; sync uses server timestamps.",
  cldMailBad: "Invalid email.",
  cldPwShort: "Password needs at least 6 characters.",
  cldRegOk: "Account created ✓",
  cldLoginOk: "Signed in ✓",
  cldLogoutMsg: "Signed out.",
  cldFail: "Failed:",
  cldNeedAuth: "Please sign in first.",
  cldPushed: "Saved to cloud:",
  cldPulled: "Fetched from cloud:",
  cldSkipped: "already there,",
  cldAdded: "added",
  cldForgot: "Forgot password?",
  cldBackLogin: "← Back to sign in",
  cldResetH: "Reset password",
  cldResetNote: "(code shown here — no auto-email yet)",
  cldSendCode: "Send code",
  cldCodeIs: "Your code:",
  cldCodeTtl: "(valid 15 min)",
  cldCodePh: "enter code",
  cldNewPwPh: "new password (min. 6)",
  cldResetting: "Reset & sign in",
  cldCodeOk: "Code issued:",
  cldCodeEmailed: "Code sent to your email — check inbox/spam, and enter it below.",
  cldResetOk: "Password changed, signed in ✓",
  cldDelAccount: "Delete account",
  cldDelConfirm: "Delete this account permanently? All cloud skills will be removed.",
  cldDelOk: "Account deleted.",
};
const qPh = "cari nama / repo…";
const qPhEmpty = "cari nama / repo…";
const RADAR_SUB = "Daftar kurasi skill yang sedang populer — bintang dibaca langsung dari GitHub API, bukan dikarang. Tekan REFRESH untuk menarik angka terbaru.";
const dataNote = "Snapshot awal: 2026-09-02/03 via GitHub REST API. Pola (Tajam/Terukur/Cerita/Kurasi/Resmi) adalah label editorial dari analisa formula viral, bukan metrik resmi.";
