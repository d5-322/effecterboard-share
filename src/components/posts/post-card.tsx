"use client"

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { Post } from '@/types/post'

interface PostCardProps {
  post: Post
  onLike: () => void
}

export function PostCard({ post, onLike }: PostCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/posts/${post.id}`)
  }

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onLike()
  }

  return (
    <div
      className="flex flex-col bg-white border shadow-sm rounded-xl hover:shadow-lg focus:outline-none focus:shadow-lg transition overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      {/* カードヘッダー: 投稿者名と日付 */}
      <div className="flex items-center justify-between p-4">
        <div className="text-sm font-medium text-gray-700">{post.username}</div>
        {/* リーダーボタン */}
        
      </div>

      {/* カード画像 */}
      <div className="relative">
        <img
          className="w-full h-48 object-cover bg-gray-100"
          src={post.image_url}
          alt="Card Image"
        />
      </div>

      {/* カード内容 */}
      <div className="p-3 md:p-4 flex items-center justify-between">
        {/* 投稿の詳細 */}
        <div className="text-sm text-gray-500">
          {new Date(post.created_at).toLocaleDateString()}
        </div>
        {/* いいねボタン */}
        <div className="ml-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLikeClick}
          >
            <Heart
              className={`h-5 w-5 ${post.is_liked ? 'fill-current text-red-500' : ''}`}
            />
            <span className="ml-1 text-sm text-gray-700">{post.likes_count}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
