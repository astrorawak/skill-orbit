---
name: rekap-keuangan-ternak
description: Rekap untung-rugi & saldo ternak dari catatan jual/beli.
version: 0.1.0
author: Rizky Karman (astrorawak), Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [Agro, Ternak, Keuangan, Otomasi]
    related_skills: []
---

# rekap-keuangan-ternak Skill

Setiap jual atau beli (bibit/pakan/hasil panen) dicatat lewat file; asisten merangkum saldo, untung-rugi, dan stok dalam rekap yang rapi.

## When to Use
- Satu perilaku tajam, bukan banyak fitur
- Setiap langkah berakhir dengan hasil yang bisa dicek

- **Don't use for:** hal di luar lingkup tajam ini.

## Prerequisites
- Folder data (mis. ~/ternak) untuk menyimpan file catatan & rekap. Module standar saja, tanpa installed key.

## How to Run
- Panggil melalui tool `terminal` / perintah utama asisten membaca file catatan lalu menyusun rekap

## Procedure
1. Cek file catatan (jual/beli) yang ada; buat bila belum ada, tandai kriteria selesai: data transaksi lengkap.
2. Tambahkan transaksi baru yang disebut user ke file.
3. Hitung: total pemasukan, pengeluaran, saldo berjalan, untung-rugi periode, dan sisa stok (masuk-keluar).
4. Tampilkan rekap rapi: tabel transaksi + ringkasan saldo & stok.

## Pitfalls
- Saldo terkait konsistensi pencatatan: abaikan jika ada transaksi belum dicatat; tanya dulu bila angka jual/beli tak lengkap.

## Verification
- Output rekap berisi saldo, untung-rugi, dan stok yang cocok dengan file catatan terbaru.