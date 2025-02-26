"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Heart, Trash2, ArrowLeft, Share2, BookmarkPlus } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

type Post = {
  id: string
  user_id: string
  image_url: string
  description: string
  created_at: string
  username: string
  user_type: string
  likes_count: number
  is_liked: boolean
  user_avatar?: string
}

export default function PostDetail() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchPost()
  }, [params.id])

  const fetchPost = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (username, user_type, avatar_url),
          likes (user_id)
        `)
        .eq('id', params.id)
        .single()

      if (error) {
        toast.error("投稿の取得に失敗しました", {
          description: "ページを再読み込みするか、しばらく経ってからお試しください。"
        })
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
        user_avatar: data.profiles.avatar_url,
        likes_count: count || 0,
        is_liked: data.likes?.some((like: { user_id: string }) => like.user_id === user?.id) || false
      })
    } catch (err) {
      console.error('投稿取得エラー:', err)
      toast.error("予期せぬエラーが発生しました", {
        description: "ネットワーク接続を確認してください。"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!post) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.info("ログインが必要です", {
        description: "いいねするにはログインしてください。",
        action: {
          label: "ログイン",
          onClick: () => router.push('/auth')
        }
      })
      return
    }

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
      console.error('いいね更新エラー:', error)
      toast.error("いいねの更新に失敗しました", {
        description: "ネットワーク接続を確認してください。"
      })
    }
  }

  const handleDelete = async () => {
    if (!post || !currentUserId || post.user_id !== currentUserId) return
  
    try {
      toast.loading("投稿を削除中...", { id: "delete-post" })
      
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
      
      toast.success("投稿が削除されました", { id: "delete-post" })
      router.push('/')
    } catch (error) {
      console.error('削除エラー:', error)
      toast.error("投稿の削除に失敗しました", {
        id: "delete-post",
        description: "ネットワーク接続を確認してください。"
      })
    }
  }

  const handleShare = () => {
    if (navigator.share && typeof navigator.share === 'function') {
      navigator.share({
        title: `${post?.username}の投稿`,
        text: post?.description?.substring(0, 50) + '...',
        url: window.location.href,
      })
      .then(() => toast.success("シェアしました"))
      .catch((error) => {
        console.error('シェアエラー:', error)
        toast.error("シェアに失敗しました")
      })
    } else {
      // シェアAPIが利用できない場合はURLをクリップボードにコピー
      navigator.clipboard.writeText(window.location.href)
        .then(() => toast.success("URLをコピーしました"))
        .catch(() => toast.error("URLのコピーに失敗しました"))
    }
  }

  const handleBookmark = () => {
    toast.info("ブックマーク機能は準備中です", {
      description: "近日公開予定の機能です。"
    })
  }

  if (loading) return <LoadingState />
  if (!post) return null

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {/* ヘッダー部分 */}
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full" 
              onClick={() => router.back()}
              aria-label="戻る"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">投稿詳細</h1>
            <div className="w-10"></div> {/* バランス用の空白 */}
          </div>

          {/* 投稿カード */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            {/* ユーザー情報 */}
            <div className="p-4 flex items-center justify-between border-b">
              <div 
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => router.push(`/profile/${post.user_id}`)}
                role="button"
                aria-label={`${post.username}のプロフィールを表示`}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.user_avatar || undefined} alt={`${post.username}のアバター`} />
                  <AvatarFallback>{post.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center">
                    <span className="font-medium">{post.username}</span>
                    {post.user_type && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {post.user_type}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(post.created_at).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* 投稿管理アクション */}
              {currentUserId === post.user_id && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                      <Trash2 className="h-4 w-4 mr-1" />
                      <span>削除</span>
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

            {/* 画像 */}
            <div className="relative aspect-[4/3] sm:aspect-[16/9]">
              <Image
                src={post.image_url}
                alt={`${post.username}さんの投稿画像`}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* アクションボタン */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLike}
                  className={`${post.is_liked ? 'text-red-500' : 'text-gray-700'} flex items-center`}
                  aria-label={post.is_liked ? "いいねを取り消す" : "いいねする"}
                  aria-pressed={post.is_liked}
                >
                  <Heart className={`h-5 w-5 mr-1.5 ${post.is_liked ? 'fill-current text-red-500' : ''}`} />
                  <span>{post.likes_count}</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-700"
                  onClick={handleShare}
                  aria-label="投稿をシェアする"
                >
                  <Share2 className="h-5 w-5 mr-1.5" />
                  <span>シェア</span>
                </Button>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-700"
                onClick={handleBookmark}
                aria-label="投稿をブックマークする"
              >
                <BookmarkPlus className="h-5 w-5" />
              </Button>
            </div>

            {/* 投稿内容 */}
            <div className="p-4">
              <p className="text-gray-800 break-words whitespace-pre-line leading-relaxed">
                {post.description}
              </p>
            </div>
          </div>

          {/* コメント機能などの追加はここに */}
        </div>
      </div>
    </div>
  )
}

// ローディング状態コンポーネント
function LoadingState() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10"></div>
            <h1 className="text-xl font-semibold">読み込み中...</h1>
            <div className="w-10"></div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="p-4 flex items-center space-x-3 border-b">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-40 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            
            <Skeleton className="h-64 w-full" />
            
            <div className="p-4 flex justify-between">
              <div className="flex space-x-4">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
            
            <div className="p-4">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}