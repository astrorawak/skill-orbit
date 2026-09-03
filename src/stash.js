// ==== SKILL//ORBIT — stash: simpan skill hasil racikan di perangkat (browser) ====
// localStorage setempat. Format JSON siap nyambung ke akun publik (backend) nanti.
const KEY = "skillorbit-stash-v1";

export function stashList() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function stashAdd({ name, desc, md, lang, src }) {
  const list = stashList();
  const item = {
    id: "s-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: name || "tanpa-nama",
    desc,
    md,
    lang,
    src: src || "",
    created: new Date().toISOString(),
  };
  list.unshift(item);
  localStorage.setItem(KEY, JSON.stringify(list));
  return item;
}

export function stashDel(id) {
  const list = stashList().filter((x) => x.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
  return list;
}

export function stashUp(id, patch) {
  const list = stashList().map((x) => (x.id === id ? { ...x, ...patch } : x));
  localStorage.setItem(KEY, JSON.stringify(list));
  return list;
}

export function stashExport() {
  return JSON.stringify({ app: "skillorbit", version: 1, items: stashList() }, null, 2);
}

export function stashImport(jsonText) {
  try {
    const data = JSON.parse(jsonText);
    const items = Array.isArray(data) ? data : data && Array.isArray(data.items) ? data.items : [];
    const have = stashList();
    const ids = new Set(have.map((x) => x.id));
    const fresh = [];
    for (const it of items) {
      if (!it || !it.md) continue;
      // dedup: id sama & sudah ada di stash -> lewati (impor ulang ekspor yang sama)
      if (it.id && ids.has(it.id)) continue;
      const id = it.id || "s-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      ids.add(id);
      fresh.push({ id, name: it.name || "tanpa-nama", desc: it.desc || "", md: it.md, lang: it.lang || "id", src: it.src || "", created: it.created || new Date().toISOString() });
    }
    const merged = [...fresh, ...have].sort((a, b) => new Date(b.created) - new Date(a.created));
    localStorage.setItem(KEY, JSON.stringify(merged));
    return { added: fresh.length, total: merged.length };
  } catch (e) {
    return { added: 0, total: stashList().length, error: e.message };
  }
}

// parse frontmatter sederhana dari sebuah SKILL.md (tanpa dependency YAML)
export function parseSkillFile(md) {
  const clean = (s) => (s || "").trim();
  let fm = "";
  if (md.startsWith("---")) {
    const end = md.indexOf("\n---", 3);
    if (end > 0) fm = md.slice(3, end);
  }
  const line = (k) => {
    const re = new RegExp(`^${k}\\s*:\\s*(.*)$`, "m");
    const m = fm.match(re);
    if (!m) return "";
    let v = clean(m[1]);
    // block scalar: `key: |` atau `key: >` -> lanjutkan ke baris ber-indent
    if (/^[|>]/.test(v)) {
      const rest = fm.slice(fm.indexOf("\n", m.index) + 1);
      const out = [];
      for (const ln of rest.split("\n")) {
        if (/^[A-Za-z_][\w-]*\s*:/.test(ln) && /^\S/.test(ln)) break; // kunci baru
        if (ln.trim()) out.push(ln.trim());
      }
      v = out.join(" ").trim();
    }
    return v;
  };
  const listOf = (k) => {
    const v = line(k);
    if (!v) return [];
    return v
      .replace(/^\[|\]$/g, "")
      .split(",")
      .map((s) => clean(s).replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  };
  const name = clean(line("name") || (md.match(/^#\s+(.+)$/m) || [])[1]);
  let desc = line("description");
  const tags = listOf("tags").join(", ");
  const author = line("author");
  const related = listOf("related_skills").join(", ");
  const summary = md.replace(/^---[\s\S]*?---\s*/, "").slice(0, 240).trim();
  if (!desc) desc = summary.split(/[.\n]/)[0].slice(0, 58) || name;
  return { name, desc: desc.slice(0, 60), author, tags, related, summary, md };
}
