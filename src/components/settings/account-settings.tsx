"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function AccountSettings() {
  const [email, setEmail] = useState('user@example.com')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleEmailUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Supabaseとの連携
    console.log('Email update:', email)
  }

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Supabaseとの連携
    console.log('Password update')
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">アカウント設定</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleEmailUpdate} className="space-y-4">
          <h3 className="text-lg font-semibold">メールアドレス変更</h3>
          <div>
            <label className="block mb-2 text-sm">新しいメールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <Button type="submit">更新する</Button>
        </form>

        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <h3 className="text-lg font-semibold">パスワード変更</h3>
          <div>
            <label className="block mb-2 text-sm">現在のパスワード</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">新しいパスワード</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">新しいパスワード（確認）</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <Button type="submit">変更する</Button>
        </form>
      </CardContent>
    </Card>
  )
}
