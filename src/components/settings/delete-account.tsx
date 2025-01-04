"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function DeleteAccount() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [password, setPassword] = useState('')

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Supabaseとの連携
    console.log('Account deletion requested')
  }

  return (
    <Card className="border-red-200">
      <CardHeader>
        <h2 className="text-2xl font-bold text-red-600">アカウント削除</h2>
      </CardHeader>
      <CardContent>
        {!isConfirmOpen ? (
          <div>
            <p className="mb-4 text-gray-600">
              アカウントを削除すると、すべてのデータが完全に削除され、復元することはできません。
            </p>
            <Button
              variant="destructive"
              onClick={() => setIsConfirmOpen(true)}
            >
              アカウントを削除する
            </Button>
          </div>
        ) : (
          <form onSubmit={handleDelete} className="space-y-4">
            <p className="text-red-600 font-semibold">
              本当にアカウントを削除しますか？
            </p>
            <div>
              <label className="block mb-2 text-sm">パスワードを入力して確認</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsConfirmOpen(false)}
              >
                キャンセル
              </Button>
              <Button type="submit" variant="destructive">
                削除する
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
