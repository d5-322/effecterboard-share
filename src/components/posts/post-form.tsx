"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { ImagePlus } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function PostForm() {
  const router = useRouter()
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
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
      if (!user) throw new Error('ログインが必要です')

      if (!image) throw new Error('画像を選択してください')

      // 画像のアップロード（ユーザーごとのフォルダ構造）
      const fileExt = image.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}-${Math.random()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('posts')
        .upload(fileName, image)
      
      if (uploadError) throw uploadError

      // 画像URLの取得
      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(fileName)

      // 投稿データの保存
      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          description: description
        })

      if (insertError) throw insertError

      router.push('/')
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : '投稿に失敗しました')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="max-w-2xl mx-auto bg-white border rounded-lg shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-2xl font-bold">新規投稿</h2>
        </div>
        
        {error && (
          <div className="mx-6 mb-4 p-2 text-sm text-red-600 bg-red-50 rounded">
            {error}
          </div>
        )}

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">画像</label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-48 mx-auto" />
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
                required
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
              placeholder="使用機材の情報などを入力"
              rows={4}
              required
            />
          </div>
        </div>

        <div className="px-6 pb-6 pt-4">
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? '投稿中...' : '投稿する'}
          </Button>
        </div>
      </form>
    </div>
  )
}
