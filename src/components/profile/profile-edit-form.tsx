"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { ImagePlus, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'

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
  const [userId, setUserId] = useState<string | null>(null)
  const [isImageHovered, setIsImageHovered] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        setUserId(user.id)

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          throw new Error('プロフィールの取得に失敗しました')
        }

        if (data) {
          setUsername(data.username || '')
          setUserType(data.user_type || 'guitarist')
          setMessage(data.message || '')
          setCurrentAvatarUrl(data.avatar_url)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'プロフィールの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('ファイルサイズは5MB以内にしてください')
        return
      }
      
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
      if (!userId) throw new Error('ユーザーが見つかりません')

      let avatarUrl = currentAvatarUrl
      if (avatar) {
        // 新しいファイル名の生成（タイムスタンプ付き）
        const fileExt = avatar.name.split('.').pop()
        const timestamp = Date.now()
        const newFileName = `${userId}/${userId}_${timestamp}.${fileExt}`

        // 既存の画像を削除（ユーザーIDのフォルダ内のすべてのファイル）
        if (currentAvatarUrl) {
          const { data: files } = await supabase.storage
            .from('avatars')
            .list(userId)

          if (files && files.length > 0) {
            const filesToRemove = files.map(file => `${userId}/${file.name}`)
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
        .eq('id', userId)

      if (updateError) throw updateError

      // URLを変更: /profile → /profile/{userId}
      router.push(`/profile/${userId}`)
      router.refresh()
    } catch (error) {
      console.error('Error details:', error)
      setError(error instanceof Error ? error.message : 'プロフィールの更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !username) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-sm border-gray-100">
      <form onSubmit={handleSubmit}>
        <CardHeader className="border-b pb-4">
          <div className="flex items-center gap-2">
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="mr-2 hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-semibold">プロフィール編集</h2>
          </div>
        </CardHeader>
        
        {error && (
          <div className="px-6 pt-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
        
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col items-center gap-4">
            <div 
              className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-gray-100 transition-all duration-200"
              onMouseEnter={() => setIsImageHovered(true)}
              onMouseLeave={() => setIsImageHovered(false)}
            >
              <Image
                src={preview || currentAvatarUrl || '/images/default-avatar.png'}
                alt="プロフィール画像"
                fill
                className="object-cover"
              />
              <div 
                className={`absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity duration-200 ${
                  isImageHovered ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-white"
                  onClick={() => document.getElementById('avatar-input')?.click()}
                >
                  <ImagePlus className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
              id="avatar-input"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-sm"
              onClick={() => document.getElementById('avatar-input')?.click()}
            >
              画像を変更
            </Button>
            <p className="text-xs text-gray-500">※5MB以内の画像を選択してください</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="username">ユーザー名<span className="text-red-500">*</span></Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ユーザー名を入力してください"
              required
            />
          </div>

          <div className="space-y-3">
            <Label>タイプ</Label>
            <RadioGroup 
              value={userType} 
              onValueChange={(value) => setUserType(value as 'guitarist' | 'bassist')}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="guitarist" id="guitarist" />
                <Label htmlFor="guitarist" className="cursor-pointer">ギタリスト</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bassist" id="bassist" />
                <Label htmlFor="bassist" className="cursor-pointer">ベーシスト</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="message">自己紹介</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="自己紹介を入力してください"
              rows={4}
              className="resize-none"
            />
          </div>
        </CardContent>
        
        <CardFooter className="border-t pt-4">
          <div className="flex gap-3 w-full">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => router.back()}
            >
              キャンセル
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-purple-600 hover:bg-purple-700" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  保存中...
                </span>
              ) : '保存する'}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}