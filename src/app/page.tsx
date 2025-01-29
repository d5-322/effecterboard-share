"use client"

import { useState, useEffect, useCallback } from 'react'
import { PostCard } from '@/components/posts/post-card'
import { supabase } from '@/lib/supabase'
import type { Post } from '@/types/post'

const ITEMS_PER_PAGE = 9

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

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

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    
    let query = supabase
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
      setLoading(false)
      return
    }

    const postsWithLikes = await Promise.all(
      data.map(async (post) => {
        const { count } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id)

        return {
          ...post,
          username: post.profiles.username,
          likes_count: count || 0,
          is_liked: post.likes?.some((like: { user_id: string }) => like.user_id === user?.id) || false
        }
      })
    )

    setPosts(postsWithLikes)
    setTotalCount(count || 0)
    setLoading(false)
  }, [currentPage, sort])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handleLike = useCallback(async (postId: string, isLiked: boolean) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
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
      await fetchPosts()
    } catch (error) {
      console.error('いいねの更新に失敗しました:', error)
    }
  }, [fetchPosts])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">最新の投稿</h1>
        
        <select 
          value={sort}
          onChange={(e) => setSort(e.target.value as 'newest' | 'oldest')}
          className="px-4 py-2 border rounded-lg w-full sm:w-auto"
        >
          <option value="newest">新しい順</option>
          <option value="oldest">古い順</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">読み込み中...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard 
                key={post.id}
                post={post}
                onLike={() => handleLike(post.id, post.is_liked)}
              />
            ))}
          </div>

          {posts.length === 0 ? (
            <p className="text-center text-gray-500 mt-8">投稿が見つかりません</p>
          ) : (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  )
}