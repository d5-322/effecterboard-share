import { PostDetail } from '@/components/posts/PostDetail'

type PageProps = {
  params: {
    id: string
  }
}

export default function PostPage({ params }: PageProps) {
  return <PostDetail id={params.id} />
}