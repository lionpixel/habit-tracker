import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'
import { AppShell }      from '@/components/layout/AppShell'
import { ThemeProvider }  from '@/contexts/ThemeContext'
import { AuthProvider }   from '@/providers/AuthProvider'
import { ErrorBoundary }  from '@/components/ErrorBoundary'

const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',
  display:  'swap',
  preload:  true,
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://habitdb.vercel.app',
  ),
  title: {
    default:  'HabitDB — Sistema Científico de Hábitos',
    template: '%s | HabitDB',
  },
  description:
    'Rastreador científico de hábitos com análise semanal, mensal, anual, controle de sono e foco.',
  keywords: ['hábitos', 'produtividade', 'pomodoro', 'sono', 'tracking', 'habit tracker'],
  authors: [{ name: 'HabitDB' }],
  openGraph: {
    title:       'HabitDB — Sistema Científico de Hábitos',
    description: 'Rastreador de hábitos científico e visual.',
    type:        'website',
    locale:      'pt_BR',
  },
  icons: {
    icon: '/favicon.svg',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable:         true,
    statusBarStyle:  'black-translucent',
    title:           'HabitDB',
  },
}

export const viewport: Viewport = {
  themeColor:   '#080b14',
  width:        'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body className="antialiased">
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              <AppShell>
                {children}
              </AppShell>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>

        <Toaster
          position="top-right"
          theme="dark"
          richColors
          toastOptions={{
            style: {
              background:     'rgba(13,17,23,0.95)',
              border:         '1px solid rgba(255,255,255,0.1)',
              color:          '#f1f5f9',
              borderRadius:   '14px',
              backdropFilter: 'blur(20px)',
              fontSize:       '13px',
              fontWeight:     '500',
              boxShadow:      '0 8px 32px rgba(0,0,0,0.4)',
            },
            className: 'font-sans',
            duration:  3000,
          }}
        />
      </body>
    </html>
  )
}
