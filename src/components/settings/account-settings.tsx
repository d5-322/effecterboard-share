"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

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
    setSuccessMessage(null)

    if (currentEmail === newEmail) {
      setError('現在のメールアドレスと同じです')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      })

      if (error) {
        if (error.message.includes('already taken') || 
            error.message.includes('already exists') || 
            error.message.toLowerCase().includes('already registered') ||
            error.status === 422) {
          setError('このメールアドレスは既に他のユーザーに使用されています')
          setLoading(false)
          return
        }
        throw error
      }

      router.push('/settings/email-verification')
    } catch (error) {
      console.error('Email update error:', error)
      setError(error instanceof Error ? error.message : 'メールアドレスの更新に失敗しました')
    } finally {
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

  // メッセージ表示コンポーネント
  const StatusMessage = () => {
    if (!error && !successMessage) return null;
    
    return (
      <Alert className={error ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}>
        {error ? <AlertCircle className="h-4 w-4 text-red-500" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
        <AlertDescription className={error ? "text-red-500" : "text-green-500"}>
          {error || successMessage}
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-2xl font-bold">アカウント設定</CardTitle>
      </CardHeader>

      <CardContent className="py-4 space-y-4">
        <StatusMessage />

        <Accordion type="single" collapsible>
          {/* メールアドレス変更セクション */}
          <AccordionItem value="email">
            <AccordionTrigger className="py-4 flex items-center">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-medium">メールアドレス変更</h3>
                  <p className="text-sm text-gray-500">{currentEmail}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <form onSubmit={handleEmailUpdate} className="space-y-4 pt-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-email">現在のメールアドレス</Label>
                    <Input
                      id="current-email"
                      value={currentEmail}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-email">新しいメールアドレス</Label>
                    <Input
                      id="new-email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="新しいメールアドレスを入力"
                      disabled={loading}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={loading || !newEmail}
                >
                  {loading ? '変更中...' : 'メールアドレスを変更する'}
                </Button>
              </form>
            </AccordionContent>
          </AccordionItem>

          {/* パスワード変更セクション */}
          <AccordionItem value="password">
            <AccordionTrigger className="py-4 flex items-center">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 rounded-full p-2">
                  <Lock className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-medium">パスワード変更</h3>
                  <p className="text-sm text-gray-500">セキュリティのため定期的に変更してください</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4 pt-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">現在のパスワード</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="現在のパスワードを入力"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">新しいパスワード</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="6文字以上"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">新しいパスワード（確認）</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="6文字以上"
                      disabled={loading}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                >
                  {loading ? '変更中...' : 'パスワードを変更する'}
                </Button>
              </form>
            </AccordionContent>
          </AccordionItem>

          {/* 将来の機能のためのプレースホルダー、必要に応じて追加可能 */}
          {/* <AccordionItem value="example">
            <AccordionTrigger className="py-4 flex items-center">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 rounded-full p-2">
                  <Bell className="h-5 w-5 text-amber-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-medium">通知設定</h3>
                  <p className="text-sm text-gray-500">メールや通知の受信設定</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p>将来的に実装予定の機能です</p>
            </AccordionContent>
          </AccordionItem> */}
        </Accordion>
      </CardContent>
    </Card>
  )
}