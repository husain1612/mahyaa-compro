import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, Loader2, MessageCircle, Send, X } from 'lucide-react'
import type { ChatReply } from '@/types'
import { chatbotService, CHAT_SUGGESTIONS } from '@/services/chatbotService'
import { Button } from '@/components/ui/button'
import { formatRupiah } from '@/utils/format'
import { cn } from '@/utils/cn'

interface Msg { id: number; from: 'bot' | 'user'; text: string; reply?: ChatReply }

const WELCOME: Msg = {
  id: 0, from: 'bot',
  text: 'Assalamu’alaikum! Saya asisten virtual Mahyaa Tour. Saya bekerja dengan aturan & data simulasi (bukan AI sungguhan). Apa yang ingin Anda ketahui?',
}

export function ChatbotWidget({ lift = false }: { lift?: boolean }) {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([WELCOME])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(1)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, busy, open])

  const send = async (raw: string) => {
    const t = raw.trim()
    if (!t || busy) return
    setText('')
    setMsgs((m) => [...m, { id: idRef.current++, from: 'user', text: t }])
    setBusy(true)
    try {
      const reply = await chatbotService.reply(t)
      setMsgs((m) => [...m, { id: idRef.current++, from: 'bot', text: reply.text, reply }])
    } catch {
      setMsgs((m) => [...m, { id: idRef.current++, from: 'bot', text: 'Maaf, terjadi gangguan. Silakan coba lagi.' }])
    } finally { setBusy(false) }
  }

  return (
    <div className="no-print">
      {!open && (
        <button onClick={() => setOpen(true)} aria-label="Buka asisten virtual"
          className={cn('fixed right-4 z-40 flex h-12 items-center gap-2 rounded-full bg-primary px-3.5 text-primary-foreground shadow-lg hover:bg-secondary sm:px-4 lg:bottom-6', lift ? 'bottom-24' : 'bottom-4')}>
          <MessageCircle className="h-5 w-5" /><span className="hidden text-sm font-semibold sm:inline">Tanya Asisten</span>
        </button>
      )}
      {open && (
        <section role="dialog" aria-label="Asisten virtual Mahyaa Tour"
          className="fixed inset-x-3 bottom-3 z-50 flex h-[min(34rem,calc(100vh-1.5rem))] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl animate-fade-up sm:inset-x-auto sm:right-4 sm:w-96">
          <header className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2"><Bot className="h-5 w-5" /><div><p className="text-sm font-semibold leading-none">Asisten Mahyaa</p><p className="text-[11px] text-white/75">Simulasi berbasis aturan</p></div></div>
            <button onClick={() => setOpen(false)} aria-label="Tutup asisten" className="rounded p-1 hover:bg-white/15"><X className="h-5 w-5" /></button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto bg-background p-3" aria-live="polite">
            {msgs.map((m) => (
              <div key={m.id} className={cn('flex', m.from === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[85%] space-y-2 rounded-2xl px-3 py-2 text-sm', m.from === 'user' ? 'bg-primary text-primary-foreground' : 'border border-border bg-surface')}>
                  <p>{m.text}</p>
                  {m.reply?.packages?.map((p) => (
                    <Link key={p.slug} to={`/paket/${p.slug}`} onClick={() => setOpen(false)} className="block rounded-lg border border-border bg-background p-2 hover:border-primary">
                      <span className="block font-semibold">{p.name}</span>
                      <span className="text-xs text-muted">{p.durationDays} hari · mulai {formatRupiah(p.priceFrom)}</span>
                    </Link>
                  ))}
                  {m.reply?.actions && (
                    <div className="flex flex-wrap gap-1.5">
                      {m.reply.actions.map((a) => a.href
                        ? <a key={a.label} href={a.href} target="_blank" rel="noreferrer" className="rounded-full border border-primary px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/10">{a.label}</a>
                        : <Link key={a.label} to={a.to ?? '/'} onClick={() => setOpen(false)} className="rounded-full border border-primary px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/10">{a.label}</Link>)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && <div className="flex items-center gap-2 text-xs text-muted"><Loader2 className="h-4 w-4 animate-spin" />Mengetik…</div>}
            <div ref={endRef} />
          </div>
          <div className="flex gap-1.5 overflow-x-auto border-t border-border px-3 py-2">
            {CHAT_SUGGESTIONS.map((s) => <button key={s} onClick={() => send(s)} className="shrink-0 rounded-full bg-black/5 px-3 py-1 text-xs hover:bg-black/10">{s}</button>)}
          </div>
          <form className="flex gap-2 border-t border-border p-3" onSubmit={(e) => { e.preventDefault(); send(text) }}>
            <label htmlFor="chat-input" className="sr-only">Pesan</label>
            <input id="chat-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ketik pertanyaan…" className="h-10 flex-1 rounded-lg border border-border px-3 text-sm" />
            <Button type="submit" size="icon" disabled={busy || !text.trim()} aria-label="Kirim"><Send className="h-4 w-4" /></Button>
          </form>
        </section>
      )}
    </div>
  )
}
