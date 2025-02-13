"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { ImagePlus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
// import type { Database } from '@/types/database.types'

// type Profile = Database['public']['Tables']['profiles']['Row']

export function ProfileEditForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [userType, setUserType] = useState<'guitarist' | 'bassist'>('guitarist')
  const [message, setMessage] = useState('')
  const [avatar, setAvatar] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        setError('プロフィールの取得に失敗しました')
        return
      }

      if (data) {
        setUsername(data.username || '')
        setUserType(data.user_type || 'guitarist')
        setMessage(data.message || '')
        setCurrentAvatarUrl(data.avatar_url)
      }
    }

    fetchProfile()
  }, [])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('ユーザーが見つかりません')

      let avatarUrl = currentAvatarUrl
      if (avatar) {
        // 新しいファイル名の生成（タイムスタンプ付き）
        const fileExt = avatar.name.split('.').pop()
        const timestamp = Date.now()
        const newFileName = `${user.id}/${user.id}_${timestamp}.${fileExt}`

        // 既存の画像を削除（ユーザーIDのフォルダ内のすべてのファイル）
        if (currentAvatarUrl) {
          const { data: files } = await supabase.storage
            .from('avatars')
            .list(user.id)

          if (files && files.length > 0) {
            const filesToRemove = files.map(file => `${user.id}/${file.name}`)
            await supabase.storage
              .from('avatars')
              .remove(filesToRemove)
          }
        }

        // 新しい画像をアップロード
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(newFileName, avatar, {
            contentType: avatar.type
          })
        
        if (uploadError) throw uploadError

        // 新しい公開URLを取得
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(newFileName)
        
        avatarUrl = publicUrl
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username,
          user_type: userType,
          message,
          avatar_url: avatarUrl
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      router.push('/profile')
      router.refresh()
    } catch (error) {
      console.error('Error details:', error)
      setError(error instanceof Error ? error.message : 'プロフィールの更新に失敗しました')
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
        {error && (
          <div className="mx-6 mb-4 p-2 text-sm text-red-600 bg-red-50 rounded">
            {error}
          </div>
        )}
        <CardContent className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium">プロフィール画像</label>
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-24">
                <Image
                  src={preview || currentAvatarUrl || '/images/default-avatar.png'}
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
                画像を変更
              </Button>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">ユーザー名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
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
            {loading ? '保存中...' : '保存する'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
