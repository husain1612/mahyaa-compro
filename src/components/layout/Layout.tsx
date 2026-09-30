import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { Toaster } from 'sonner'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { ChatbotWidget } from '@/components/chatbot/ChatbotWidget'
import { waLink } from '@/utils/format'
import { cn } from '@/utils/cn'

export function Layout({ bare }: { bare?: boolean }) {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 50)
    else window.scrollTo(0, 0)
  }, [pathname, hash])

  // Halaman dengan bar tetap di bawah (mobile): angkat tombol melayang agar tidak menutupinya
  const lift = pathname.startsWith('/paket/') || pathname.startsWith('/booking/')

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3">Lewati ke konten</a>
      <Navbar />
      <main id="main" className="flex-1"><Outlet /></main>
      {!bare && <Footer />}
      <a href={waLink()} target="_blank" rel="noreferrer" aria-label="Chat WhatsApp admin (nomor dummy)"
        className={cn('no-print fixed right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_-6px_rgba(37,211,102,.7)] transition hover:brightness-110 lg:bottom-24', lift ? 'bottom-44' : 'bottom-20')}>
        <MessageCircle className="h-7 w-7" />
        <span aria-hidden className="absolute right-0.5 top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-red-500" />
      </a>
      <ChatbotWidget lift={lift} />
      <Toaster richColors position="top-center" />
    </div>
  )
}
