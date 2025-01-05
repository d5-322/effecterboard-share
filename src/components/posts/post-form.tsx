"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { ImagePlus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'

export function PostForm() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [userType, setUserType] = useState<'guitarist' | 'bassist'>('guitarist')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)

    // プレビュー表示のみ
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedFile) return

    try {
      setLoading(true)

      // 画像のアップロード
      const path = `post-${Date.now()}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('posts')
        .upload(path, selectedFile)

      if (uploadError) throw uploadError

      // 公開URLを取得
      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(uploadData.path)

      // 投稿データの作成
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          description,
        })

      if (postError) throw postError

      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error creating post:', error)
      alert('投稿の作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <h2 className="text-2xl font-bold">新規投稿</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">画像</label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-96 mx-auto" />
              ) : (
                <div className="flex flex-col items-center">
                  <ImagePlus className="h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">クリックして画像を選択</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-input"
              />
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => document.getElementById('image-input')?.click()}
              >
                画像を選択
              </Button>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">説明</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded-md"
              rows={4}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">投稿者タイプ</label>
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
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading || !preview}>
            {loading ? '投稿中...' : '投稿する'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
