"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Edit } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ProfileHeaderProps {
  userId: string
}

export function ProfileHeader({ userId }: ProfileHeaderProps) {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    getCurrentUser()
  }, [])

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (data) {
        setProfile(data)
      }
      setLoading(false)
    }

    fetchProfile()
  }, [userId])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-6">
            <div className="relative h-24 w-24">
              <Image
                src={profile?.avatar_url || '/images/default-avatar.png'}
                alt={profile?.username || 'Profile'}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{profile?.username}</h2>
              <p className="text-purple-600">{profile?.user_type}</p>
              <p className="mt-2 text-gray-600">{profile?.message}</p>
            </div>
          </div>
          {currentUser && currentUser.id === userId && (
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => router.push('/profile/edit')}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
