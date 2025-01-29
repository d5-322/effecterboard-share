"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
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

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error
        if (user?.email) setCurrentEmail(user.email)
      } catch (error) {
        setError('ユーザー情報の取得に失敗しました')
      }
    }
    getCurrentUser()
  }, [])

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
      const { error } = await supabase.auth.updateUser({ email: newEmail })
      
      if (error) {
        const errorMessage = error.message.toLowerCase()
        if (errorMessage.includes('already') || error.status === 422) {
          setError('このメールアドレスは既に使用されています')
          return
        }
        throw error
      }

      router.push('/settings/email-verification')
    } catch (error) {
      setError(error instanceof Error ? error.message : '更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    if (newPassword.length < 6) {
      setError('パスワードは6文字以上必要です')
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError('パスワードが一致しません')
      setLoading(false)
      return
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentEmail,
        password: currentPassword,
      })

      if (signInError) throw new Error('現在のパスワードが不正です')
      if (currentPassword === newPassword) {
        setError('新しいパスワードを設定してください')
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) throw updateError

      setSuccessMessage('パスワードを更新しました')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      setError(error instanceof Error ? error.message : '更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b">
        <h2 className="text-2xl font-bold">アカウント設定</h2>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* メッセージ表示エリア */}
        {(error || successMessage) && (
          <div className={`p-3 text-sm rounded-md ${
            error ? 'text-red-500 bg-red-50' : 'text-green-500 bg-green-50'
          }`}>
            {error || successMessage}
          </div>
        )}

        {/* メールアドレス変更フォーム */}
        <form onSubmit={handleEmailUpdate} className="space-y-4">
          <h3 className="text-lg font-semibold">メールアドレス変更</h3>
          <div className="space-y-4">
            <InputField
              label="現在のメールアドレス"
              value={currentEmail}
              disabled
            />
            <InputField
              label="新しいメールアドレス"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="新しいメールアドレスを入力"
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={loading || !newEmail}
          >
            {loading ? '変更中...' : '変更する'}
          </Button>
        </form>

        {/* パスワード変更フォーム */}
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <h3 className="text-lg font-semibold">パスワード変更</h3>
          <div className="space-y-4">
            <InputField
              type="password"
              label="現在のパスワード"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loading}
            />
            <InputField
              type="password"
              label="新しいパスワード"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="6文字以上"
              disabled={loading}
            />
            <InputField
              type="password"
              label="新しいパスワード（確認）"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
          >
            {loading ? '変更中...' : '変更する'}
          </Button>
        </form>
      </div>
    </div>
  )
}

// 再利用可能な入力フィールドコンポーネント
const InputField = ({
  type = 'text',
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  type?: string
  label: string
  value: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  disabled?: boolean
}) => (
  <div>
    <label className="block mb-2 text-sm font-medium">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
      placeholder={placeholder}
      disabled={disabled}
    />
  </div>
)