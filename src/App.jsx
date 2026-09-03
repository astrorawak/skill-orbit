import { useMemo, useState, useEffect } from "react";
import { SKILLS, PATTERNS } from "./data";
import { BEHAVIORS, TOOL_OPTS, generateSkill, validateDesc } from "./forge";

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
};

export default function App() {
  const [tab, setTab] = useState("forge");
  const [lang, setLang] = useState("id");

  return (
    <div className="shell">
      <div className="bg-grid" aria-hidden="true" />
      <div className="orb o1" aria-hidden="true" />
      <div className="orb o2" aria-hidden="true" />
      <Header tab={tab} setTab={setTab} lang={lang} setLang={setLang} />
      <main className="stage">
        {tab === "forge" ? <Forge lang={lang} /> : <Radar lang={lang} />}
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
          <Icon d={ICONS.radar} /> {lang === "id" ? "RADAR" : "RADAR"}
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

function Forge({ lang }) {
  const [name, setName] = useState("rekap-keuangan-ternak");
  const [desc, setDesc] = useState(lang === "id" ? "Rekap keuangan dan untung-rugi usaha ternak otomatis." : "Auto bookkeeping & P&L for a livestock venture.");
  const [author, setAuthor] = useState("Karman (karman-astro), Hermes Agent");
  const [tags, setTags] = useState("Agro, Ternak, Keuangan, Otomasi");
  const [related, setRelated] = useState("");
  const [summary, setSummary] = useState("");
  const [behaviors, setBehaviors] = useState(["tajam", "terukur"]);
  const [tools, setTools] = useState(["files", "execute"]);
  const [niche, setNiche] = useState(true);
  const [copied, setCopied] = useState(false);

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
            <button className="ghost" onClick={copy}>
              <Icon d={copied ? ICONS.check : ICONS.copy} /> {copied ? "OK" : L.copy}
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

function Radar() {
  const [rows, setRows] = useState(SKILLS);
  const [q, setQ] = useState("");
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(false);

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
};
const LEN = {
  forgeTitle: "FORGE · SKILL COMPOSER",
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
};
const qPh = "cari nama / repo…";
const qPhEmpty = "cari nama / repo…";
const RADAR_SUB = "Daftar kurasi skill yang sedang populer — bintang dibaca langsung dari GitHub API, bukan dikarang. Tekan REFRESH untuk menarik angka terbaru.";
const dataNote = "Snapshot awal: 2026-09-02/03 via GitHub REST API. Pola (Tajam/Terukur/Cerita/Kurasi/Resmi) adalah label editorial dari analisa formula viral, bukan metrik resmi.";
