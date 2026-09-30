# Mahyaa Tour & Travel — Frontend Demo

Aplikasi frontend (React + TypeScript + Vite + Tailwind CSS v4 + React Router + TanStack Query + React Hook Form + Zod + Zustand) untuk penjualan paket umrah & haji. **Tanpa backend**: semua data berupa dummy dan disimpan di LocalStorage. Semua pembayaran hanyalah simulasi.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc + vite build
```

## Rute
`/` · `/umrah` · `/haji` · `/paket/:slug` · `/booking/:slug` · `/checkout/:bookingId` · `/payment/:bookingId` · `/payment/success/:bookingId` · `/dashboard` · `/admin` · `/masuk` · `/daftar` · `/tentang` · `/kontak`

Akun demo (tombol di halaman `/masuk`): **Jemaah Demo** dan **Admin Demo** (kata sandi apa pun ≥ 6 karakter). Kode promo: `MAHYAA10`, `KELUARGA` (min. 4 jemaah), `EARLYBIRD`. Admin → Pengaturan → *Reset data demo* mengembalikan seluruh data awal.

## Yang perlu diketahui
- **Warna merek: coklat** (arahan pemilik). HEX di `src/styles/theme.css` disampel dari logo resmi (wordmark #824d34, ikon #996b4a); ganti nilainya di sana bila berbeda (seluruh UI membaca variabel tersebut). Logo resmi ada di `src/assets/logo.png`.
- **Foto**: tidak ada foto asli; `components/common/Scene.tsx` menggambar ilustrasi SVG. Isi `gallery` paket dengan URL gambar untuk memakai foto asli.
- Nomor WhatsApp dummy: `WHATSAPP_NUMBER` di `src/utils/format.ts`.
- Chatbot berbasis aturan (`services/chatbotService.ts`), bukan AI sungguhan.
- Kontrak integrasi backend: [`docs/BACKEND_CONTRACT.md`](docs/BACKEND_CONTRACT.md).

## Struktur
`src/services` (satu-satunya akses data — ganti dengan HTTP), `src/data` (dummy), `src/types` (kontrak), `src/utils` (harga, format, skema Zod), `src/components/*`, `src/pages`, `src/routes`, `src/store` (sesi auth).
