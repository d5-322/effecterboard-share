"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { AvatarUpload } from './avatar-upload'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'

export function ProfileEditForm() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [userType, setUserType] = useState<'guitarist' | 'bassist'>('guitarist')
  const [message, setMessage] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // プロフィール情報の取得
  const fetchProfile = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return
    }

    if (data) {
      setUsername(data.username)
      setUserType(data.user_type)
      setMessage(data.message || '')
      setAvatarUrl(data.avatar_url)
    }
  }

  // プロフィールの更新
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setLoading(true)

      let newAvatarUrl = avatarUrl

      // 新しい画像がある場合はアップロード
      if (selectedFile) {
        const path = `avatar-${Date.now()}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, selectedFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(uploadData.path)

        newAvatarUrl = publicUrl
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          user_type: userType,
          message,
          avatar_url: newAvatarUrl,
        })
        .eq('id', user.id)

      if (error) throw error

      router.push('/profile')
      router.refresh()
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('プロフィールの更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <h2 className="text-2xl font-bold">プロフィール編集</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium">プロフィール画像</label>
            <AvatarUpload
            currentAvatarUrl={avatarUrl}
            onFileSelect={setSelectedFile}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">ユーザー名</label>
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
            <label className="block mb-2 text-sm font-medium">タイプ</label>
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
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '更新中...' : '保存する'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
