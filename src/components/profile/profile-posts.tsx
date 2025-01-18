"use client"

import { useEffect, useState } from 'react'
import { PostCard } from '@/components/posts/post-card'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

type Post = Database['public']['Tables']['posts']['Row']

export function ProfilePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserPosts = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching posts:', error)
        return
      }

      setPosts(data)
      setLoading(false)
    }

    fetchUserPosts()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h3 className="mb-4 text-xl font-semibold">投稿一覧</h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={{...post, profiles: null, likes: null}} />
        ))}
      </div>
      {posts.length === 0 && (
        <p className="text-center text-gray-500">まだ投稿がありません</p>
      )}
    </div>
  )
}
