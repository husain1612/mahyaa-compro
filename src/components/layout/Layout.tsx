import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { Toaster } from 'sonner'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { ChatbotWidget } from '@/components/chatbot/ChatbotWidget'
import { waLink } from '@/utils/format'

export function Layout({ bare }: { bare?: boolean }) {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 50)
    else window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3">Lewati ke konten</a>
      <Navbar />
      <main id="main" className="flex-1"><Outlet /></main>
      {!bare && <Footer />}
      <a href={waLink()} target="_blank" rel="noreferrer" aria-label="Chat WhatsApp admin (nomor dummy)" className="no-print fixed bottom-24 right-4 z-40 hidden h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-lg hover:brightness-110 lg:grid"><MessageCircle className="h-6 w-6" /></a>
      <ChatbotWidget lift={pathname.startsWith('/paket/')} />
      <Toaster richColors position="top-center" />
    </div>
  )
}
