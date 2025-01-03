"use client"

import { Button } from '@/components/ui/button'

type SortType = 'newest' | 'oldest'
type UserType = 'all' | 'guitarist' | 'bassist'

interface PostFilterProps {
  sort: SortType
  userType: UserType
  onSortChange: (sort: SortType) => void
  onUserTypeChange: (type: UserType) => void
}

export function PostFilter({
  sort,
  userType,
  onSortChange,
  onUserTypeChange,
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
      <div className="space-x-2">
        <Button
          variant={userType === 'all' ? 'default' : 'outline'}
          onClick={() => onUserTypeChange('all')}
        >
          すべて
        </Button>
        <Button
          variant={userType === 'guitarist' ? 'default' : 'outline'}
          onClick={() => onUserTypeChange('guitarist')}
        >
          ギタリスト
        </Button>
        <Button
          variant={userType === 'bassist' ? 'default' : 'outline'}
          onClick={() => onUserTypeChange('bassist')}
        >
          ベーシスト
        </Button>
      </div>
    </div>
  )
}
