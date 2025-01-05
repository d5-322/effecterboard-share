"use client"

import { useCallback, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ImagePlus, X } from 'lucide-react'
import { uploadImage, getImageUrl } from '@/lib/storage'

interface PostImageUploadProps {
  onUploadComplete: (url: string) => void
}

export function PostImageUpload({ onUploadComplete }: PostImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      
      // プレビュー表示
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Supabaseにアップロード
      const path = `post-${Date.now()}`
      await uploadImage(file, 'posts', path)
      const publicUrl = getImageUrl('posts', path)
      
      if (publicUrl) {
        onUploadComplete(publicUrl)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('アップロードに失敗しました')
    } finally {
      setIsUploading(false)
    }
  }, [onUploadComplete])

  const clearImage = () => {
    setPreview(null)
    onUploadComplete('')
  }

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative">
          <div className="relative h-64 w-full">
            <Image
              src={preview}
              alt="Post preview"
              fill
              className="rounded-lg object-cover"
            />
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={clearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="post-image-input"
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full h-64"
            disabled={isUploading}
            onClick={() => document.getElementById('post-image-input')?.click()}
          >
            <ImagePlus className="mr-2 h-6 w-6" />
            {isUploading ? 'アップロード中...' : '画像を選択'}
          </Button>
        </>
      )}
    </div>
  )
}
