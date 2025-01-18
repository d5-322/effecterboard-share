"use client"

import { useEffect, useState } from 'react'
import { PostCard } from '@/components/posts/post-card'
import { supabase } from '@/lib/supabase'
import type { Post } from '@/types/post'

interface Like {
  user_id: string
}

export function ProfilePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUserPosts = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles!inner (user_type),
        likes (user_id)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching posts:', error)
      return
    }

    const postsWithLikes = await Promise.all(data.map(async (post) => {
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id)

      return {
        ...post,
        user_type: post.profiles.user_type,
        likes_count: count || 0,
        is_liked: post.likes?.some((like: Like) => like.user_id === user?.id) || false
      }
    }))

    setPosts(postsWithLikes)
    setLoading(false)
  }

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

  useEffect(() => {
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
          <PostCard 
            key={post.id} 
            post={post}
            onLike={() => handleLike(post.id, post.is_liked)}
          />
        ))}
      </div>
      {posts.length === 0 && (
        <p className="text-center text-gray-500">まだ投稿がありません</p>
      )}
    </div>
  )
}
