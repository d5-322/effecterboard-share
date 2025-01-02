import { Home, PlusSquare, User, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'

const menuItems = [
  { href: '/', icon: Home, label: 'ホーム' },
  { href: '/posts/new', icon: PlusSquare, label: '投稿' },
  { href: '/profile', icon: User, label: 'プロフィール' },
  { href: '/settings', icon: Settings, label: '設定' },
]

export function Sidebar() {
  return (
    <div className="fixed h-full w-64 border-r bg-white p-4">
      <div className="mb-8">
        <Logo />
      </div>
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Button>
          </Link>
        ))}
        <Button variant="ghost" className="w-full justify-start gap-2 text-red-600 hover:text-red-700">
          <LogOut className="h-5 w-5" />
          ログアウト
        </Button>
      </nav>
    </div>
  )
}
