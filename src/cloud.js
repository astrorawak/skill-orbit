// ==== SKILL//ORBIT — cloud: akun online + sync stash ke backend (Hostinger PHP API) ====
const API = "https://whitesmoke-wallaby-659657.hostingersite.com/api";
const TOK_KEY = "skillorbit-cloud-token";
const EMAIL_KEY = "skillorbit-cloud-email";

export function getToken() {
  try {
    return localStorage.getItem(TOK_KEY) || "";
  } catch {
    return "";
  }
}
export function getEmail() {
  try {
    return localStorage.getItem(EMAIL_KEY) || "";
  } catch {
    return "";
  }
}
export function setSession(token, email) {
  try {
    localStorage.setItem(TOK_KEY, token);
    localStorage.setItem(EMAIL_KEY, email || "");
  } catch {}
}
export function clearSession() {
  try {
    localStorage.removeItem(TOK_KEY);
    localStorage.removeItem(EMAIL_KEY);
  } catch {}
}

async function req(path, opts = {}) {
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = "Bearer " + token;
  const res = await fetch(API + path, { ...opts, headers });
  let data = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) throw new Error((data && data.error) || ("HTTP " + res.status));
  return data;
}

export async function register(email, password, username) {
  const d = await req("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, username: username || "" }),
  });
  setSession(d.token, d.user.email);
  return d.user;
}
export async function login(email, password) {
  const d = await req("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setSession(d.token, d.user.email);
  return d.user;
}
export async function me() {
  return req("/me");
}

// lupa sandi: minta kode reset. Kembali {reset_token, expires_in} (belum ada SMTP → kode inline).
export async function forgotPassword(email) {
  return req("/auth/forgot", { method: "POST", body: JSON.stringify({ email }) });
}
// set sandi baru pakai kode; sukses → langsung login (set session).
export async function resetPassword(email, code, newPassword) {
  const d = await req("/auth/reset", {
    method: "POST",
    body: JSON.stringify({ email, code, new_password: newPassword }),
  });
  if (d.token) setSession(d.token, email);
  return d;
}
// hapus akun (skill ikut terhapus) + local session.
export async function deleteAccount() {
  const d = await req("/me", { method: "DELETE" });
  clearSession();
  return d;
}

export async function listSkill(token) {
  const d = await req("/skills", token ? { headers: { Authorization: "Bearer " + token } } : {});
  return Array.isArray(d) ? d : [];
}
export async function createSkill(token, { name, desc, md, lang, src }) {
  return req("/skills", {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
    body: JSON.stringify({ name, lang: lang || "id", src: src || "", md }),
  });
}
export async function updateSkill(token, id, { name, md, lang, src }) {
  return req("/skills/" + id, {
    method: "PUT",
    headers: { Authorization: "Bearer " + token },
    body: JSON.stringify({ name, lang: lang || "id", src: src || "", md }),
  });
}
export async function deleteSkill(token, id) {
  return req("/skills/" + id, { method: "DELETE", headers: { Authorization: "Bearer " + token } });
}

// ---- sync helpers ----
const descOf = (md) => {
  const m = (md || "").split(/[.\n]/)[0].replace(/^#+\s*/, "").trim();
  return (m || "skill").slice(0, 60);
};

// simpan setiap item stash yang belum ada di cloud (cocokkan name+md)
export async function syncUp(items, cb) {
  const token = getToken();
  if (!token) throw new Error("no_session");
  const remote = await listSkill(token);
  const key = new Set(remote.map((r) => r.name + "\u0000" + (r.md || "")));
  let added = 0,
    skipped = 0;
  for (const it of items || []) {
    if (!it || !it.md) continue;
    if (key.has(it.name + "\u0000" + it.md)) {
      skipped++;
      continue;
    }
    await createSkill(token, { name: it.name, md: it.md, lang: it.lang, src: it.src, desc: descOf(it.md) });
    added++;
    if (typeof cb === "function") cb(it);
  }
  return { added, skipped, total: (items || []).length };
}

// ambil skill dari cloud dan gabung ke stash (via stashImport, dedup id/name)
export async function syncDown(importFn, token) {
  const t = token || getToken();
  if (!t) throw new Error("no_session");
  const remote = await listSkill(t);
  const bag = remote.map((r) => ({
    id: "c-" + r.id,
    name: r.name,
    desc: descOf(r.md),
    md: r.md,
    lang: r.lang || "id",
    src: r.src || "",
    created: r.updated_at || new Date().toISOString(),
  }));
  const res = importFn(JSON.stringify({ app: "skillorbit", version: 1, items: bag }));
  return { down: remote.length, ...res };
}
