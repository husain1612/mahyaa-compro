export const formatRupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

export const formatDateShort = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export const monthKey = (iso: string) => iso.slice(0, 7)

export const monthLabel = (key: string) =>
  new Date(key + '-01T00:00:00').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

export const WHATSAPP_NUMBER = '6281200000000' // NOMOR DUMMY — ganti sebelum produksi
export const waLink = (text = 'Halo Mahyaa Tour, saya ingin bertanya tentang paket umrah/haji.') =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
