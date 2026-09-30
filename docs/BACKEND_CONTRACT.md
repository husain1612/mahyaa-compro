# Kontrak Integrasi Backend — Mahyaa Tour (Frontend Demo)

Frontend ini **tidak** memiliki backend. Seluruh akses data berada di `src/services/*` dan memakai
LocalStorage + `Promise` (latensi disimulasikan). Untuk integrasi, ganti isi fungsi di setiap service
dengan pemanggilan HTTP yang mengembalikan **bentuk data yang sama**; komponen UI tidak perlu diubah.
Tipe lengkap ada di `src/types/index.ts`. Endpoint di bawah hanyalah **usulan**, bukan sesuatu yang sudah ada.

Konvensi: tanggal ISO 8601, uang dalam Rupiah (integer, tanpa desimal), id berupa string.

## Peta service → usulan endpoint
| Service (src/services) | Fungsi | Usulan endpoint |
|---|---|---|
| packageService | `list(query)` | `GET /packages?type&q&airport&month&duration&category&priceMax&availability&sort&page&pageSize` → `Paged<TourPackage>` |
| | `getBySlug`, `featured`, `listAll` | `GET /packages/:slug`, `GET /packages?featured=true` |
| bookingService | `create` | `POST /bookings` |
| | `get`, `listMine` | `GET /bookings/:id`, `GET /me/bookings` |
| | `validatePromo` | `POST /bookings/:id/promo` |
| | `confirmCheckout` | `POST /bookings/:id/checkout` |
| | `setDocument`, `cancel` | `PUT /bookings/:id/passengers/:pid/documents/:key`, `POST /bookings/:id/cancel` |
| paymentService | `start` | `POST /bookings/:id/payments` → transaksi `pending` + instruksi dari payment gateway |
| | `simulate` | **Hanya demo.** Diganti webhook gateway; UI cukup polling `GET /bookings/:id` |
| authService | `login`, `register`, `logout` | `POST /auth/login`, `POST /auth/register`, `POST /auth/logout` |
| adminService | stats/monthly/bookings/paket/promo | `GET /admin/stats`, `/admin/bookings`, CRUD `/admin/packages`, `/admin/promotions` |
| chatbotService | `reply` | `POST /chat` (`{message}` → `ChatReply`) — saat ini rule-based, bukan AI |

## Data utama
- **Paket (`TourPackage`)**: `id, slug (unik), name, type (umrah|haji), category, durationDays, airline, hotelMakkah, hotelMadinah, prices{quad,triple,double}, dpPercent, departures[], facilities[], excluded[], itinerary[], terms[], gallery[], featured, popularity, active`.
- **Keberangkatan (`Departure`)**: `id, date, airportCode, airportName, seatsTotal, seatsLeft`. Kursi harus dikurangi server-side secara atomik saat pembayaran pertama berhasil.
- **Jemaah (`Passenger`)**: `fullName, birthDate, gender (L|P), phone, email, passportNumber, passportExpiry, documents{passport,ktp,kk,photo,vaccine,marriage:boolean}`. Pada produksi `documents` sebaiknya berupa berkas terunggah + status verifikasi.
- **Booking (`Booking`)**: `id, bookingCode (MHY-YYMMDD-XXXX), ownerId, status, packageId/slug/name (snapshot), departureId, departureDate, room, booker, passengers[], pricing, paymentOption (dp|full), transactions[]`.
- **Harga (`Pricing`)**: `unitPrice × passengerCount = subtotal; total = subtotal − discount; dpAmount = round(total × dpPercent%, ke ribuan); remaining = total − dpAmount`. Rumus ada di `src/utils/pricing.ts` — **server harus menghitung ulang** dan tidak mempercayai angka dari klien.
- **Invoice**: dirender di klien dari `Booking` (`components/payment/Invoice.tsx`); nomor `INV-{bookingCode}`. Backend disarankan menyediakan PDF resmi.
- **Status booking**: `draft → awaiting_payment → dp_paid → paid`; cabang `failed`, `expired`, `cancelled`.
- **Status transaksi**: `pending | success | failed | expired`; metode `qris | va | transfer`; opsi `dp | full | remaining`. Setiap transaksi demo diberi `isDemo: true` — hapus ketika gateway nyata dipakai.
- **Promo**: `code, type (percent|fixed), value, maxDiscount?, minPassengers?, validUntil, active`.

## Autentikasi
`AuthSession { user: User, token }`. Mock menyimpan sesi di LocalStorage (`mahyaa.v1.session`) dan menerima kata sandi apa pun ≥ 6 karakter. Produksi: token/cookie HttpOnly, dan pemeriksaan peran `jemaah|admin` di server (guard route klien di `src/routes/guards.tsx` hanya untuk UX).

## Format error
Service melempar `ApiError` (`src/utils/errors.ts`):
```json
{ "code": "SEATS_UNAVAILABLE", "message": "Pesan yang ramah pengguna", "fieldErrors": { "email": "Email sudah terdaftar" } }
```
Kode yang dipakai UI: `PACKAGE_NOT_FOUND, DEPARTURE_NOT_FOUND, SEATS_UNAVAILABLE, BOOKING_NOT_FOUND, PROMO_INVALID, PROMO_EXISTS, TERMS_REQUIRED, INVALID_CREDENTIALS, EMAIL_TAKEN, ALREADY_PAID, CANCELLED, NO_PENDING_PAYMENT, CANNOT_CANCEL`. Gunakan HTTP 4xx/5xx dengan body di atas lalu petakan ke `ApiError` di layer HTTP.

## Catatan pembayaran
Halaman `/payment/:bookingId` hanya demo: QRIS berlabel DEMO, nomor VA/rekening dummy, dan tombol simulasi hasil. Ganti dengan URL/instruksi dari payment gateway dan hapus tombol simulasi.
