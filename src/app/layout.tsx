import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { AuthProvider } from '@/contexts/auth-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Effecterboard Share',
  description: 'ギタリスト・ベーシスト向けのエフェクターボード共有コミュニティ。自慢のエフェクターセットアップを画像・テキストで投稿し、いいね機能で他のプレイヤーと交流。初心者から上級者まで、エフェクター情報を活発に交換できるシンプルなプラットフォーム。',
  keywords: ['エフェクター', 'ギター', 'ベース', 'エフェクターボード', 'エフェクター共有', 'Effecter board', 'Pedals board', ],
  appleWebApp: true,

  openGraph: {
    title: 'Effecterboard Share',
    description: 'ギタリスト・ベーシスト向けのエフェクターボード共有コミュニティ。自慢のエフェクターセットアップを画像・テキストで投稿し、いいね機能で他のプレイヤーと交流。初心者から上級者まで、エフェクター情報を活発に交換できるシンプルなプラットフォーム。',
    type: 'website',
    // サイトのURLを設定
    url: 'https://your-domain.com',
    // OGP画像のURLを設定
    images: [
      {
        url: 'https://example.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Effecterboard Share',
      },
    ],
  },
  // Twitterカードのmetaデータ
  twitter: {
    card: 'summary_large_image',
    title: 'Effecterboard Share',
    description: 'ギタリスト・ベーシスト向けのエフェクターボード共有コミュニティ。自慢のエフェクターセットアップを画像・テキストで投稿し、いいね機能で他のプレイヤーと交流。初心者から上級者まで、エフェクター情報を活発に交換できるシンプルなプラットフォーム。',
    images: [
      {
        url: 'https://example.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Effecterboard Share',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex min-h-screen bg-white">
            <div className="hidden lg:block">
              <Sidebar />
            </div>
            <MobileNav />
            <main className="flex-1 lg:pl-64">
              <div className="container mx-auto p-6 pt-20 lg:pt-6">
                  {children}
              </div>
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
