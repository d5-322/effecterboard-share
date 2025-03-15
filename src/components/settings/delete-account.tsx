"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { AlertCircle, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function DeleteAccount() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmStep, setConfirmStep] = useState<'initial' | 'confirm'>('initial')

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

  const resetForm = () => {
    setPassword('')
    setError(null)
    setConfirmStep('initial')
  }

  return (
    <Card className="rounded-lg shadow-sm bg-red-50">
      <CardContent className="py-4">
        <Accordion type="single" collapsible>
          {/* アカウント削除セクション */}
          <AccordionItem value="delete-account">
            <AccordionTrigger className="py-4 flex items-center">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 rounded-full p-2">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-medium">アカウント削除</h3>
                  <p className="text-sm text-gray-500">アカウントとすべてのデータを完全に削除します</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                {error && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-500">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {confirmStep === 'initial' ? (
                  <div className="space-y-4">
                    <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                      <h3 className="font-medium mb-2 text-red-700">注意事項</h3>
                      <p className="text-gray-700 text-sm">
                        アカウントを削除すると、以下のデータが完全に削除され、復元できなくなります：
                      </p>
                      <ul className="list-disc pl-5 mt-2 text-sm text-gray-700">
                        <li>すべてのプロファイル情報</li>
                        <li>保存したデータと設定</li>
                      </ul>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => setConfirmStep('confirm')}
                      className="w-full sm:w-auto"
                    >
                      アカウント削除手続きを開始する
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleDelete} className="space-y-4">
                    <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                      <h3 className="font-medium mb-2 text-red-700">最終確認</h3>
                      <p className="text-sm text-gray-700">
                        この操作は取り消すことができません。本当にアカウントを削除しますか？
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">パスワードを入力して確認</Label>
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
                          onClick={resetForm}
                          className="flex-1"
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
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}