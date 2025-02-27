"use client"

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Edit, User as UserIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PostCard } from '@/components/posts/post-card'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import type { Post } from '@/types/post'

// ローディングスピナーコンポーネント
function Spinner() {
  return (
    <div className="flex justify-center items-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
    </div>
  )
}

type Profile = Database['public']['Tables']['profiles']['Row']
interface Like {
  user_id: string
}

interface ProfileProps {
  userId: string
}

export function ProfileContents({ userId }: ProfileProps) {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [imageError, setImageError] = useState(false)

  // 現在のユーザー情報を取得
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    getCurrentUser()
  }, [])

  // データ取得関数
  const fetchData = useCallback(async () => {
    if (!userId) return
    
    try {
      // プロフィール情報の取得
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
  
      if (profileError) {
        console.error('Error fetching profile:', profileError)
        throw profileError
      }
      
      // 現在のユーザー情報を取得
      const { data: { user } } = await supabase.auth.getUser()
  
      // 投稿情報の取得
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!inner (user_type, username),
          likes (user_id)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
  
      if (postsError) {
        console.error('Posts fetch error:', postsError.message)
        throw postsError
      }
  
      // 各投稿のいいね数を取得
      const postsWithLikes = await Promise.all(postsData.map(async (post) => {
        const { count } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id)
  
        return {
          ...post,
          user_type: post.profiles.user_type,
          username: post.profiles.username,
          likes_count: count || 0,
          is_liked: post.likes?.some((like: Like) => like.user_id === user?.id) || false
        }
      }))
  
      setProfile(profileData)
      setPosts(postsWithLikes)
    } catch (error) {
      console.error('データ取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // いいね処理
  const handleLike = async (postId: string, isLiked: boolean) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
        
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, is_liked: false, likes_count: post.likes_count - 1 }
            : post
        ))
      } else {
        await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: user.id
          })
        
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, is_liked: true, likes_count: post.likes_count + 1 }
            : post
        ))
      }
    } catch (error) {
      console.error('いいねの更新に失敗しました:', error)
    }
  }

  if (loading) {
    return (
      <div className="w-full space-y-4">
        <Card className="w-full shadow-sm border border-gray-100">
          <CardContent className="p-8 flex justify-center items-center">
            <Spinner />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Profile Header */}
      <Card className="w-full shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <div className="flex flex-col items-center md:items-start md:flex-row md:justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-gray-100">
                {imageError ? (
                  <div className="h-full w-full rounded-full bg-gray-100 flex items-center justify-center">
                    <UserIcon className="h-12 w-12 text-gray-400" />
                  </div>
                ) : (
                  <Image
                    src={profile?.avatar_url || '/images/default-avatar.png'}
                    alt={profile?.username || 'Profile'}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                )}
              </div>
              <div className="flex flex-col items-center md:items-start">
                <h2 className="text-2xl font-bold">{profile?.username || 'ユーザー名なし'}</h2>
                {profile?.user_type && (
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                    {profile.user_type}
                  </div>
                )}
                {profile?.message && (
                  <p className="mt-2 text-gray-600 text-center md:text-left max-w-md">{profile.message}</p>
                )}
              </div>
            </div>
            {currentUser && currentUser.id === userId && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/profile/edit')}
                className="group hover:bg-purple-50 transition-colors duration-200 mt-2 md:mt-0"
              >
                <Edit className="h-4 w-4 mr-2 group-hover:text-purple-600" />
                プロフィールを編集
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Posts */}
      <div className="w-full">
        <h3 className="mb-4 text-xl font-semibold">投稿一覧</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post}
              onLike={() => handleLike(post.id, post.is_liked)}
            />
          ))}
        </div>
        {posts.length === 0 && (
          <Card className="w-full p-12 flex justify-center items-center border border-gray-100">
            <p className="text-center text-gray-500">まだ投稿がありません</p>
          </Card>
        )}
      </div>
    </div>
  )
}