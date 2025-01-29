"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
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
    <div className="border border-red-100 rounded-lg bg-red-50/30 shadow-sm">
      <div className="px-6 py-4 border-b border-red-100">
        <h2 className="text-2xl font-bold text-red-600">アカウント削除</h2>
      </div>

      <div className="px-6 py-6 space-y-6">
        <AlertMessage message={error} type="error" />

        {!isConfirmOpen ? (
          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              アカウントを削除すると全てのデータが完全に削除され、復元できません。
            </p>
            <Button
              variant="destructive"
              onClick={() => setIsConfirmOpen(true)}
              className="w-full sm:w-auto"
            >
              アカウントを削除する
            </Button>
          </div>
        ) : (
          <form onSubmit={handleDelete} className="space-y-6">
            <p className="text-red-600 font-medium">
              本当にアカウントを削除しますか？
            </p>

            <div className="space-y-4">
              <Input
                type="password"
                label="パスワードを入力して確認"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsConfirmOpen(false)}
                  className="flex-1"
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? '削除中...' : '削除する'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// 再利用可能なコンポーネント
const AlertMessage = ({ 
  message, 
  type 
}: {
  message: string | null
  type: 'error' | 'success'
}) => {
  if (!message) return null

  return (
    <div className={`p-3 text-sm rounded-md ${
      type === 'error' 
        ? 'text-red-600 bg-red-50' 
        : 'text-green-600 bg-green-50'
    }`}>
      {message}
    </div>
  )
}

const Input = ({
  type = 'text',
  label,
  value,
  onChange,
  required = false
}: {
  type?: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
}) => (
  <div>
    <label className="block mb-2 text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
      required={required}
    />
  </div>
)