"use client"

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Edit } from 'lucide-react'
import type { User } from '@/types/user'

const MOCK_USER: User = {
  id: '1',
  email: 'user@example.com',
  username: 'Guitar Hero',
  userType: 'guitarist',
  avatar_url: '/images/default-avatar.png',
  message: 'ブルースギター愛好家です！'
}

export function ProfileHeader() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-6">
            <div className="relative h-24 w-24">
              <Image
                src={MOCK_USER.avatar_url}
                alt={MOCK_USER.username}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{MOCK_USER.username}</h2>
              <p className="text-purple-600">{MOCK_USER.userType}</p>
              <p className="mt-2 text-gray-600">{MOCK_USER.message}</p>
            </div>
          </div>
          <Button variant="outline" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
