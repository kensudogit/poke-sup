import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import ToastContainer from '@/components/common/Toast'
import ReminderNotification from '@/components/reminders/ReminderNotification'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ポケさぽ - 患者と医療従事者のコミュニケーションプラットフォーム',
  description: '患者と医療従事者間のコミュニケーションを円滑にするシステム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            {children}
            <ReminderNotification />
          </Providers>
          <ToastContainer />
        </ErrorBoundary>
      </body>
    </html>
  )
}

