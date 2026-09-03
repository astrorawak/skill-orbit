import { useMemo, useState, useEffect, useRef } from "react";
import { SKILLS, PATTERNS } from "./data";
import { BEHAVIORS, TOOL_OPTS, generateSkill, validateDesc } from "./forge";
import GALLERY from "./gallery";
import { stashList, stashAdd, stashDel, stashExport, stashImport, parseSkillFile } from "./stash";

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
};

export default function App() {
  const [tab, setTab] = useState("forge");
  const [lang, setLang] = useState("id");
  const [draft, setDraft] = useState(null);

  function loadDraft(d) {
    setDraft(d);
    setTab("forge");
  }

  return (
    <div className="shell">
      <div className="bg-grid" aria-hidden="true" />
      <div className="orb o1" aria-hidden="true" />
      <div className="orb o2" aria-hidden="true" />
      <Header tab={tab} setTab={setTab} lang={lang} setLang={setLang} />
      <main className="stage">
        {tab === "forge" ? (
          <Forge lang={lang} draft={draft} setDraft={setDraft} />
        ) : tab === "radar" ? (
          <Radar lang={lang} />
        ) : (
          <Arsip lang={lang} onOpen={loadDraft} />
        )}
      </main>
      <footer className="foot">
        <span>SKILL//ORBIT — {lang === "id" ? "pendahulu untuk gelombang skills. angka dari GitHub API." : "precursor to the skills wave. numbers from GitHub API."}</span>
        <span className="pulse-dot" /> <span>{lang === "id" ? "live" : "live"}</span>
      </footer>
    </div>
  );
}

function Header({ tab, setTab, lang, setLang }) {
  return (
    <header className="top">
      <div className="brand">
        <span className="brand-star">✦</span>
        <span className="brand-name">SKILL<span className="accent">//</span>ORBIT</span>
      </div>
      <nav className="tabs">
        <button className={tab === "forge" ? "tab on" : "tab"} onClick={() => setTab("forge")}>
          <Icon d={ICONS.gear} /> {lang === "id" ? "FORGE" : "FORGE"}
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

function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span className="flabel">{label}</span>
      {children}
      {hint ? <span className="fhint">{hint}</span> : null}
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

function Forge({ lang, draft = null, setDraft }) {
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
  async function loadFromRepo(repo, branch) {
    setGhLoading(true);
    setGhErr("");
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
        setName(p.name || p.name || repo.split("/").pop());
        setDesc(p.desc || "");
        if (p.author) setAuthor(p.author);
        if (p.tags) setTags(p.tags);
        setRelated(p.related);
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
    setGhErr(L.errNoSkill(repo));
    return false;
  }
  const [loadedFrom, setLoadedFrom] = useState("");
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
        </h2>
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
          {ghDone && !ghErr && ghRes.length === 0 && (
            <div className="muted gal-empty">— {L.ghNone} —</div>
          )}
          {ghRes.length > 0 && (
            <div className="gh-grid">
              {ghRes.map((r) => (
                <div className="g-card gh-row" key={r.id}>
                  <div className="gh-name">
                    {r.full_name}
                    <span className="gh-stars">★ {Math.round(r.stargazers_count / 100) / 10}k</span>
                  </div>
                  <div className="gh-desc">{r.description || L.ghNoDesc}</div>
                  <div className="gh-actions">
                    <button
                      className="ghost sm"
                      onClick={() => loadFromRepo(r.full_name, r.default_branch || "main")}
                      disabled={ghLoading}
                    >
                      {ghLoading ? L.ghLoading : L.ghRacik}
                    </button>
                    <a className="g-link" href={r.html_url} target="_blank" rel="noreferrer">
                      github ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <Field label={L.nLabel}>
          <input value={name} onChange={(e) => setName(e.target.value)} spellCheck="false" />
        </Field>
        <Field
          label={L.dLabel}
          hint={<span className={v.ok ? "s ok" : "s bad"}>{v.len}{L.dLimit}</span>}
        >
          <textarea rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} spellCheck="false" />
        </Field>
        <div className="row2">
          <Field label="author">
            <input value={author} onChange={(e) => setAuthor(e.target.value)} />
          </Field>
          <Field label="tags">
            <input value={tags} onChange={(e) => setTags(e.target.value)} />
          </Field>
        </div>
        <Field label={L.rLabel}>
          <input value={related} onChange={(e) => setRelated(e.target.value)} placeholder={L.rPh} />
        </Field>
        <Field label={L.sLabel}>
          <textarea rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder={L.sPh} />
        </Field>

        <div className="block">
          <span className="grp">{L.behav}</span>
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
        <pre className="md">{markdown}</pre>
      </section>
    </div>
  );
}

function Arsip({ lang, onOpen }) {
  const [items, setItems] = useState(stashList);
  const fileRef = useRef(null);
  const L = lang === "id" ? LID : LEN;
  const [msg, setMsg] = useState("");

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
      </h2>
      <p className="muted">{L.arsipSub}</p>
      <p className="local-note">⚠️ {L.arsipLocalNote}</p>
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

function Radar() {
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
          <h2 className="pnl-title"><Icon d={ICONS.radar} /> RADAR <span className="muted">— trending agent skills</span></h2>
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
  errLimit: "⛔ Jatah API GitHub sementara habis. Tunggu sebentar, lalu coba lagi.",
  errSearch: "⚠️ Pencarian gagal: ",
  errNoSkill: (r) => `⚠️ Tak ada SKILL.md ditemukan di ${r}.`,
  arsipTitle: "ARSIP — koleksi skill racikanmu",
  arsipSub: "Semua yang kamu simpan dari FORGE, ada di sini.",
  arsipLocalNote: "Disimpan di perangkat/browser ini (localStorage) — belum akun online. Format JSON siap nyambung ke akun publik (butuh backend).",
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
};
const LEN = {
  forgeTitle: "FORGE · SKILL COMPOSER",
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
  errLimit: "⛔ GitHub API rate-limit reached. Wait a bit and retry.",
  errSearch: "⚠️ Search failed: ",
  errNoSkill: (r) => `⚠️ No SKILL.md found in ${r}.`,
  arsipTitle: "STASH — your composed skills",
  arsipSub: "Every skill you save from FORGE lives here.",
  arsipLocalNote: "Stored on this device/browser (localStorage) — no online account yet. JSON format is ready to wire to a public account (needs a backend).",
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
};
const qPh = "cari nama / repo…";
const qPhEmpty = "cari nama / repo…";
const RADAR_SUB = "Daftar kurasi skill yang sedang populer — bintang dibaca langsung dari GitHub API, bukan dikarang. Tekan REFRESH untuk menarik angka terbaru.";
const dataNote = "Snapshot awal: 2026-09-02/03 via GitHub REST API. Pola (Tajam/Terukur/Cerita/Kurasi/Resmi) adalah label editorial dari analisa formula viral, bukan metrik resmi.";
