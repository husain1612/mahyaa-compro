import type { ChatPackageRef, ChatReply, PackageCategory, PackageQuery, TourPackage } from '@/types'
import { formatDate, formatRupiah, waLink } from '@/utils/format'
import { ROOM_SHORT } from '@/utils/pricing'
import { db, delay } from './storage'
import { AIRPORTS } from '@/data/packages'
import { filterPackages, minPrice, nextDeparture, totalSeatsLeft } from './packageService'
import { faqs } from '@/data/faqs'

/**
 * Chatbot berbasis ATURAN (rule-based) dengan knowledge base dummy.
 * Ini BUKAN AI sungguhan. Ganti isi `reply()` dengan panggilan API saat backend tersedia.
 */

const MONTHS: Record<string, string> = { januari: '01', februari: '02', maret: '03', april: '04', mei: '05', juni: '06', juli: '07', agustus: '08', september: '09', oktober: '10', november: '11', desember: '12' }
const AIRPORT_WORDS: Record<string, string> = { jakarta: 'CGK', cgk: 'CGK', surabaya: 'SUB', sub: 'SUB', makassar: 'UPG', upg: 'UPG', medan: 'KNO', kno: 'KNO', balikpapan: 'BPN', bpn: 'BPN' }
const CATEGORY_WORDS: [string, PackageCategory][] = [['premium', 'premium'], ['reguler', 'reguler'], ['hemat', 'reguler'], ['plus', 'plus']]

export const CHAT_SUGGESTIONS = ['Rekomendasi paket umrah', 'Paket di bawah 35 juta', 'Syarat pendaftaran', 'Cara pembayaran & DP', 'Hubungi admin']

const ref = (p: TourPackage): ChatPackageRef => ({ slug: p.slug, name: p.name, durationDays: p.durationDays, priceFrom: minPrice(p) })

const parseBudget = (t: string): number | undefined => {
  const m = t.match(/(\d+(?:[.,]\d+)?)\s*(juta|jt)/)
  return m ? Math.round(parseFloat(m[1].replace(',', '.')) * 1_000_000) : undefined
}

const findPackage = (t: string, all: TourPackage[]): TourPackage | undefined => {
  const words = t.split(/\s+/).filter((w) => w.length > 2)
  let best: { p: TourPackage; score: number } | undefined
  for (const p of all) {
    const hay = `${p.name} ${p.category} ${p.durationDays} hari`.toLowerCase()
    const score = words.filter((w) => hay.includes(w)).length + (t.includes(p.slug) ? 5 : 0) + (t.includes(p.name.toLowerCase()) ? 6 : 0)
    if (score >= 2 && (!best || score > best.score)) best = { p, score }
  }
  return best?.p
}

const wa = { label: 'Chat admin via WhatsApp (dummy)', href: waLink() }

export const chatbotService = {
  async reply(input: string): Promise<ChatReply> {
    const t = input.toLowerCase().trim()
    const all = db.packages().filter((p) => p.active)
    let out: ChatReply

    const has = (...w: string[]) => w.some((x) => t.includes(x))
    const specific = findPackage(t, all)

    if (!t) out = { text: 'Silakan ketik pertanyaan Anda, misalnya “paket umrah bulan Desember dari Jakarta”.' }
    else if (has('halo', 'hai', 'assalam', 'selamat pagi', 'selamat siang', 'selamat malam') && t.length < 30) {
      out = { text: 'Waalaikumsalam! Saya asisten virtual Mahyaa Tour (simulasi berbasis aturan, bukan AI sungguhan). Saya bisa membantu rekomendasi paket, harga, jadwal, fasilitas, dan persyaratan.', actions: [{ label: 'Lihat paket umrah', to: '/umrah' }, { label: 'Lihat paket haji', to: '/haji' }] }
    } else if (has('admin', 'cs', 'manusia', 'whatsapp', 'wa ', 'hubungi', 'kontak')) {
      out = { text: 'Baik, Anda dapat menghubungi admin kami melalui WhatsApp (nomor dummy pada versi demo).', actions: [wa, { label: 'Halaman Kontak', to: '/kontak' }] }
    } else if (has('syarat', 'dokumen', 'paspor', 'persyaratan', 'mahram', 'vaksin')) {
      out = { text: 'Persyaratan umum: paspor berlaku minimal 8 bulan, KTP, Kartu Keluarga, pas foto latar putih, buku nikah (pasangan), dan vaksin meningitis. Jemaah wanita di bawah 45 tahun umumnya wajib bersama mahram.', actions: [{ label: 'Pantau dokumen di Dashboard', to: '/dashboard' }] }
    } else if (has('promo', 'diskon', 'kode')) {
      const promos = db.promotions().filter((p) => p.active)
      out = { text: `Promo aktif (simulasi): ${promos.map((p) => `${p.code} — ${p.title}`).join('; ')}. Masukkan kode saat checkout.` }
    } else if (specific && has('harga', 'biaya', 'berapa', 'tarif', 'kamar')) {
      out = { text: `${specific.name}: ${(['quad', 'triple', 'double'] as const).map((r) => `${ROOM_SHORT[r]} ${formatRupiah(specific.prices[r])}`).join(', ')} per jemaah. DP ${specific.dpPercent}%.`, actions: [{ label: 'Lihat detail', to: `/paket/${specific.slug}` }, { label: 'Pesan sekarang', to: `/booking/${specific.slug}` }] }
    } else if (specific && has('fasilitas', 'termasuk', 'include', 'hotel')) {
      out = { text: `${specific.name} — Hotel Makkah: ${specific.hotelMakkah.name} (${specific.hotelMakkah.distanceToHaram}); Madinah: ${specific.hotelMadinah.name} (${specific.hotelMadinah.distanceToHaram}). Fasilitas utama: ${specific.facilities.slice(0, 5).join(', ')}.`, actions: [{ label: 'Lihat detail', to: `/paket/${specific.slug}` }] }
    } else if (specific && has('jadwal', 'berangkat', 'tanggal', 'kapan', 'keberangkatan')) {
      out = { text: `Jadwal ${specific.name}: ${specific.departures.map((d) => `${formatDate(d.date)} (${d.airportCode}, sisa ${d.seatsLeft} kursi)`).join('; ')}.`, actions: [{ label: 'Pesan sekarang', to: `/booking/${specific.slug}` }] }
    } else if (has('dp', 'bayar', 'pembayaran', 'cicil', 'lunas', 'qris', 'transfer')) {
      out = { text: 'Anda cukup membayar DP (25%–50% tergantung paket) untuk mengunci kursi, dengan pelunasan maksimal 30 hari sebelum berangkat. Pada situs demo ini pembayaran hanya simulasi.', actions: [{ label: 'Lihat FAQ', to: '/#faq' }] }
    } else if (has('rekomendasi', 'paket', 'umrah', 'haji', 'murah', 'hemat', 'budget', 'juta', 'bulan') || Object.keys(MONTHS).some((m) => t.includes(m)) || Object.keys(AIRPORT_WORDS).some((a) => t.includes(a))) {
      const q: PackageQuery = { sort: 'popular' }
      if (has('haji')) q.type = 'haji'
      else if (has('umrah')) q.type = 'umrah'
      const budget = parseBudget(t)
      if (budget) { q.priceMax = budget; q.sort = 'price-asc' }
      if (has('murah', 'hemat')) q.sort = 'price-asc'
      for (const [w, c] of CATEGORY_WORDS) if (t.includes(w)) q.category = c
      for (const [w, code] of Object.entries(AIRPORT_WORDS)) if (new RegExp(`\\b${w}\\b`).test(t)) q.airport = code
      for (const [w, mm] of Object.entries(MONTHS)) if (t.includes(w)) {
        const now = new Date()
        const y = Number(mm) < now.getMonth() + 1 ? now.getFullYear() + 1 : now.getFullYear()
        q.month = `${y}-${mm}`
      }
      let found = filterPackages(all, q)
      const criteria = [q.type, q.airport && AIRPORTS.find((a) => a.code === q.airport)?.name, q.month, budget && `maks. ${formatRupiah(budget)}`, q.category].filter(Boolean).join(', ')
      if (found.length === 0) {
        out = { text: `Belum ada paket yang cocok${criteria ? ` dengan kriteria (${criteria})` : ''}. Coba longgarkan filter, atau lihat seluruh katalog.`, actions: [{ label: 'Lihat semua paket', to: '/umrah' }, wa] }
      } else {
        found = found.slice(0, 3)
        out = { text: `Berikut rekomendasi${criteria ? ` untuk ${criteria}` : ''}:`, packages: found.map(ref) }
      }
    } else if (has('terima kasih', 'makasih', 'thanks')) {
      out = { text: 'Sama-sama! Semoga dimudahkan ibadahnya. Ada hal lain yang bisa dibantu?' }
    } else {
      const faq = faqs.find((f) => f.question.toLowerCase().split(/\W+/).filter((w) => w.length > 4).some((w) => t.includes(w)))
      out = faq
        ? { text: faq.answer }
        : { text: 'Maaf, saya belum memahami pertanyaan itu. Coba tanyakan tentang rekomendasi paket, harga, jadwal, fasilitas, atau persyaratan — atau hubungi admin.', actions: [wa] }
    }
    return delay(out, 500)
  },

  async spotlight(): Promise<ChatPackageRef | undefined> {
    const p = db.packages().filter((x) => x.active && totalSeatsLeft(x) > 0 && nextDeparture(x))[0]
    return p ? ref(p) : undefined
  },
}
