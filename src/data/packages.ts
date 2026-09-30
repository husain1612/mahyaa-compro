import type { Departure, Hotel, ItineraryDay, PackageCategory, RoomType, TourPackage, TripType } from '@/types'

/** SEMUA DATA DI FILE INI ADALAH DATA SIMULASI (DUMMY), bukan penawaran aktual. */

export const AIRPORTS = [
  { code: 'CGK', name: 'Soekarno-Hatta, Jakarta' },
  { code: 'SUB', name: 'Juanda, Surabaya' },
  { code: 'UPG', name: 'Sultan Hasanuddin, Makassar' },
  { code: 'KNO', name: 'Kualanamu, Medan' },
  { code: 'BPN', name: 'SAMS Sepinggan, Balikpapan' },
]
const airportName = (c: string) => AIRPORTS.find((a) => a.code === c)?.name ?? c

const dep = (id: string, date: string, code: string, total: number, left: number): Departure => ({
  id, date, airportCode: code, airportName: airportName(code), seatsTotal: total, seatsLeft: left,
})

const hotel = (name: string, star: 3 | 4 | 5, d: string): Hotel => ({ name, star, distanceToHaram: d })

const umrahItinerary = (days: number): ItineraryDay[] => {
  const base: ItineraryDay[] = [
    { day: 1, title: 'Berangkat dari Indonesia', description: 'Berkumpul di bandara keberangkatan, proses check-in dan imigrasi, penerbangan menuju Madinah/Jeddah.' },
    { day: 2, title: 'Tiba & Check-in Hotel Madinah', description: 'Tiba di Madinah, transfer ke hotel, istirahat, lalu shalat berjamaah di Masjid Nabawi.' },
    { day: 3, title: 'Ibadah di Masjid Nabawi', description: 'Ziarah Raudhah (sesuai jadwal), pembekalan manasik dan kajian bersama muthawif.' },
    { day: 4, title: 'Ziarah Kota Madinah', description: 'Masjid Quba, Jabal Uhud, Kebun Kurma, dan Masjid Qiblatain.' },
    { day: 5, title: 'Perjalanan ke Makkah & Umrah', description: 'Miqat di Bir Ali, perjalanan ke Makkah, check-in hotel, lalu pelaksanaan thawaf dan sa\'i.' },
  ]
  const tail: ItineraryDay[] = [
    { day: days - 2, title: 'Ziarah Kota Makkah', description: 'Jabal Rahmah, Arafah, Muzdalifah, Mina, Jabal Tsur, dan Jabal Nur.' },
    { day: days - 1, title: 'Thawaf Wada\'', description: 'Thawaf perpisahan, persiapan kepulangan, dan transfer ke bandara Jeddah.' },
    { day: days, title: 'Tiba di Indonesia', description: 'Tiba di tanah air dengan selamat. Alhamdulillah.' },
  ]
  const middle: ItineraryDay[] = []
  for (let d = 6; d <= days - 3; d++) {
    middle.push({ day: d, title: 'Ibadah Mandiri di Masjidil Haram', description: 'Waktu ibadah dan istirahat, umrah sunnah (opsional), dan bimbingan muthawif.' })
  }
  return [...base, ...middle, ...tail].slice(0, days)
}

const hajiItinerary: ItineraryDay[] = [
  { day: 1, title: 'Berangkat menuju Tanah Suci', description: 'Berkumpul di asrama/bandara, keberangkatan menuju Madinah atau Jeddah.' },
  { day: 2, title: 'Tiba & Check-in', description: 'Tiba, pembagian kamar hotel, dan istirahat.' },
  { day: 5, title: 'Ibadah Arbain di Madinah', description: 'Shalat berjamaah 40 waktu di Masjid Nabawi dan ziarah kota Madinah.' },
  { day: 12, title: 'Persiapan Ihram & Umrah', description: 'Perjalanan ke Makkah, miqat, dan umrah wajib.' },
  { day: 20, title: 'Wukuf di Arafah', description: 'Puncak ibadah haji, wukuf hingga terbenam matahari, lalu mabit di Muzdalifah.' },
  { day: 22, title: 'Mabit & Lempar Jumrah di Mina', description: 'Melontar jumrah, tahallul, dan thawaf ifadhah.' },
  { day: 30, title: 'Thawaf Wada\' & Persiapan Pulang', description: 'Thawaf perpisahan dan persiapan kepulangan.' },
  { day: 40, title: 'Tiba di Indonesia', description: 'Kembali ke tanah air. Semoga menjadi haji mabrur.' },
]

const umrahFacilities = [
  'Tiket pesawat PP kelas ekonomi',
  'Visa umrah & asuransi perjalanan',
  'Hotel sesuai paket (Makkah & Madinah)',
  'Makan 3x sehari (menu Indonesia)',
  'Bus AC ber-AC selama di Arab Saudi',
  'Muthawif berpengalaman berbahasa Indonesia',
  'Air zamzam 5 liter',
  'Perlengkapan umrah (koper, kain ihram/mukena, tas)',
  'Manasik umrah sebelum keberangkatan',
]
const umrahExcluded = ['Paspor (biaya pembuatan/perpanjangan)', 'Vaksin meningitis', 'Pengeluaran pribadi', 'Kelebihan bagasi', 'Tips muthawif & supir (sukarela)']
const umrahTerms = [
  'Paspor berlaku minimal 8 bulan dari tanggal keberangkatan dan nama minimal 2 suku kata.',
  'DP minimum sesuai ketentuan paket dibayarkan untuk mengunci kursi.',
  'Pelunasan paling lambat 30 hari sebelum keberangkatan.',
  'Pembatalan setelah visa terbit dikenakan biaya sesuai kebijakan (simulasi).',
  'Jemaah wanita di bawah 45 tahun wajib didampingi mahram.',
  'Jadwal dan harga dapat berubah mengikuti kebijakan maskapai dan pemerintah Arab Saudi.',
]

interface Spec {
  slug: string
  name: string
  type: TripType
  category: PackageCategory
  tagline: string
  days: number
  airline: string
  makkah: Hotel
  madinah: Hotel
  quad: number
  gap: number // selisih harga triple/double
  dp: number
  deps: Departure[]
  gallery: string[]
  featured?: boolean
  popularity: number
  extra?: string[]
  active?: boolean
}

const build = (s: Spec, i: number): TourPackage => {
  const prices: Record<RoomType, number> = { quad: s.quad, triple: s.quad + s.gap, double: s.quad + s.gap * 2 }
  return {
    id: `pkg-${String(i + 1).padStart(3, '0')}`,
    slug: s.slug,
    name: s.name,
    type: s.type,
    category: s.category,
    tagline: s.tagline,
    description: `${s.name} adalah paket ${s.type === 'haji' ? 'haji' : 'umrah'} ${s.days} hari bersama ${s.airline}, menginap di ${s.makkah.name} (Makkah) dan ${s.madinah.name} (Madinah) dengan pendampingan muthawif berpengalaman. Seluruh informasi pada halaman ini adalah data simulasi.`,
    durationDays: s.days,
    airline: s.airline,
    hotelMakkah: s.makkah,
    hotelMadinah: s.madinah,
    prices,
    dpPercent: s.dp,
    departures: s.deps,
    facilities: [...umrahFacilities, ...(s.extra ?? [])],
    excluded: umrahExcluded,
    itinerary: s.type === 'haji' ? hajiItinerary : umrahItinerary(s.days),
    terms: s.type === 'haji'
      ? [...umrahTerms.slice(0, 2), 'Pendaftaran haji mengikuti kuota dan regulasi resmi pemerintah (simulasi).', 'Pelunasan sesuai jadwal yang ditetapkan penyelenggara.', ...umrahTerms.slice(4)]
      : umrahTerms,
    gallery: s.gallery,
    featured: !!s.featured,
    popularity: s.popularity,
    active: s.active ?? true,
  }
}

const specs: Spec[] = [
  {
    slug: 'umrah-reguler-9-hari-cgk', name: 'Umrah Reguler 9 Hari', type: 'umrah', category: 'reguler',
    tagline: 'Paket hemat, ibadah khusyuk dengan fasilitas lengkap.', days: 9, airline: 'Saudia',
    makkah: hotel('Makkah Al Safwah Residence', 3, '650 m'), madinah: hotel('Taiba Garden Hotel', 3, '400 m'),
    quad: 27900000, gap: 1500000, dp: 30, popularity: 92, featured: true,
    gallery: ['kaaba', 'nabawi', 'hotel', 'flight'],
    deps: [dep('d1a', '2026-11-12', 'CGK', 45, 12), dep('d1b', '2026-12-10', 'CGK', 45, 30), dep('d1c', '2027-01-14', 'CGK', 45, 41)],
  },
  {
    slug: 'umrah-reguler-12-hari-sub', name: 'Umrah Reguler 12 Hari Surabaya', type: 'umrah', category: 'reguler',
    tagline: 'Langsung dari Surabaya, tanpa transit domestik.', days: 12, airline: 'Garuda Indonesia',
    makkah: hotel('Dar Al Hidayah Hotel', 3, '500 m'), madinah: hotel('Anwar Al Noor Madinah', 3, '300 m'),
    quad: 31500000, gap: 1700000, dp: 30, popularity: 78,
    gallery: ['nabawi', 'kaaba', 'madinah-night', 'hotel'],
    deps: [dep('d2a', '2026-11-19', 'SUB', 40, 8), dep('d2b', '2026-12-17', 'SUB', 40, 25), dep('d2c', '2027-02-04', 'SUB', 40, 40)],
  },
  {
    slug: 'umrah-hemat-9-hari-upg', name: 'Umrah Hemat 9 Hari Makassar', type: 'umrah', category: 'reguler',
    tagline: 'Pilihan ekonomis dari Sulawesi Selatan.', days: 9, airline: 'Saudia',
    makkah: hotel('Al Bayt Guest Makkah', 3, '800 m'), madinah: hotel('Madinah Pearl Hotel', 3, '450 m'),
    quad: 26900000, gap: 1400000, dp: 25, popularity: 60,
    gallery: ['kaaba', 'flight', 'hotel', 'dates'],
    deps: [dep('d3a', '2026-11-26', 'UPG', 35, 0), dep('d3b', '2026-12-24', 'UPG', 35, 18), dep('d3c', '2027-01-21', 'UPG', 35, 33)],
  },
  {
    slug: 'umrah-reguler-10-hari-kno', name: 'Umrah Reguler 10 Hari Medan', type: 'umrah', category: 'reguler',
    tagline: 'Keberangkatan Kualanamu dengan pendamping lokal.', days: 10, airline: 'Saudia',
    makkah: hotel('Makkah Bright Towers', 3, '600 m'), madinah: hotel('Taiba Garden Hotel', 3, '400 m'),
    quad: 28900000, gap: 1500000, dp: 30, popularity: 55,
    gallery: ['hotel', 'kaaba', 'nabawi', 'dates'],
    deps: [dep('d4a', '2026-12-03', 'KNO', 40, 22), dep('d4b', '2027-01-07', 'KNO', 40, 4), dep('d4c', '2027-02-11', 'KNO', 40, 38)],
  },
  {
    slug: 'umrah-premium-9-hari', name: 'Umrah Premium 9 Hari', type: 'umrah', category: 'premium',
    tagline: 'Hotel bintang 4 dekat Masjidil Haram, penerbangan langsung.', days: 9, airline: 'Garuda Indonesia',
    makkah: hotel('Zam Zam Grand Makkah', 4, '250 m'), madinah: hotel('Anwar Madinah Residence', 4, '150 m'),
    quad: 36900000, gap: 2500000, dp: 30, popularity: 88, featured: true,
    extra: ['Handling bandara VIP', 'City tour eksklusif'],
    gallery: ['kaaba', 'hotel', 'nabawi', 'madinah-night'],
    deps: [dep('d5a', '2026-11-14', 'CGK', 30, 7), dep('d5b', '2026-12-12', 'CGK', 30, 15), dep('d5c', '2027-01-16', 'CGK', 30, 27)],
  },
  {
    slug: 'umrah-premium-12-hari', name: 'Umrah Premium 12 Hari', type: 'umrah', category: 'premium',
    tagline: 'Waktu lebih panjang untuk beribadah tanpa terburu-buru.', days: 12, airline: 'Garuda Indonesia',
    makkah: hotel('Zam Zam Grand Makkah', 4, '250 m'), madinah: hotel('Dallah Taibah Suites', 4, '100 m'),
    quad: 41500000, gap: 2800000, dp: 30, popularity: 74,
    extra: ['Handling bandara VIP'],
    gallery: ['nabawi', 'madinah-night', 'kaaba', 'hotel'],
    deps: [dep('d6a', '2026-12-05', 'CGK', 30, 16), dep('d6b', '2027-01-09', 'CGK', 30, 21), dep('d6c', '2027-03-06', 'CGK', 30, 30)],
  },
  {
    slug: 'umrah-plus-turki-12-hari', name: 'Umrah Plus Turki 12 Hari', type: 'umrah', category: 'plus',
    tagline: 'Umrah dipadukan wisata Istanbul dan Bursa.', days: 12, airline: 'Qatar Airways',
    makkah: hotel('Makkah Royal View', 4, '300 m'), madinah: hotel('Madinah Golden Gate', 4, '200 m'),
    quad: 45900000, gap: 3000000, dp: 35, popularity: 66,
    extra: ['Wisata Istanbul 2 hari', 'Hotel Istanbul bintang 4'],
    gallery: ['flight', 'kaaba', 'nabawi', 'dates'],
    deps: [dep('d7a', '2026-11-28', 'CGK', 30, 10), dep('d7b', '2027-01-23', 'CGK', 30, 24), dep('d7c', '2027-03-13', 'CGK', 30, 30)],
  },
  {
    slug: 'umrah-plus-dubai-10-hari', name: 'Umrah Plus Dubai 10 Hari', type: 'umrah', category: 'plus',
    tagline: 'Umrah nyaman bersama wisata Dubai.', days: 10, airline: 'Emirates',
    makkah: hotel('Makkah Royal View', 4, '300 m'), madinah: hotel('Madinah Golden Gate', 4, '200 m'),
    quad: 43500000, gap: 2900000, dp: 35, popularity: 58,
    extra: ['City tour Dubai 1 hari'],
    gallery: ['flight', 'hotel', 'kaaba', 'madinah-night'],
    deps: [dep('d8a', '2026-12-08', 'CGK', 28, 5), dep('d8b', '2027-01-19', 'SUB', 28, 20), dep('d8c', '2027-02-23', 'CGK', 28, 28)],
  },
  {
    slug: 'umrah-ramadhan-15-hari', name: 'Umrah Ramadhan 15 Hari', type: 'umrah', category: 'premium',
    tagline: 'Rasakan keutamaan Ramadhan di dua kota suci.', days: 15, airline: 'Saudia',
    makkah: hotel('Zam Zam Grand Makkah', 5, '150 m'), madinah: hotel('Dallah Taibah Suites', 5, '100 m'),
    quad: 58900000, gap: 4500000, dp: 40, popularity: 95, featured: true,
    extra: ['Buka puasa & sahur di hotel', 'Program itikaf pendampingan'],
    gallery: ['kaaba', 'nabawi', 'madinah-night', 'dates'],
    deps: [dep('d9a', '2027-02-10', 'CGK', 40, 3), dep('d9b', '2027-02-14', 'SUB', 40, 14), dep('d9c', '2027-02-18', 'CGK', 40, 19)],
  },
  {
    slug: 'umrah-akhir-tahun-9-hari', name: 'Umrah Akhir Tahun 9 Hari', type: 'umrah', category: 'reguler',
    tagline: 'Habiskan liburan akhir tahun dengan ibadah.', days: 9, airline: 'Saudia',
    makkah: hotel('Makkah Al Safwah Residence', 3, '650 m'), madinah: hotel('Taiba Garden Hotel', 3, '400 m'),
    quad: 29900000, gap: 1600000, dp: 30, popularity: 82,
    gallery: ['kaaba', 'hotel', 'dates', 'nabawi'],
    deps: [dep('d10a', '2026-12-22', 'CGK', 45, 6), dep('d10b', '2026-12-26', 'SUB', 45, 20), dep('d10c', '2026-12-29', 'BPN', 45, 32)],
  },
  {
    slug: 'haji-plus-1447-cgk', name: 'Haji Plus 40 Hari', type: 'haji', category: 'haji-plus',
    tagline: 'Haji dengan masa tunggu singkat dan layanan premium (simulasi).', days: 40, airline: 'Saudia',
    makkah: hotel('Makkah Clock View', 5, '200 m'), madinah: hotel('Madinah Oberoi Style', 5, '100 m'),
    quad: 215000000, gap: 12000000, dp: 40, popularity: 70, featured: true,
    extra: ['Pembimbing ibadah haji (KBIH)', 'Tenda Mina VIP'],
    gallery: ['kaaba', 'nabawi', 'dates', 'hotel'],
    deps: [dep('d11a', '2027-05-06', 'CGK', 25, 9), dep('d11b', '2027-05-10', 'SUB', 25, 15), dep('d11c', '2027-05-14', 'UPG', 25, 25)],
  },
  {
    slug: 'haji-khusus-furoda-simulasi', name: 'Haji Khusus 26 Hari', type: 'haji', category: 'haji-khusus',
    tagline: 'Program haji khusus dengan durasi ringkas (simulasi).', days: 26, airline: 'Garuda Indonesia',
    makkah: hotel('Makkah Clock View', 5, '150 m'), madinah: hotel('Madinah Oberoi Style', 5, '100 m'),
    quad: 265000000, gap: 15000000, dp: 50, popularity: 52,
    extra: ['Pembimbing ibadah haji (KBIH)', 'Tenda Mina VIP', 'Handling VIP'],
    gallery: ['kaaba', 'madinah-night', 'nabawi', 'hotel'],
    deps: [dep('d12a', '2027-05-14', 'CGK', 20, 2), dep('d12b', '2027-05-16', 'CGK', 20, 11), dep('d12c', '2027-05-18', 'SUB', 20, 20)],
  },
  {
    slug: 'umrah-lansia-10-hari', name: 'Umrah Nyaman Lansia 10 Hari', type: 'umrah', category: 'premium',
    tagline: 'Pendampingan khusus dan hotel sangat dekat Masjid.', days: 10, airline: 'Garuda Indonesia',
    makkah: hotel('Zam Zam Grand Makkah', 4, '100 m'), madinah: hotel('Dallah Taibah Suites', 4, '80 m'),
    quad: 38500000, gap: 2600000, dp: 30, popularity: 63,
    extra: ['Kursi roda & pendamping medis', 'Tim kesehatan'],
    gallery: ['hotel', 'nabawi', 'kaaba', 'dates'],
    deps: [dep('d13a', '2026-12-15', 'CGK', 24, 13), dep('d13b', '2027-01-26', 'CGK', 24, 17), dep('d13c', '2027-03-02', 'SUB', 24, 24)],
  },
]

export const seedPackages: TourPackage[] = specs.map(build)
