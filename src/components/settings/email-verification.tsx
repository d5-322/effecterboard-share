// オプション改善例（アイコンと再送信ボタンを追加）
"use client"

import { EnvelopeOpenIcon } from '@radix-ui/react-icons'

export function EmailVerificationPage() {
  return (
    <div className="max-w-lg mx-auto mt-8 bg-white border rounded-lg shadow-sm">
      <div className="px-6 py-6 space-y-6 text-center">
        <div className="flex justify-center">
          <EnvelopeOpenIcon className="h-16 w-16 text-purple-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800">
          確認メールを送信しました
        </h2>
        
        <div className="space-y-4 text-left">
          <p className="text-gray-600 leading-relaxed">
            メールアドレス更新の確認メールを送信しました。
            メール内のリンクをクリックして更新を完了してください。
          </p>
          
          <p className="text-sm text-gray-500">
            ※ メールが届かない場合は迷惑メールフォルダもご確認ください
          </p>
        </div>
      </div>
    </div>
  )
}