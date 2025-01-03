"use client"

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { ImagePlus } from 'lucide-react'
import type { User } from '@/types/user'

const MOCK_USER: User = {
  id: '1',
  email: 'user@example.com',
  username: 'Guitar Hero',
  userType: 'guitarist',
  avatar_url: '/images/default-avatar.png',
  message: 'ブルースギター愛好家です！'
}

export function ProfileEditForm() {
  const [username, setUsername] = useState(MOCK_USER.username)
  const [userType, setUserType] = useState(MOCK_USER.userType)
  const [message, setMessage] = useState(MOCK_USER.message || '')
  const [avatar, setAvatar] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

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
    // TODO: Supabaseとの連携
    console.log({ username, userType, message, avatar })
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
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-24">
                <Image
                  src={preview || MOCK_USER.avatar_url}
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
          <Button type="submit" className="w-full">
            保存する
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
