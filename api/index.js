// SKILL//ORBIT — akun online backend
import "dotenv/config";
import express from "express";
import cors from "cors";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import jwt from "jsonwebtoken";
import { getStore } from "./store.js";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const TOKEN_TTL = process.env.TOKEN_TTL || "30d";
const store = await getStore();
if (store.__ensureSchema) {
  try {
    await store.__ensureSchema();
    console.log("[db] skema siap");
  } catch (e) {
    console.error("[db] gagal bootstrap skema:", e.message);
    process.exit(1);
  }
}

const err = (res, status, msg) => res.status(status).json({ error: msg });

function hashPw(pw) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pw, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
function verifyPw(pw, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hash] = stored.split(":");
  const buf = Buffer.from(hash, "hex");
  const trial = scryptSync(pw, salt, 64);
  return buf.length === trial.length && timingSafeEqual(buf, trial);
}

function sign(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}
function publicUser(u) {
  return { id: u.id, email: u.email, username: u.username || "", created_at: u.created_at };
}

function auth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return err(res, 401, "Butuh token (Authorization: Bearer ...)");
  try {
    const p = jwt.verify(token, JWT_SECRET);
    req.userId = p.sub;
    next();
  } catch (e) {
    return err(res, 401, "Token tidak valid / kedaluwarsa");
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.post("/api/auth/register", async (req, res) => {
  try {
    let { email, password, username } = req.body || {};
    email = String(email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return err(res, 400, "Email tidak valid");
    if (!password || String(password).length < 6) return err(res, 400, "Password minimal 6 karakter");
    const existing = await store.findUserByEmail(email);
    if (existing) return err(res, 409, "Email sudah terdaftar");
    const user = await store.createUser({ email, username: String(username || "").trim(), pwHash: hashPw(password) });
    return res.status(201).json({ token: sign(user), user: publicUser(user) });
  } catch (e) {
    console.error("register err", e);
    return err(res, 500, "Gagal daftar");
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = String((req.body || {}).email || "").trim().toLowerCase();
    const password = String((req.body || {}).password || "");
    const user = await store.findUserByEmail(email);
    if (!user || !verifyPw(password, user.pw_hash)) return err(res, 401, "Email/password salah");
    return res.json({ token: sign(user), user: publicUser(user) });
  } catch (e) {
    console.error("login err", e);
    return err(res, 500, "Gagal masuk");
  }
});

app.get("/api/me", auth, async (req, res) => {
  try {
    const u = await store.findUserById(req.userId);
    if (!u) return err(res, 404, "User tidak ditemukan");
    return res.json({ user: publicUser(u) });
  } catch (e) {
    return err(res, 500, "Gagal ambil user");
  }
});

app.get("/api/skills", auth, async (req, res) => {
  try {
    const list = await store.listSkills(req.userId);
    res.json({ skills: list });
  } catch (e) {
    console.error("list err", e);
    res.status(500).json({ error: "Gagal ambil skill" });
  }
});

app.post("/api/skills", auth, async (req, res) => {
  try {
    const { name, lang, md, src } = req.body || {};
    if (!name || !String(name).trim()) return err(res, 400, "Skill perlu nama");
    if (!md || !String(md).trim()) return err(res, 400, "Skill perlu isi (md)");
    const item = await store.createSkill({
      userId: req.userId,
      name: String(name).trim().slice(0, 120),
      lang: lang === "en" ? "en" : "id",
      md: String(md).slice(0, 100000),
      src: String(src || "").slice(0, 300),
    });
    res.status(201).json({ skill: item });
  } catch (e) {
    console.error("create err", e);
    res.status(500).json({ error: "Gagal simpan skill" });
  }
});

app.put("/api/skills/:id", auth, async (req, res) => {
  try {
    const { name, lang, md, src } = req.body || {};
    const ok = await store.updateSkill(req.userId, req.params.id, {
      name: name != null ? String(name).trim().slice(0, 120) : undefined,
      lang: lang != null ? (lang === "en" ? "en" : "id") : undefined,
      md: md != null ? String(md).slice(0, 100000) : undefined,
      src: src != null ? String(src).slice(0, 300) : undefined,
    });
    if (!ok) return err(res, 404, "Skill tidak ditemukan");
    res.json({ ok: true });
  } catch (e) {
    console.error("update err", e);
    res.status(500).json({ error: "Gagal perbarui skill" });
  }
});

app.delete("/api/skills/:id", auth, async (req, res) => {
  try {
    const ok = await store.deleteSkill(req.userId, req.params.id);
    if (!ok) return err(res, 404, "Skill tidak ditemukan");
    res.json({ ok: true });
  } catch (e) {
    console.error("delete err", e);
    res.status(500).json({ error: "Gagal hapus skill" });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true, app: "skill-orbit-api" }));

const PORT = Number(process.env.PORT || 1999);
app.listen(PORT, () => console.log(`SKILL//ORBIT API on :${PORT} (store=${process.env.STORE || "mysql"})`));
