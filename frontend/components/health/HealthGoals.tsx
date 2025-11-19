'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Target, Plus, CheckCircle, XCircle, TrendingUp } from 'lucide-react'
import HealthGoalForm from './HealthGoalForm'

interface HealthGoal {
  id: number
  data_type: string
  target_value: number
  current_value?: number
  unit?: string
  deadline?: string
  is_achieved: boolean
  progress?: number
}

export default function HealthGoals() {
  const [goals, setGoals] = useState<HealthGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const response = await api.get('/health-goals')
      const goalsWithProgress = response.data.map((goal: HealthGoal) => {
        const progress = goal.current_value && goal.target_value
          ? Math.min((goal.current_value / goal.target_value) * 100, 100)
          : 0
        return { ...goal, progress }
      })
      setGoals(goalsWithProgress)
    } catch (error) {
      console.error('Failed to fetch goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDataTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      blood_pressure: '血圧',
      weight: '体重',
      blood_sugar: '血糖値',
      temperature: '体温',
    }
    return labels[type] || type
  }

  if (loading) {
    return <div className="animate-pulse">読み込み中...</div>
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Target className="w-6 h-6 text-primary-600" />
          健康目標
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          目標を追加
        </button>
      </div>

      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>健康目標がありません</p>
            <p className="text-sm">目標を設定して健康管理を始めましょう</p>
          </div>
        ) : (
          goals.map((goal) => (
            <div
              key={goal.id}
              className={`p-4 border rounded-lg ${
                goal.is_achieved
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getDataTypeLabel(goal.data_type)}
                    </h3>
                    {goal.is_achieved ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      目標: {goal.target_value}
                      {goal.unit && <span className="ml-1">{goal.unit}</span>}
                    </span>
                    {goal.current_value !== undefined && (
                      <span>
                        現在: {goal.current_value}
                        {goal.unit && <span className="ml-1">{goal.unit}</span>}
                      </span>
                    )}
                  </div>
                  {goal.deadline && (
                    <p className="text-xs text-gray-500 mt-1">
                      期限: {new Date(goal.deadline).toLocaleDateString('ja-JP')}
                    </p>
                  )}
                </div>
              </div>

              {goal.current_value !== undefined && goal.target_value && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>進捗</span>
                    <span>{goal.progress?.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        goal.is_achieved ? 'bg-green-500' : 'bg-primary-600'
                      }`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showForm && (
        <HealthGoalForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            fetchGoals()
            setShowForm(false)
          }}
        />
      )}
    </div>
  )
}

