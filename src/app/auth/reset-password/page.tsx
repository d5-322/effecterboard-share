'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // セッションの状態を確認
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('パスワードリセットのリンクの有効期限が切れている可能性があります。再度パスワードリセットを行ってください。')
        setTimeout(() => {
          router.push('/signin')
        }, 1000)
      }
    }
    
    checkSession()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (password !== confirmPassword) {
      setError('パスワードが一致しません')
      setLoading(false)
      return
    }

    try {
      // パスワードの更新
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })
      if (updateError) throw updateError

      // パスワード更新後にサインアウト
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError

      setMessage('パスワードを更新しました。ログイン画面に移動します。')
      
      setTimeout(() => {
        router.push('/signin')
      }, 1000)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <h1 className="text-2xl font-bold text-center">新しいパスワードの設定</h1>
      </CardHeader>
      <CardContent>
        {message && (
          <div className="mb-4 p-2 text-sm text-green-600 bg-green-50 rounded">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-2 text-sm text-red-600 bg-red-50 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm">新しいパスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">パスワードの確認</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full bg-gray-700" disabled={loading}>
            {loading ? '更新中...' : 'パスワードを更新'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}