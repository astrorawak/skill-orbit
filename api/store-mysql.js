// store berbasis MySQL — produksi di Hostinger. Bootstrap skema di start (tak butuh akses MySQL eksternal).
import mysql from "mysql2/promise";

export function createMysqlStore() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,
    charset: "utf8mb4",
  });

  const col = (row) =>
    row
      ? {
          id: String(row.id),
          email: row.email,
          username: row.username || "",
          pw_hash: row.pw_hash,
          created_at: row.created_at,
        }
      : null;

  const scol = (row) =>
    row
      ? {
          id: String(row.id),
          user_id: String(row.user_id),
          name: row.name,
          lang: row.lang,
          src: row.src || "",
          md: row.md || "",
          created_at: row.created_at,
          updated_at: row.updated_at,
        }
      : null;

  async function ensureSchema() {
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(190) NOT NULL UNIQUE,
      username VARCHAR(120) DEFAULT '',
      pw_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    await pool.query(`CREATE TABLE IF NOT EXISTS skills (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNSIGNED NOT NULL,
      name VARCHAR(120) NOT NULL,
      lang VARCHAR(4) DEFAULT 'id',
      src VARCHAR(300) DEFAULT '',
      md MEDIUMTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_skill_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_skill_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  }

  return {
    __ensureSchema: ensureSchema,
    async findUserByEmail(email) {
      const [rows] = await pool.query("SELECT id,email,username,pw_hash,created_at FROM users WHERE email=? LIMIT 1", [email]);
      return col(rows[0]);
    },
    async findUserById(id) {
      const [rows] = await pool.query("SELECT id,email,username,pw_hash,created_at FROM users WHERE id=? LIMIT 1", [id]);
      return col(rows[0]);
    },
    async createUser({ email, username, pwHash }) {
      const [r] = await pool.query(
        "INSERT INTO users (email, username, pw_hash) VALUES (?,?,?)",
        [email, username, pwHash]
      );
      return { id: String(r.insertId), email, username, pw_hash: pwHash, created_at: new Date() };
    },
    async listSkills(userId) {
      const [rows] = await pool.query(
        "SELECT id,user_id,name,lang,src,md,created_at,updated_at FROM skills WHERE user_id=? ORDER BY updated_at DESC",
        [userId]
      );
      return rows.map(scol);
    },
    async createSkill({ userId, name, lang, md, src }) {
      const [r] = await pool.query(
        "INSERT INTO skills (user_id,name,lang,src,md) VALUES (?,?,?,?,?)",
        [userId, name, lang, src, md]
      );
      const [rows] = await pool.query(
        "SELECT id,user_id,name,lang,src,md,created_at,updated_at FROM skills WHERE id=?", [r.insertId]
      );
      return scol(rows[0]);
    },
    async updateSkill(userId, id, fields) {
      const sets = [];
      const vals = [];
      for (const k of ["name", "lang", "md", "src"]) {
        if (fields[k] !== undefined) { sets.push(`${k}=?`); vals.push(fields[k]); }
      }
      if (!sets.length) return null;
      vals.push(userId, id);
      const [r] = await pool.query(`UPDATE skills SET ${sets.join(", ")} WHERE user_id=? AND id=?`, vals);
      return r.affectedRows ? true : null;
    },
    async deleteSkill(userId, id) {
      const [r] = await pool.query("DELETE FROM skills WHERE user_id=? AND id=?", [userId, id]);
      return r.affectedRows ? true : null;
    },
  };
}
