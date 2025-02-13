import { Suspense } from 'react'
import { PostDetail } from '@/components/posts/PostDetail'

interface PageParams {
  id: string;
}

interface PageProps {
  params: PageParams;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function PostPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <PostDetail id={params.id} />
    </Suspense>
  )
}