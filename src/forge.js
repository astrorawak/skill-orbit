// ==== SKILL//ORBIT — FORGE: generator SKILL.md yang valid ====
// Mengikuti konvensi authoring standar (frontmatter ketat + bagian inti).
// Description divalidasi ≤60 karakter (standar "hardline" agar hasil tercurasi).

export const BEHAVIORS = [
  { id: "tajam", en: "One sharp behavior, not many features", id_label: "Satu perilaku tajam, bukan banyak fitur" },
  { id: "terukur", en: "End each step with a checkable result", id_label: "Setiap langkah berakhir dengan hasil yang bisa dicek" },
  { id: "cerita", en: "Real operator context, no filler", id_label: "Konteks pelaku asli, tanpa basa-basi" },
  { id: "hemat", en: "Cut anything that doesn't change behavior", id_label: "Potong hal yang tak mengubah perilaku" },
  { id: "bijak", en: "Name Hermes-level tools, not raw shell", id_label: "Sebut alat level-agent, bukan shell mentah" },
];

export const TOOL_OPTS = [
  { id: "web_search", en: "Web search & citations", id_label: "Web search & sitasi" },
  { id: "execute", en: "Run scripts / calculations", id_label: "Jalankan script / kalkulasi" },
  { id: "files", en: "Read / write / patch files", id_label: "Baca / tulis / patch file" },
  { id: "browser", en: "Browser automation", id_label: "Otomasi browser" },
  { id: "cron", en: "Scheduled / recurring jobs", id_label: "Jadwal / kerja berulang" },
  { id: "voice", en: "Text-to-speech output", id_label: "Output text-to-speech" },
  { id: "agent", en: "Delegate to sub-agents", id_label: "Delegasi ke sub-agent" },
];

function slug(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);
}

export function validateDesc(desc) {
  return { len: (desc || "").length, ok: (desc || "").length <= 60 && (desc || "").trim().length > 0 };
}

export function generateSkill(opt, lang = "en") {
  const name = slug(opt.name) || "my-skill-name";
  const desc = (opt.desc || "").trim();
  const L = lang === "id" ? ID : EN;

  const steps = (opt.behaviors || []).map((b) => {
    const bo = BEHAVIORS.find((x) => x.id === b);
    return bo ? (lang === "id" ? bo.id_label : bo.en) : b;
  });

  const tools = (opt.tools || []).map((t) => {
    const to = TOOL_OPTS.find((x) => x.id === t);
    return to ? (lang === "id" ? to.id_label : to.en) : t;
  });

  return `---
name: ${name}
description: ${desc}
version: 0.1.0
author: ${opt.author || "Your Name (github-handle), Hermes Agent"}
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [${opt.tags || "Short, Descriptive, Tags"}]
    related_skills: [${opt.related || ""}]
---

# ${name} Skill

${(opt.summary || L.summaryDefault).trim()}

## When to Use
- ${steps.length ? steps.slice(0, 3).join("\n- ") : L.whenDefault}
${opt.isNiche ? "\n- **Don't use for:** hal di luar lingkup tajam ini." : ""}

## Prerequisites
- ${opt.prereq || L.prereqDefault}

## How to Run
- Panggil melalui tool \`terminal\` / perintah utama ${opt.invoke || L.invokeDefault}

## Procedure
${(opt.procedure || L.procedureDefault).trim()}

## Pitfalls
- ${opt.pitfall || L.pitfallDefault}

## Verification
- ${opt.verify || L.verifyDefault}`;
}

const ID = {
  summaryDefault: "Deskripsi singkat: apa yang skill ini lakukan, apa yang tidak, dan bagaimana ia mandiri. Tanpa basa-basi.",
  whenDefault: "Senyawa ini dipakai saat konteks-nya muncul (tuliskan pemicu spesifik).",
  prereqDefault: "Sebutkan env/API-key/instalasi yang dibutuhkan, bila ada.",
  invokeDefault: "nama-perintah utama",
  procedureDefault: "1. Langkah pertama dengan kriteria selesai.\n2. Langkah berikutnya.\n3. Cek hasil akhir terhadap kriteria.",
  pitfallDefault: "Keterbatasan yang diketahui / hal yang tampak rusak tapi bukan bug.",
  verifyDefault: "Cara membuktikan skill benar-benar bekerja (hasil riil, bukan narasi).",
};

const EN = {
  summaryDefault: "Short intro: what it does, what it does not, dependency stance. No fluff.",
  whenDefault: "Use when its context arrives (list specific triggers).",
  prereqDefault: "Exact env vars, installs, API key sourcing if any.",
  invokeDefault: "main-command",
  procedureDefault: "1. First step with a completion criterion.\n2. Next step.\n3. Verify final result against criteria.",
  pitfallDefault: "Known limits / things that look broken but are not.",
  verifyDefault: "How to prove the skill actually worked (real output, not narration).",
};
