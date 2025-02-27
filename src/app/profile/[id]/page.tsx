"use client"

import { ProfileContents } from '@/components/profile/profile-contents'
import { useParams } from 'next/navigation'

export default function ProfilePage() {
  const params = useParams()
  const userId = String(params.userId || params.id)

  return (
    <div className="space-y-8">
      <ProfileContents userId={userId} />
    </div>
  )
}
