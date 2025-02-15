"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { Heart, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { supabase } from '@/lib/supabase'
import type { Post } from '@/types/post'

export default function PostDetail() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
      
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
      setLoading(false)
    }

    fetchPost()
  }, [params.id, router])

  // いいね機能
  const handleLike = async () => {
    if (!post) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      if (post.is_liked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id)
        
        setPost({
          ...post,
          is_liked: false,
          likes_count: post.likes_count - 1
        })
      } else {
        await supabase
          .from('likes')
          .insert({
            post_id: post.id,
            user_id: user.id
          })
        
        setPost({
          ...post,
          is_liked: true,
          likes_count: post.likes_count + 1
        })
      }
    } catch (error) {
      console.error('いいねの更新に失敗しました:', error)
    }
  }

  // 投稿削除
  const handleDelete = async () => {
    if (!post || !currentUserId || post.user_id !== currentUserId) return
  
    try {
      // 1. まず画像をストレージから削除
      const imageUrl = post.image_url
      const filePath = imageUrl.split('/posts/')[1]
      
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('posts')
          .remove([filePath])
  
        if (storageError) {
          throw new Error('画像の削除に失敗しました')
        }
      }
  
      // 2. DBから投稿を削除
      const { error: dbError } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id)
  
      if (dbError) {
        throw new Error('投稿の削除に失敗しました')
      }
  
      router.push('/')
    } catch (error) {
      console.error('削除処理に失敗しました:', error)
    }
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
                <div className="text-gray-700 font-medium">{post.username}</div>
                <div className="text-sm text-gray-500">
                  {new Date(post.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleLike}>
                  <Heart className={`h-5 w-5 ${post.is_liked ? 'fill-current text-red-500' : ''}`} />
                  <span className="ml-1">{post.likes_count}</span>
                </Button>
                {currentUserId === post.user_id && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-5 w-5 text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>投稿を削除しますか？</AlertDialogTitle>
                        <AlertDialogDescription>
                          この操作は取り消せません。投稿と画像が完全に削除されます。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                          削除する
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
            <p className="text-gray-700 break-words whitespace-pre-line">{post.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}