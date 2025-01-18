"use client"

import { useState, useEffect } from 'react'
import { PostCard } from '@/components/posts/post-card'
import { PostFilter } from '@/components/posts/post-filter'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

type Post = Database['public']['Tables']['posts']['Row'] & {
  profiles: {
    user_type: string
  } | null,
  likes_count: number  // 変更
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const [userType, setUserType] = useState<'all' | 'guitarist' | 'bassist'>('all')

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (user_type),
          likes_count:likes(count)
        `)
        .order('created_at', { ascending: sort === 'oldest' })

      if (error) {
        console.error('投稿の取得に失敗しました:', error)
        return
      }

      // likes_countを数値として処理
      const postsWithLikes = data.map(post => ({
        ...post,
        likes_count: post.likes_count?.count || 0
      }))

      setPosts(postsWithLikes)
      setLoading(false)
    }

    fetchPosts()
  }, [sort])

  const filteredPosts = posts.filter(post => 
    userType === 'all' || post.profiles?.user_type === userType
  )

  if (loading) {
    return <div>読み込み中...</div>
  }

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
          <PostCard key={post.id} post={{...post, likes: post.likes_count}} />
        ))}
      </div>
      {filteredPosts.length === 0 && (
        <p className="text-center text-gray-500 mt-8">投稿が見つかりません</p>
      )}
    </div>
  )
}
