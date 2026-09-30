import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Scene, SCENE_LABEL } from '@/components/common/Scene'
import { cn } from '@/utils/cn'

export function PackageGallery({ images, name }: { images: string[]; name: string }) {
  const [i, setI] = useState(0)
  const go = (d: number) => setI((i + d + images.length) % images.length)
  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-black/5">
        <Scene id={images[i]} alt={`${name} — ${SCENE_LABEL[images[i]] ?? `foto ${i + 1}`}`} />
        <button onClick={() => go(-1)} aria-label="Foto sebelumnya" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"><ChevronLeft className="h-5 w-5" /></button>
        <button onClick={() => go(1)} aria-label="Foto berikutnya" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"><ChevronRight className="h-5 w-5" /></button>
        <span className="absolute bottom-2 right-3 rounded bg-black/50 px-2 py-0.5 text-xs text-white">{i + 1}/{images.length}</span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {images.map((img, idx) => (
          <button key={idx} onClick={() => setI(idx)} aria-label={`Tampilkan foto ${idx + 1}`} aria-current={idx === i}
            className={cn('aspect-[16/10] overflow-hidden rounded-lg border-2', idx === i ? 'border-accent' : 'border-transparent opacity-70 hover:opacity-100')}>
            <Scene id={img} />
          </button>
        ))}
      </div>
    </div>
  )
}
