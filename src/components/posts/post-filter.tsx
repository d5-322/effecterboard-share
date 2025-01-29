"use client"

import { Button } from '@/components/ui/button'

type SortType = 'newest' | 'oldest'

interface PostFilterProps {
  sort: SortType
  onSortChange: (sort: SortType) => void
}

export function PostFilter({
  sort,
  onSortChange,
}: PostFilterProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="space-x-2">
        <Button
          variant={sort === 'newest' ? 'default' : 'outline'}
          onClick={() => onSortChange('newest')}
        >
          新しい順
        </Button>
        <Button
          variant={sort === 'oldest' ? 'default' : 'outline'}
          onClick={() => onSortChange('oldest')}
        >
          古い順
        </Button>
      </div>
    </div>
  )
}