"use client"

import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function EmailVerificationPage() {

  return (
    <Card className="max-w-lg mx-auto mt-8">
      <CardHeader>
        <h2 className="text-2xl font-bold">確認メールを送信しました</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-left space-y-4">
          <p>
            メールアドレス更新の確認メールを送信しました。
            メール内のリンクをクリックして、メールアドレスの更新を完了してください。
          </p>
          <p className="text-sm text-gray-500">
            確認メールが届かない場合は、迷惑メールフォルダもご確認ください。
          </p>
        </div>
      </CardContent>
    </Card>
  )
}