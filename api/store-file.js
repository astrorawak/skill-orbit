// store berbasis file JSON — untuk uji end-to-end lokal tanpa MySQL jarak jauh. Bukan untuk produksi.
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

export function createFileStore(fp) {
  const file = path.resolve(fp);
  let db = { users: [], skills: [] };
  if (fs.existsSync(file)) {
    try { db = JSON.parse(fs.readFileSync(file, "utf8")); } catch { /* reset */ }
  }
  const save = () => fs.writeFileSync(file, JSON.stringify(db, null, 2));

  return {
    async reach() {
      return true;
    },
    async findUserByEmail(email) {
      return db.users.find((u) => u.email === email) || null;
    },
    async findUserById(id) {
      return db.users.find((u) => u.id === id) || null;
    },
    async createUser({ email, username, pwHash }) {
      const user = { id: randomUUID(), email, username, pw_hash: pwHash, created_at: new Date().toISOString() };
      db.users.push(user);
      save();
      return user;
    },
    async listSkills(userId) {
      return db.skills
        .filter((s) => s.user_id === userId)
        .sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""));
    },
    async createSkill({ userId, name, lang, md, src }) {
      const now = new Date().toISOString();
      const item = { id: randomUUID(), user_id: userId, name, lang, md, src, created_at: now, updated_at: now };
      db.skills.push(item);
      save();
      return item;
    },
    async updateSkill(userId, id, fields) {
      const s = db.skills.find((x) => x.id === id && x.user_id === userId);
      if (!s) return null;
      Object.assign(s, { ...fields, updated_at: new Date().toISOString() });
      save();
      return s;
    },
    async deleteSkill(userId, id) {
      const i = db.skills.findIndex((x) => x.id === id && x.user_id === userId);
      if (i < 0) return null;
      db.skills.splice(i, 1);
      save();
      return true;
    },
  };
}
