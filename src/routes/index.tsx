import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { PageLoader } from '@/components/common/states'
import { RequireAuth } from './guards'
import HomePage from '@/pages/HomePage'
import PackageListPage from '@/pages/PackageListPage'
import PackageDetailPage from '@/pages/PackageDetailPage'
import BookingPage from '@/pages/BookingPage'
import CheckoutPage from '@/pages/CheckoutPage'
import PaymentPage from '@/pages/PaymentPage'
import PaymentSuccessPage from '@/pages/PaymentSuccessPage'
import DashboardPage from '@/pages/DashboardPage'
import AuthPage from '@/pages/AuthPage'
import { AboutPage, ContactPage, NotFoundPage } from '@/pages/StaticPages'

const AdminPage = lazy(() => import('@/pages/AdminPage')) // recharts hanya dimuat untuk admin

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/umrah', element: <PackageListPage type="umrah" /> },
      { path: '/haji', element: <PackageListPage type="haji" /> },
      { path: '/paket/:slug', element: <PackageDetailPage /> },
      { path: '/booking/:slug', element: <BookingPage /> },
      { path: '/checkout/:bookingId', element: <CheckoutPage /> },
      { path: '/payment/success/:bookingId', element: <PaymentSuccessPage /> },
      { path: '/payment/:bookingId', element: <PaymentPage /> },
      { path: '/tentang', element: <AboutPage /> },
      { path: '/kontak', element: <ContactPage /> },
      { path: '/masuk', element: <AuthPage mode="login" /> },
      { path: '/daftar', element: <AuthPage mode="register" /> },
      { element: <RequireAuth />, children: [{ path: '/dashboard', element: <DashboardPage /> }] },
      { element: <RequireAuth role="admin" />, children: [{ path: '/admin', element: <Suspense fallback={<PageLoader />}><AdminPage /></Suspense> }] },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export const AppRouter = () => <RouterProvider router={router} />
