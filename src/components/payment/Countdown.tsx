import { useEffect, useState } from 'react'
import { Timer } from 'lucide-react'

export function Countdown({ until, onExpire }: { until: string; onExpire: () => void }) {
  const [left, setLeft] = useState(() => new Date(until).getTime() - Date.now())
  useEffect(() => {
    const t = setInterval(() => {
      const l = new Date(until).getTime() - Date.now()
      setLeft(l)
      if (l <= 0) { clearInterval(t); onExpire() }
    }, 1000)
    return () => clearInterval(t)
  }, [until, onExpire])
  const s = Math.max(0, Math.floor(left / 1000))
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return <span className="inline-flex items-center gap-1.5 font-mono font-semibold" role="timer"><Timer className="h-4 w-4" />{h > 0 ? `${pad(h)}:` : ''}{pad(m)}:{pad(sec)}</span>
}
