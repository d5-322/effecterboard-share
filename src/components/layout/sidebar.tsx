"use client"

import { Home, PlusSquare, User, Settings, LogIn, UserPlus, FileText } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { useAuth } from '@/contexts/auth-context'

interface SidebarProps {
  isMobile?: boolean
  onClose?: () => void
}

export function Sidebar({ isMobile, onClose }: SidebarProps) {
  const { user } = useAuth()
  
  // ユーザーIDに基づいてメニュー項目を生成
  const authenticatedMenuItems = [
    { href: '/', icon: Home, label: 'ホーム' },
    { href: '/posts/new', icon: PlusSquare, label: '新規投稿' },
    { href: user ? `/profile/${user.id}` : '/profile', icon: User, label: 'プロフィール' },
    { href: '/settings', icon: Settings, label: '設定' },
    { href: '/terms', icon: FileText, label: '利用規約' },
  ]

  const unauthenticatedMenuItems = [
    { href: '/', icon: Home, label: 'ホーム' },
    { href: '/signin', icon: LogIn, label: 'ログイン' },
    { href: '/signup', icon: UserPlus, label: '新規登録' },
    { href: '/terms', icon: FileText, label: '利用規約' },
  ]

  const menuItems = user ? authenticatedMenuItems : unauthenticatedMenuItems
  
  const baseStyles = isMobile 
    ? 'w-full pt-12' 
    : 'fixed h-full w-64 border-r bg-white p-4'

  return (
    <header className={baseStyles}>
      {!isMobile && (
        <div className="mb-8">
          <Logo />
        </div>
      )}
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href} onClick={onClose}>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Button>
          </Link>
        ))}
        {user && <SignOutButton />}
      </nav>
    </header>
  )
}
