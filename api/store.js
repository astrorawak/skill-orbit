import { fileURLToPath } from "node:url";
const here = fileURLToPath(import.meta.url);

export async function getStore() {
  const mode = process.env.STORE || "mysql"; // 'file' untuk uji lokal, 'mysql' untuk produksi
  if (mode === "file") {
    const m = await import(`${here.replace("store.js", "store-file.js")}`);
    return m.createFileStore(process.env.FILE_DB || "./dev-db.json");
  }
  const m = await import(`${here.replace("store.js", "store-mysql.js")}`);
  return m.createMysqlStore();
}
