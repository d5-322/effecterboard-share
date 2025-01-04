"use client"

import { useCallback, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ImagePlus } from 'lucide-react'

interface AvatarUploadProps {
  currentAvatarUrl: string | null
  onFileSelect: (file: File) => void
}

export function AvatarUpload({ currentAvatarUrl, onFileSelect }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // プレビュー表示
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // 親コンポーネントにファイルを渡す
    onFileSelect(file)
  }, [onFileSelect])

  return (
    <div>
      <div className="relative h-24 w-24 mb-4">
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
        onChange={handleFileChange}
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
  )
}
