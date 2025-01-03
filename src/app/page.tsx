"use client"

import { useState } from 'react'
import { PostCard } from '@/components/posts/post-card'
import { PostFilter } from '@/components/posts/post-filter'

const MOCK_POSTS = [
  {
    id: '1',
    user_id: 'user1',
    image_url: '/images/sample-board-1.jpg',
    description: 'My favorite setup for blues',
    user_type: 'guitarist',
    created_at: '2024-01-20T12:00:00Z',
    likes_count: 42
  },
  {
    id: '2',
    user_id: 'user2',
    image_url: '/images/sample-board-2.jpg',
    description: 'Bass effects chain',
    user_type: 'bassist',
    created_at: '2024-01-19T15:30:00Z',
    likes_count: 35
  }
] as const

export default function Home() {
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const [userType, setUserType] = useState<'all' | 'guitarist' | 'bassist'>('all')

  const filteredPosts = MOCK_POSTS
    .filter(post => userType === 'all' || post.user_type === userType)
    .sort((a, b) => {
      if (sort === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    })

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
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
