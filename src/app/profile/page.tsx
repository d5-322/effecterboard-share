import { ProfileHeader } from '@/components/profile/profile-header'
import { ProfilePosts } from '@/components/profile/profile-posts'

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <ProfileHeader />
      <ProfilePosts />
    </div>
  )
}
