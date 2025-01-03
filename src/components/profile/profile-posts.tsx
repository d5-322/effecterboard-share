"use client"

import { PostCard } from '@/components/posts/post-card'

// 仮のデータ
const MOCK_POSTS = [
  {
    id: '1',
    user_id: 'user1',
    image_url: '/images/sample-board-1.jpg',
    description: 'My favorite setup for blues',
    user_type: 'guitarist',
    created_at: '2024-01-20T12:00:00Z',
    likes_count: 42
  }
]

export function ProfilePosts() {
  return (
    <div>
      <h3 className="mb-4 text-xl font-semibold">投稿一覧</h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_POSTS.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
