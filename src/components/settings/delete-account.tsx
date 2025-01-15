"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

export function DeleteAccount() {
  const router = useRouter()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('ユーザーが見つかりません')

      // パスワードの再認証
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || '',
        password,
      })

      if (signInError) {
        setError('パスワードが正しくありません')
        return
      }

      // ユーザーの削除
      const { error: deleteError } = await supabase.rpc('delete_user')
      if (deleteError) throw deleteError

      // サインアウト
      await supabase.auth.signOut()
      router.push('/signup')
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      setError('アカウントの削除に失敗しました')
    } finally {
      setLoading(false)
    }
  }


  return (
    <Card className="border-red-200">
      <CardHeader>
        <h2 className="text-2xl font-bold text-red-600">アカウント削除</h2>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-2 text-sm text-red-600 bg-red-50 rounded">
            {error}
          </div>
        )}
        {!isConfirmOpen ? (
          <div>
            <p className="mb-4 text-gray-600">
              アカウントを削除すると、すべてのデータが完全に削除され、復元することはできません。
            </p>
            <Button
              variant="destructive"
              onClick={() => setIsConfirmOpen(true)}
            >
              アカウントを削除する
            </Button>
          </div>
        ) : (
          <form onSubmit={handleDelete} className="space-y-4">
            <p className="text-red-600 font-semibold">
              本当にアカウントを削除しますか？
            </p>
            <div>
              <label className="block mb-2 text-sm">パスワードを入力して確認</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsConfirmOpen(false)}
              >
                キャンセル
              </Button>
              <Button 
                type="submit" 
                variant="destructive"
                disabled={loading}
              >
                {loading ? '削除中...' : '削除する'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
