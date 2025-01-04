"use client"

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      router.push('/signin')
      router.refresh()
    }
  }

  return (
    <Button
      variant="ghost"
      className="w-full justify-start gap-2 text-red-600 hover:text-red-700"
      onClick={handleSignOut}
    >
      <LogOut className="h-5 w-5" />
      ログアウト
    </Button>
  )
}
