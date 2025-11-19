'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import {
  HelpCircle,
  MessageSquare,
  Activity,
  Bell,
  User,
  Search,
  Download,
} from 'lucide-react'

export default function HelpPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  const helpSections = [
    {
      icon: MessageSquare,
      title: '会話機能',
      items: [
        '新しい会話を開始するには、「新規会話」ボタンをクリック',
        '医療従事者を選択して会話を開始',
        'メッセージはリアルタイムで送受信されます',
        '自分のメッセージは編集・削除が可能です',
        '検索バーで会話を検索できます',
      ],
    },
    {
      icon: Activity,
      title: '健康データ管理',
      items: [
        '血圧、体重、血糖値、体温などのデータを記録',
        'グラフでデータの推移を確認',
        'データタイプ別にフィルタリング可能',
        'データの編集・削除が可能',
        'CSV/JSON形式でエクスポート可能',
        '検索とソート機能でデータを管理',
      ],
    },
    {
      icon: Bell,
      title: 'リマインダー機能',
      items: [
        '服薬、診察、運動などのリマインダーを作成',
        '日時を設定して通知を受け取れます',
        'リマインダーの編集・削除が可能',
        '完了済みリマインダーを管理',
        '検索機能でリマインダーを検索',
      ],
    },
    {
      icon: User,
      title: 'プロフィール設定',
      items: [
        'サイドバーのユーザー名をクリックしてプロフィールを編集',
        '名前と言語を変更可能',
        '設定ページからもアクセス可能',
      ],
    },
    {
      icon: Search,
      title: '検索機能',
      items: [
        '会話、健康データ、リマインダーで検索可能',
        'リアルタイムでフィルタリング',
        '検索バーのクリアボタンでリセット',
      ],
    },
    {
      icon: Download,
      title: 'データエクスポート',
      items: [
        '健康データをCSV形式でエクスポート',
        '健康データをJSON形式でエクスポート',
        'エクスポートボタンから選択',
      ],
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <HelpCircle className="w-8 h-8 text-primary-600" />
            ヘルプ
          </h1>
          <p className="text-gray-600">ポケさぽの使い方をご案内します</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {helpSections.map((section) => {
            const Icon = section.icon
            return (
              <div
                key={section.title}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                </div>
                <ul className="space-y-2">
                  {section.items.map((item, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-primary-600 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">サポート</h3>
          <p className="text-sm text-gray-600 mb-4">
            ご不明な点がございましたら、お気軽にお問い合わせください。
          </p>
          <div className="text-sm text-gray-600">
            <p>📧 メール: support@poke-sup.example.com</p>
            <p>📞 電話: 0120-XXX-XXX</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

