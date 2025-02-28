"use client"

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { Post } from '@/types/post'
import Image from 'next/image'
import { useAuth } from '@/contexts/auth-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface PostCardProps {
  post: Post
  onLike: () => void
}

export function PostCard({ post, onLike }: PostCardProps) {
  const router = useRouter()
  const { user } = useAuth()
  
  const handleClick = () => {
    // 認証状態に応じて遷移先を変更
    if (user) {
      router.push(`/posts/${post.id}`)
    } else {
      router.push('/signup')
    }
  }

  // ユーザー名クリックのハンドラ
  const handleUsernameClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (user) {
      router.push(`/profile/${post.user_id}`)
    } else {
      router.push('/signup')
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (['Enter', ' '].includes(e.key)) handleClick()
  }

    // いいねクリックのハンドラ
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (user) {
      onLike()
    } else {
      e.preventDefault()
      router.push('/signup')
    }
  }

  // アバターのイニシャルを取得
  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase();
  }

  // 日付のフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', { 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className="flex flex-col bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary transition overflow-hidden"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {/* ヘッダー - アバター追加 */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={handleUsernameClick}>
          <Avatar className="h-10 w-10 border border-gray-100">
            <AvatarImage 
                src={post.profiles.avatar_url || ''} 
                alt={post.username} 
              />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(post.username)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-gray-800 group-hover:text-primary transition-colors">
            {post.username}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {formatDate(post.created_at)}
        </div>
      </div>

      {/* 画像 */}
      <div className="relative aspect-video bg-gray-50">
        <Image
          src={post.image_url}
          alt={`Post by ${post.username}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={true}
          loading="eager"
        />
      </div>

      {/* フッター - いいねを元の配置に戻す */}
      <div className="p-4 flex items-center justify-between">
        <span className="line-clamp-2 text-sm whitespace-pre-line font-medium text-gray-700">
          {post.description}
        </span>
        
        <Button
          variant="ghost"
          onClick={handleLikeClick}
          className="gap-1.5 hover:bg-red-50"
          aria-label={post.is_liked ? 'Unlike post' : 'Like post'}
        >
          <Heart
            className={`h-5 w-5 ${
              post.is_liked 
                ? 'fill-red-500 text-red-500' 
                : 'text-gray-700'
            }`}
          />
          <span className="text-sm font-medium text-gray-700">
            {post.likes_count}
          </span>
        </Button>
      </div>
    </div>
  )
}