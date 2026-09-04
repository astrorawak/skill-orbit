// ==== SKILL//ORBIT — TEMPLATE LOKAL (kurasi kami) ====
// Perbedaan dari GALERI: item ini BUKAN repo GitHub publik tapi template
// siap-pakai/tunjangan yang kami tulis. Dilabeli jujur "bukan repo" di UI.
// Field merujuk ke builder SKILL.md Forge (name/desc/tags/tools/behaviors/niche/summary).
// ex = contoh kerja untuk tombol UJI (struktur + simulasi); keyed "id"/"en".
const TEMPLATES = [
  {
    slug: "rekap-keuangan-ternak",
    cat: "Agro · Ternak",
    nameId: "rekap-keuangan-ternak",
    nameEn: "livestock-bookkeeping",
    descId: "Rekap keuangan & untung-rugi usaha ternak otomatis dari catatan jual/beli.",
    descEn: "Auto bookkeeping & P&L for a livestock venture from sales/purchases.",
    tags: "Agro, Ternak, Keuangan, Otomasi",
    tools: ["files", "execute"],
    behaviors: ["tajam", "terukur"],
    niche: true,
    summaryId: "Setiap jual atau beli (bibit/pakan/hasil panen) dicatat lewat file; asisten merangkum saldo, untung-rugi, dan stok dalam rekap yang rapi.",
    summaryEn: "Record each sale or purchase (stock/feed/harvest) in a file; the assistant keeps a clear ledger of balance, P&L, and stock.",
    ex: {
      id: {
        u: "Catat: jual 5 ekor ayam @Rp120.000, beli 2 sak pakan @Rp185.000.",
        a: "Asisten membaca arahan SKILL.md → menyimpan transaksi ke file, menghitung saldo, untung-rugi, & stok.",
        o: "Saldo: Rp··· · Untung periode: Rp··· · Stok tersisa: 12 ekor · Riwayat: 7 transaksi.",
      },
      en: {
        u: "Log: sold 5 chickens @Rp120,000, bought 2 sacks feed @Rp185,000.",
        a: "Assistant reads the SKILL.md guidance → saves transactions to a file, computes balance, P&L, & stock.",
        o: "Balance: Rp··· · Period profit: Rp··· · Remaining stock: 12 · History: 7 entries.",
      },
    },
  },
  {
    slug: "catat-stok-toko-umkm",
    cat: "UMKM · Toko",
    nameId: "catat-stok-toko-umkm",
    nameEn: "umkm-shop-stock",
    descId: "Catat stok & penjualan kios/warung, dapat tanda barang hampir habis.",
    descEn: "Track kiosk/warung stock & sales, alert when items run low.",
    tags: "UMKM, Toko, Stok, Otomasi",
    tools: ["files"],
    behaviors: ["tajam", "terukur"],
    niche: true,
    summaryId: "Pengganti buku catatan: tiap barang masuk/keluar dicatat; asisten menyusun sisa stok, nilai, dan barang yang hampir habis.",
    summaryEn: "A better paper ledger: log each item in/out; the assistant tracks remaining stock, value, and soon-to-run-out items.",
    ex: {
      id: {
        u: "Barang masuk: gula 5 karung @Rp125.000 · Barang keluar: minyak goreng 3 @Rp18.000.",
        a: "Asisten mencatat barang masuk/keluar → menyusun stok, nilai sisa, & barang hampir habis.",
        o: "Stok gula: 5 karung · Sisa nilai: Rp··· · Awas habis: minyak goreng (sisa 2).",
      },
      en: {
        u: "In: 5 sacks sugar @Rp125,000 · Out: 3 cooking oil @Rp18,000.",
        a: "Assistant logs in/out → tracks stock, remaining value, & low-stock items.",
        o: "Sugar: 5 sacks · Remaining value: Rp··· · Running low: cooking oil (2 left).",
      },
    },
  },
  {
    slug: "pantau-harga-produk",
    cat: "UMKM · Riset Harga",
    nameId: "pantau-harga-produk",
    nameEn: "price-watch",
    descId: "Pantau & bandingkan harga produk (mis. TBS, kebutuhan) terhadap target.",
    descEn: "Track & compare product prices (e.g. TBS, essentials) against a target.",
    tags: "Riset, Harga, Pasar, Pantauan",
    tools: ["files", "execute"],
    behaviors: ["terukur"],
    niche: true,
    summaryId: "Simpan harga terbaru di file; asisten membandingkan dengan target, menandai peluang atau risiko, lalu membuat ringkasan tren sederhana.",
    summaryEn: "Store latest prices in a file; the assistant compares to a target, flags opportunity or risk, then builds a simple trend summary.",
    ex: {
      id: {
        u: "Harga TBS hari ini Rp2.450 (target 2.300). Harga gula Rp18.500 (target 15.000).",
        a: "Asisten membandingkan harga terbaru dengan target → menandai peluang/risiko → ringkas tren.",
        o: "TBS: 2.450 ✓ (di atas target) · Gula: 18.500 ⚠ (jauh di atas target) · +1 tren minggu ini.",
      },
      en: {
        u: "Today TBS price Rp2,450 (target 2,300). Sugar Rp18,500 (target 15,000).",
        a: "Assistant compares latest prices to targets, flags opportunity/risk, then summarizes trends.",
        o: "TBS: 2,450 ✓ (above target) · Sugar: 18,500 ⚠ (well above target) · +1 trend this week.",
      },
    },
  },
  {
    slug: "laporan-kreator-desa",
    cat: "Konten · Creator",
    nameId: "laporan-kreator-desa",
    nameEn: "village-creator-digest",
    descId: "Ringkas bahan & jadwal konten mingguan kreator jadi rencana terarah.",
    descEn: "Turn a creator's weekly notes into a clear, focused content plan.",
    tags: "Konten, Kreator, Perencanaan",
    tools: ["files"],
    behaviors: ["terukur"],
    niche: false,
    summaryId: "Tumpuk ide/bahan ke file; asisten menyusun jadwal, topik, dan target rilis mingguan yang rapi serta ringkasannya.",
    summaryEn: "Drop ideas/notes into a file; the assistant builds a tidy weekly schedule, topics, release targets, and a recap.",
    ex: {
      id: {
        u: "Ide minggu ini: olahraga desa, resep pakan murah, tips hemat listrik.",
        a: "Asisten menyusun ide/bahan kamu → jadwal, topik, & target rilis mingguan.",
        o: "Pekan: 3 konten — olahraga desa (Sen), resep pakan (Kam), tips listrik (Sab) · 2 isu riset tersisa.",
      },
      en: {
        u: "This week's ideas: village sports, cheap feed recipe, saving electricity tips.",
        a: "Assistant organizes your ideas/notes into a weekly schedule, topics, & release targets.",
        o: "Week: 3 pieces — village sports (Mon), feed recipe (Thu), energy tips (Sat) · 2 research items left.",
      },
    },
  },
];
export default TEMPLATES;
