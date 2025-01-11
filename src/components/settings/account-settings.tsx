"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export function AccountSettings() {
  const router = useRouter()
  const [currentEmail, setCurrentEmail] = useState<string>('')
  const [newEmail, setNewEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // 現在のユーザー情報の取得
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setCurrentEmail(user.email)
      }
    }
    getCurrentUser()
  }, [])

  // メールアドレス更新
  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (currentEmail === newEmail) {
      setError('現在のメールアドレスと同じです')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      })

      // Supabaseのエラーコードを確認
      if (error) {
        // エラーメッセージまたはエラーコードに基づいて判定
        if (error.message.includes('already taken') || 
            error.message.includes('already exists') || 
            error.message.toLowerCase().includes('already registered') ||
            error.status === 422) {  // 422はUnprocessable Entityエラー
          setError('このメールアドレスは既に他のユーザーに使用されています')
          setLoading(false)
          return
        }
        throw error
      }

      // エラーがない場合は確認ページへ
      router.push('/settings/email-verification')
    } catch (error) {
      console.error('Email update error:', error)  // デバッグ用
      setError(error instanceof Error ? error.message : 'メールアドレスの更新に失敗しました')
      setLoading(false)
    }
  }

  // パスワード更新
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    if (newPassword.length < 6) {
      setError('パスワードは6文字以上である必要があります')
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError('新しいパスワードと確認用パスワードが一致しません')
      setLoading(false)
      return
    }

    try {
      // 現在のパスワードで認証を確認
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentEmail,
        password: currentPassword,
      })

      if (signInError) throw new Error('現在のパスワードが正しくありません')

      // 現在のパスワードと新しいパスワードが同じかチェック
      if (currentPassword === newPassword) {
        setError('新しいパスワードは古いパスワードと異なる必要があります')
        setLoading(false)
        return
      }

      // パスワード更新
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) throw updateError

      setSuccessMessage('パスワードの更新が完了しました')
      // フォームをリセット
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'パスワードの更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">アカウント設定</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="p-3 text-sm text-green-500 bg-green-50 rounded-md">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleEmailUpdate} className="space-y-4">
          <h3 className="text-lg font-semibold">メールアドレス変更</h3>
          <div>
            <label className="block mb-2 text-sm">現在のメールアドレス</label>
            <input
              type="email"
              value={currentEmail}
              className="w-full p-2 border rounded-md bg-gray-50"
              disabled
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">新しいメールアドレス</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full p-2 border rounded-md"
              disabled={loading}
              placeholder="新しいメールアドレスを入力"
            />
          </div>
          <Button type="submit" disabled={loading || !newEmail}>
            {loading ? '変更中...' : '変更する'}
          </Button>
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
              disabled={loading}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">新しいパスワード</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded-md"
              disabled={loading}
              placeholder="6文字以上"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">新しいパスワード（確認）</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded-md"
              disabled={loading}
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
          >
            {loading ? '変更中...' : '変更する'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}