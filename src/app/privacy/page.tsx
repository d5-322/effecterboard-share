"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">プライバシーポリシー</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>執筆中です。</p>
        </CardContent>
      </Card>
    </div>
  )
}