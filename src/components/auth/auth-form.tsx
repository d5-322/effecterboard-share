"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

type AuthMode = 'signin' | 'signup'

interface AuthFormProps {
  mode: AuthMode
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [userType, setUserType] = useState<'guitarist' | 'bassist'>('guitarist')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              username,
              user_type: userType,
            }
          },
        })
        if (error) throw error
        alert('確認メールを送信しました。メールをご確認ください。')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '認証エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <h1 className="text-2xl font-bold text-center">
          {mode === 'signin' ? 'ログイン' : 'アカウント作成'}
        </h1>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-2 text-sm text-red-600 bg-red-50 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block mb-2 text-sm">ユーザー名</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                  minLength={3}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm">ユーザータイプ</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="guitarist"
                      checked={userType === 'guitarist'}
                      onChange={(e) => setUserType(e.target.value as 'guitarist' | 'bassist')}
                      className="mr-2"
                    />
                    ギタリスト
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="bassist"
                      checked={userType === 'bassist'}
                      onChange={(e) => setUserType(e.target.value as 'guitarist' | 'bassist')}
                      className="mr-2"
                    />
                    ベーシスト
                  </label>
                </div>
              </div>
            </>
          )}
          <div>
            <label className="block mb-2 text-sm">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '処理中...' : mode === 'signin' ? 'ログイン' : 'アカウント作成'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex-col space-y-4">
        {mode === 'signin' && (
          <Link href="/auth/reset-password" className="text-sm text-purple-600 hover:underline">
            パスワードをお忘れの方
          </Link>
        )}
        {mode === 'signin' ? (
          <p className="text-sm text-gray-600">
            アカウントをお持ちでない方は
            <Link href="/signup" className="text-purple-600 hover:underline">
              こちら
            </Link>
          </p>
        ) : (
          <p className="text-sm text-gray-600">
            すでにアカウントをお持ちの方は
            <Link href="/signin" className="text-purple-600 hover:underline">
              こちら
            </Link>
          </p>
        )}
      </CardFooter>
    </Card>
  )
}
