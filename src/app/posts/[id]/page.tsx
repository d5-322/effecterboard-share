"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Heart, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import type { Post } from '@/types/post'

export default function PostDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (username, user_type),
          likes (user_id)
        `)
        .eq('id', params.id)
        .single()

      if (error) {
        console.error('投稿の取得に失敗しました:', error)
        router.push('/')
        return
      }

      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', params.id)

      setPost({
        ...data,
        user_type: data.profiles.user_type,
        username: data.profiles.username,
        likes_count: count || 0,
        is_liked: data.likes?.some((like: { user_id: string }) => like.user_id === user?.id) || false
      })
      setIsOwner(user?.id === data.user_id)
      setLoading(false)
    }

    fetchPost()
  }, [params.id, router])

  const handleLike = async () => {
    // 既存のいいね処理
  }

  const handleDelete = async () => {
    if (!post || !window.confirm('この投稿を削除してもよろしいですか？')) return

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', post.id)

    if (error) {
      console.error('削除に失敗しました:', error)
      return
    }

    router.push('/')
    router.refresh()
  }

  if (loading) return <div>読み込み中...</div>
  if (!post) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative aspect-video">
            <Image
              src={post.image_url}
              alt="Effector Board"
              fill
              className="object-cover"
            />
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-medium">{post.username}</div>
                <div className="text-sm text-gray-500">
                  {new Date(post.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-2">
                {isOwner && (
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={handleLike}>
                  <Heart className={`h-5 w-5 ${post.is_liked ? 'fill-current text-red-500' : ''}`} />
                  <span className="ml-1">{post.likes_count}</span>
                </Button>
              </div>
            </div>
            <p className="text-gray-700 break-words">{post.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
