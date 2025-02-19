"use client"

import { ProfileHeader } from '@/components/profile/profile-header'
import { ProfilePosts } from '@/components/profile/profile-posts'
import { useParams } from 'next/navigation'

export default function ProfilePage() {
  const params = useParams()
  const userId = String(params.userId || params.id)

  return (
    <div className="space-y-8">
      <ProfileHeader userId={userId} />
      <ProfilePosts userId={userId} />
    </div>
  )
}
