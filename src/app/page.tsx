"use client"

import { useState, useEffect, useCallback } from 'react'
import { PostCard } from '@/components/posts/post-card'
import { supabase } from '@/lib/supabase'
import type { Post } from '@/types/post'
import { motion, AnimatePresence } from 'framer-motion'

const ITEMS_PER_PAGE = 9

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

// 元のページネーションを維持
function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getPageNumbers = () => {
    const start = Math.max(1, currentPage - 1)
    const end = Math.min(totalPages, currentPage + 1)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  return (
    <nav className="flex justify-center items-center gap-x-1 mt-8" aria-label="Pagination">
      <button
        type="button"
        className="min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex justify-center items-center gap-x-2 text-sm rounded-lg border border-transparent text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous"
      >
        <svg className="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 18-6-6 6-6" />
        </svg>
        <span className="sr-only">Previous</span>
      </button>

      <div className="flex items-center gap-x-1">
        {getPageNumbers().map(page => (
          <button
            key={page}
            type="button"
            className={`min-h-[38px] min-w-[38px] flex justify-center items-center border text-gray-800 py-2 px-3 text-sm rounded-lg focus:outline-none ${
              page === currentPage 
                ? 'border-gray-200 bg-gray-50' 
                : 'border-transparent hover:bg-gray-100'
            }`}
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex justify-center items-center gap-x-2 text-sm rounded-lg border border-transparent text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next"
      >
        <span className="sr-only">Next</span>
        <svg className="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </nav>
  )
}

// ローディングスピナーコンポーネント
function Spinner() {
  return (
    <div className="flex justify-center items-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  )
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true) // 初回ロード用
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  
  // 投稿取得関数
  const fetchPosts = useCallback(async () => {
    if (initialLoading) {
      // 初回ロードの場合はローディング状態を維持
      setLoading(true)
    } else {
      // 2回目以降は小さいローディング表示のみ
      setLoading(true)
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const query = supabase
        .from('posts')
        .select(`
          *,
          profiles!inner (username),
          likes (user_id)
        `, { count: 'exact' })
        .order('created_at', { ascending: sort === 'oldest' })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('投稿の取得に失敗しました:', error)
        return
      }

      // いいねの数を各投稿に追加
      const postsWithLikes = data.map(post => {
        return {
          ...post,
          username: post.profiles.username,
          likes_count: post.likes ? post.likes.length : 0,
          is_liked: post.likes?.some((like: { user_id: string }) => like.user_id === user?.id) || false
        }
      })

      setPosts(postsWithLikes)
      setTotalCount(count || 0)
    } catch (error) {
      console.error('データ取得中にエラーが発生しました:', error)
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [currentPage, sort, initialLoading])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // 状態を適切に更新するいいね処理関数
  const handleLike = useCallback(async (postId: string, isLiked: boolean) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      // 先に状態を更新（楽観的UI更新）
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                is_liked: !isLiked,
                likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1 
              } 
            : post
        )
      )

      // その後データベースを更新
      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
      } else {
        await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.id })
      }

      // エラーがあった場合のみ再取得（通常はスキップ）
    } catch (error) {
      console.error('いいねの更新に失敗しました:', error)
      // エラー時はデータを再取得して整合性を保つ
      fetchPosts()
    }
  }, [fetchPosts])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  // ソート変更時のハンドラー
  const handleSortChange = (newSort: 'newest' | 'oldest') => {
    setSort(newSort)
    setCurrentPage(1) // ソート変更時は1ページ目に戻す
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {initialLoading ? (
        // 初回ロード時のフルスクリーンローディング
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-blue-600 font-medium">投稿を読み込んでいます...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="text-2xl font-bold text-gray-800">最新の投稿</h1>

            <div className="relative">
              <select 
                value={sort}
                onChange={(e) => handleSortChange(e.target.value as 'newest' | 'oldest')}
                className="appearance-none w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 pl-4 pr-10 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="newest">新しい順</option>
                <option value="oldest">古い順</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          {loading && !initialLoading ? (
            // 2回目以降の小さいローディング表示
            <Spinner />
          ) : (
            <>
              <AnimatePresence>
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {posts.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <PostCard 
                        post={post}
                        onLike={() => handleLike(post.id, post.is_liked)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {posts.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg mt-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">投稿が見つかりません</h3>
                  <p className="mt-1 text-gray-500">投稿がないか、フィルターに一致する投稿がありません。</p>
                </div>
              ) : (
                totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}