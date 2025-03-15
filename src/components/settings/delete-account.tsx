"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Trash2 } from 'lucide-react'
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

      // パスワード認証
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || '',
        password,
      })

      if (signInError) {
        setError('パスワードが正しくありません')
        setLoading(false)
        return
      }

      // ユーザー削除処理
      const { error: deleteError } = await supabase.rpc('delete_user')
      if (deleteError) throw deleteError

      await supabase.auth.signOut()
      router.push('/signup')
      router.refresh()
    } catch (error) {
      console.error('削除エラー:', error)
      setError(error instanceof Error ? error.message : 'アカウント削除に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border border-red-200 bg-red-50/30 shadow-sm">
      <CardHeader className="border-b border-red-200 pb-4">
        <CardTitle className="flex items-center gap-2 text-2xl font-bold text-red-600">
          <Trash2 className="h-6 w-6" />
          アカウント削除
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {error && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-500">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {!isConfirmOpen ? (
          <div className="space-y-6">
            <div className="rounded-lg bg-red-100/50 p-4 border border-red-200">
              <h3 className="font-semibold mb-2 text-red-700">ご注意ください</h3>
              <p className="text-gray-700 leading-relaxed text-sm">
                • アカウントを削除すると、すべてのデータが完全に削除されます<br />
                • 削除後のデータは復元できません
              </p>
            </div>

            <Button
              variant="destructive"
              onClick={() => setIsConfirmOpen(true)}
              className="w-full sm:w-auto"
            >
              アカウント削除手続きを開始する
            </Button>
          </div>
        ) : (
          <form onSubmit={handleDelete} className="space-y-6">
            <div className="rounded-lg bg-red-100/50 p-4 border border-red-200">
              <h3 className="font-semibold mb-2 text-red-700">最終確認</h3>
              <p className="text-gray-700 leading-relaxed text-sm">
                アカウントを削除すると、すべてのプロファイル情報、保存データ、設定が削除されます。
                この操作は取り消すことができません。
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-gray-700">
                  パスワードを入力して確認
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-red-200 focus:border-red-400 focus:ring-red-400"
                  placeholder="現在のパスワードを入力"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsConfirmOpen(false)
                    setPassword('')
                    setError(null)
                  }}
                  className="flex-1 border-gray-300"
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={loading || !password}
                  className="flex-1"
                >
                  {loading ? '削除中...' : '完全に削除する'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}