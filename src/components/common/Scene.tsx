import { cn } from '@/utils/cn'

/**
 * Ilustrasi SVG buatan sendiri sebagai pengganti foto (lingkungan pengembangan tidak
 * dapat mengunduh foto Ka'bah/Masjid Nabawi). Untuk memakai foto asli, isi `gallery`
 * paket dengan URL gambar — komponen ini otomatis menampilkan <img>.
 */
export type SceneId = 'kaaba' | 'nabawi' | 'hotel' | 'flight' | 'madinah-night' | 'dates'

const skies: Record<SceneId, [string, string]> = {
  kaaba: ['#4a2b1c', '#c9a24b'],
  nabawi: ['#6e4128', '#e8c98a'],
  hotel: ['#5a3522', '#f0dfb5'],
  flight: ['#0e3b6b', '#9cc7e8'],
  'madinah-night': ['#1a1410', '#824d34'],
  dates: ['#5a3a16', '#d9a441'],
}

export const SCENE_LABEL: Record<string, string> = {
  kaaba: "Ka'bah (ilustrasi)", nabawi: 'Masjid Nabawi (ilustrasi)', hotel: 'Hotel (ilustrasi)',
  flight: 'Penerbangan (ilustrasi)', 'madinah-night': 'Madinah malam (ilustrasi)', dates: 'Kurma & oleh-oleh (ilustrasi)',
}

export function Scene({ id, className, alt }: { id: string; className?: string; alt?: string }) {
  if (/^(https?:|\/)/.test(id)) return <img src={id} alt={alt ?? ''} className={cn('h-full w-full object-cover', className)} loading="lazy" />
  const sid = (id in skies ? id : 'kaaba') as SceneId
  const [a, b] = skies[sid]
  const gid = `g-${sid}`
  return (
    <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" role="img" aria-label={alt ?? SCENE_LABEL[sid]} className={cn('h-full w-full', className)}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient>
      </defs>
      <rect width="400" height="260" fill={`url(#${gid})`} />
      {(sid === 'madinah-night' || sid === 'kaaba') && Array.from({ length: 24 }).map((_, i) => (
        <circle key={i} cx={(i * 97) % 400} cy={(i * 53) % 110} r={i % 3 === 0 ? 1.6 : 1} fill="#fff" opacity={0.6} />
      ))}
      {sid === 'kaaba' && (<g>
        <rect x="150" y="105" width="100" height="110" fill="#111" /><rect x="150" y="128" width="100" height="10" fill="#c9a24b" />
        <rect x="185" y="150" width="30" height="65" rx="3" fill="#c9a24b" opacity=".85" />
        <ellipse cx="200" cy="228" rx="120" ry="14" fill="#e9e4d4" opacity=".8" />
      </g>)}
      {(sid === 'nabawi' || sid === 'madinah-night') && (<g fill={sid === 'nabawi' ? '#f6efdc' : '#d6e6df'}>
        <rect x="120" y="150" width="160" height="70" />
        <path d="M160 150a40 40 0 0 1 80 0z" fill="#2f8f6f" /><rect x="198" y="90" width="4" height="22" /><circle cx="200" cy="88" r="4" fill="#c9a24b" />
        <rect x="90" y="95" width="14" height="125" /><rect x="296" y="95" width="14" height="125" />
        <path d="M90 95l7-22 7 22zM296 95l7-22 7 22z" fill="#c9a24b" />
      </g>)}
      {sid === 'hotel' && (<g>
        <rect x="140" y="70" width="120" height="150" fill="#f6efdc" />
        {Array.from({ length: 5 }).flatMap((_, r) => Array.from({ length: 4 }).map((__, c) => (
          <rect key={`${r}${c}`} x={152 + c * 28} y={82 + r * 28} width="16" height="16" fill={(r + c) % 3 === 0 ? '#c9a24b' : '#8a6a48'} />
        )))}
        <rect x="185" y="190" width="30" height="30" fill="#3e2716" />
      </g>)}
      {sid === 'flight' && (<g>
        <path d="M60 170c50-30 130-70 260-90l-20 25 40 15-30 15-15 18-45-14-95 40-10-25z" fill="#fff" />
        <path d="M0 220c80-15 160-10 260 0s100 10 140 0v40H0z" fill="#fff" opacity=".35" />
      </g>)}
      {sid === 'dates' && (<g fill="#3d2410">
        {Array.from({ length: 9 }).map((_, i) => <ellipse key={i} cx={120 + (i % 3) * 70} cy={150 + Math.floor(i / 3) * 30} rx="24" ry="12" transform={`rotate(${(i * 23) % 50 - 25} ${120 + (i % 3) * 70} ${150 + Math.floor(i / 3) * 30})`} />)}
      </g>)}
      <rect x="0" y="222" width="400" height="38" fill="#000" opacity=".12" />
    </svg>
  )
}
