import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { ChatbotWidget } from '@/components/chatbot/ChatbotWidget'

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
      <ChatbotWidget />
      <Toaster richColors position="top-center" />
    </div>
  )
}
