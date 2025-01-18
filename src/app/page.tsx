"use client"

import { useState, useEffect } from 'react'
import { PostCard } from '@/components/posts/post-card'
import { PostFilter } from '@/components/posts/post-filter'
import { supabase } from '@/lib/supabase'
import type { Post } from '@/types/post'

interface Like {
  user_id: string
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const [userType, setUserType] = useState<'all' | 'guitarist' | 'bassist'>('all')

  useEffect(() => {
    fetchPosts()
  }, [sort])

  const fetchPosts = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    let query = supabase
      .from('posts')
      .select(`
        *,
        profiles!inner (user_type),
        likes (user_id)
      `)
      .order('created_at', { ascending: sort === 'oldest' })

    if (userType !== 'all') {
      query = query.eq('profiles.user_type', userType)
    }

    const { data, error } = await query

    if (error) {
      console.error('投稿の取得に失敗しました:', error)
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
  

  const filteredPosts = posts.filter(post => 
    userType === 'all' || post.user_type === userType
  )

  if (loading) return <div>読み込み中...</div>

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">最新の投稿</h1>
      <PostFilter
        sort={sort}
        userType={userType}
        onSortChange={setSort}
        onUserTypeChange={setUserType}
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPosts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post}
            onLike={() => handleLike(post.id, post.is_liked)}
          />
        ))}
      </div>
      {filteredPosts.length === 0 && (
        <p className="text-center text-gray-500 mt-8">投稿が見つかりません</p>
      )}
    </div>
  )
}
