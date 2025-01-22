"use client"

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
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
    <Card className="overflow-hidden cursor-pointer"
          onClick={handleClick}>
      <CardHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">{post.username}</div>
          <div className="text-sm text-gray-500">
            {new Date(post.created_at).toLocaleDateString()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="relative aspect-square">
          <Image
            src={post.image_url}
            alt="Effector Board"
            fill
            className="object-cover"
          />
        </div>
      </CardContent>
      <CardFooter className="p-4">
        <div className="flex w-full items-center justify-between">
          <p className="text-sm">{post.description}</p>
          <Button variant="ghost" size="icon"onClick={handleLikeClick}>
            <Heart className={`h-5 w-5 ${post.is_liked ? 'fill-current text-red-500' : ''}`} />
            <span className="ml-1">{post.likes_count}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
