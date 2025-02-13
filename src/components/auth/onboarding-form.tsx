"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ImagePlus } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function OnboardingForm() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [userType, setUserType] = useState<'guitarist' | 'bassist'>('guitarist')
  const [message, setMessage] = useState('')
  const [avatar, setAvatar] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true)
  const [isChecking, setIsChecking] = useState(false)

  // ユーザーネームの重複チェック
  const checkUsername = async (username: string) => {
    if (username.length < 3) return
    setIsChecking(true)
    
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single()

    setIsUsernameAvailable(!data)
    setIsChecking(false)
  }

  // ユーザーネーム入力時の処理
  useEffect(() => {
    const timer = setTimeout(() => {
      if (username) {
        checkUsername(username)
      }
    }, 500) // 入力から500ms後にチェック

    return () => clearTimeout(timer)
  }, [username])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatar(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

// handleSubmit関数の該当部分を以下のように修正
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isUsernameAvailable) {
      setError('このユーザーネームは既に使用されています')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('ユーザー情報が見つかりません')

      let avatarUrl = null
      if (avatar) {
        const fileExt = avatar.name.split('.').pop()
        const fileName = `${user.id}.${fileExt}`
        
        // アバター画像のアップロード
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(`${user.id}/${fileName}`, avatar, { 
            upsert: true,
            contentType: avatar.type 
          })
        
        if (uploadError) throw uploadError

        // 公開URLの取得
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(`${user.id}/${fileName}`)
        
        avatarUrl = publicUrl
      }

      // プロフィールの更新
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username,
          user_type: userType,
          message,
          ...(avatarUrl && { avatar_url: avatarUrl })
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error details:', error)
      setError(error instanceof Error ? error.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }


  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <h1 className="text-2xl font-bold text-center">プロフィール設定</h1>
        <p className="text-center text-gray-600">
          あなたのプロフィールを設定しましょう
        </p>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-2 text-sm text-red-600 bg-red-50 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium">プロフィール画像</label>
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-24">
                <Image
                  src={preview || '/images/default-avatar.png'}
                  alt="Profile"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                id="avatar-input"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('avatar-input')?.click()}
              >
                <ImagePlus className="mr-2 h-4 w-4" />
                画像を選択
              </Button>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">ユーザーネーム</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full p-2 border rounded-md ${
                !isUsernameAvailable ? 'border-red-500' : ''
              }`}
              required
              minLength={3}
            />
            {isChecking && (
              <p className="text-sm text-gray-500 mt-1">確認中...</p>
            )}
            {!isUsernameAvailable && !isChecking && (
              <p className="text-sm text-red-500 mt-1">
                このユーザーネームは既に使用されています
              </p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">あなたは？</label>
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

          <div>
            <label className="block mb-2 text-sm font-medium">自己紹介</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border rounded-md"
              rows={4}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !isUsernameAvailable || isChecking}
          >
            {loading ? '設定中...' : 'プロフィールを完成する'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}