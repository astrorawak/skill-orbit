# SKILL//ORBIT — Forge · Radar

Pendahulu gelombang "skills economy" (model: punggung yang jual **outcome**, bukan fitur).
Satu aplikasi dua mode: **FORGE** (peracik skill) + **RADAR** (radar skill yang sedang populer).

## Menjalankan
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # produksi → dist/
```

## FORGE — Peracik SKILL.md
Isi nama, deskripsi (divalidasi ≤60 karakter sesuai konvensi kurasi), author, tags,
pilih **perilaku** (tajam/terukur/cerita/hemat/bijak) + **alat yang boleh dipakai**,
munculkan **pratinjau SKILL.md** langsung → **Salin** atau **Unduh**.
Frontmatter mengikuti konvensi authoring standar (name/description/version/author/license/platforms/metadata.hermes).

## RADAR — Trending agent skills
Kurasi 8 repo skill populer dengan **bintang nyata dari GitHub API** (bukan angka karangan).
Tombol **REFRESH** menarik angka kembar terbaru secara live (vit membangun `https://api.github.com/repos?...`).
Label **Pola** (Tajam/Terukur/Cerita/Kurasi/Resmi) = label editorial dari analisa formula viral (kelas caveman), bukan metrik resmi.

## Struktur
```
src/
  App.jsx     # dua tampilan + header (ID/EN)
  data.js     # dataset radar (snapshot nyata) + pola editorial
  forge.js    # generator SKILL.md (uid / bilayer)
  index.css   # tema sci-fi void-black + emerald, hormat prefers-reduced-motion
build-preview.mjs  # membuat pratinjau statis preview.html
preview.html       # hasil render statis (FORGE + RADAR)
```

## Live & Deploy
- **Live demo:** https://astrorawak.github.io/skill-orbit/ (GitHub Pages, branch `gh-pages`).
- Deploy ulang: `bash scripts/deploy-ghpages.sh` (build → branch `gh-pages`; aman, repo sementara di /tmp).

## Roadmap yang masuk akal (kalau dilewati)
- ~~Repo GitHub publik + live-demo~~ → **DONE** di atas.
- Live-demo Vercel/Netlify (alternatif).
- "Compose dari galeri": ambil beberapa skill publik → padukan di sini.
- Ngejar harga (Registri Skill) dengan filter pola virality & peringkat kecepatan.
- Mode dwibahasa ID/EN → pasar Asia Tenggara + global.
