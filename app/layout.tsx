import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Incompass Research',
  description: 'Talent intelligence research platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/sign-in"
    >
      <html lang="en" className={`${geist.className} h-full antialiased`}>
        <body className="min-h-full bg-zinc-50 text-zinc-900">
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
