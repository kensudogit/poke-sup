'use client'

import { useState } from 'react'
import { FileText, Download } from 'lucide-react'
import { toast } from '../common/Toast'

interface HealthData {
  id: number
  data_type: string
  value: number
  unit?: string
  notes?: string
  recorded_at: string
}

interface HealthReportProps {
  healthData: HealthData[]
  startDate?: Date
  endDate?: Date
}

export default function HealthReport({ healthData, startDate, endDate }: HealthReportProps) {
  const [generating, setGenerating] = useState(false)

  const generateReport = async () => {
    if (healthData.length === 0) {
      toast.warning('レポートするデータがありません')
      return
    }

    setGenerating(true)
    try {
      // Filter data by date range if provided
      let filteredData = healthData
      if (startDate && endDate) {
        filteredData = healthData.filter((data) => {
          const date = new Date(data.recorded_at)
          return date >= startDate && date <= endDate
        })
      }

      // Group by data type
      const groupedData: Record<string, HealthData[]> = {}
      filteredData.forEach((data) => {
        if (!groupedData[data.data_type]) {
          groupedData[data.data_type] = []
        }
        groupedData[data.data_type].push(data)
      })

      // Calculate statistics
      const stats: Record<string, any> = {}
      Object.keys(groupedData).forEach((type) => {
        const values = groupedData[type].map((d) => d.value)
        const sum = values.reduce((a, b) => a + b, 0)
        stats[type] = {
          count: values.length,
          average: sum / values.length,
          max: Math.max(...values),
          min: Math.min(...values),
          unit: groupedData[type][0]?.unit || '',
        }
      })

      // Generate HTML report
      const reportDate = new Date().toLocaleDateString('ja-JP')
      const dateRange = startDate && endDate
        ? `${startDate.toLocaleDateString('ja-JP')} - ${endDate.toLocaleDateString('ja-JP')}`
        : '全期間'

      const getDataTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
          blood_pressure: '血圧',
          weight: '体重',
          blood_sugar: '血糖値',
          temperature: '体温',
        }
        return labels[type] || type
      }

      const htmlContent = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>健康データレポート</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 20px;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #0ea5e9;
      padding-bottom: 20px;
    }
    .header h1 {
      color: #0ea5e9;
      margin: 0;
    }
    .info {
      margin-bottom: 20px;
      color: #666;
    }
    .section {
      margin-bottom: 30px;
    }
    .section h2 {
      color: #0ea5e9;
      border-left: 4px solid #0ea5e9;
      padding-left: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f0f9ff;
      color: #0ea5e9;
      font-weight: bold;
    }
    tr:hover {
      background-color: #f9fafb;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    .stat-card {
      background: linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .stat-card h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .stat-card .value {
      font-size: 24px;
      font-weight: bold;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>健康データレポート</h1>
    <div class="info">
      <p>作成日: ${reportDate}</p>
      <p>期間: ${dateRange}</p>
      <p>総データ数: ${filteredData.length}件</p>
    </div>
  </div>

  ${Object.keys(stats).map((type) => `
    <div class="section">
      <h2>${getDataTypeLabel(type)}</h2>
      <div class="stats">
        <div class="stat-card">
          <h3>記録数</h3>
          <div class="value">${stats[type].count}</div>
        </div>
        <div class="stat-card">
          <h3>平均値</h3>
          <div class="value">${stats[type].average.toFixed(1)}${stats[type].unit}</div>
        </div>
        <div class="stat-card">
          <h3>最大値</h3>
          <div class="value">${stats[type].max.toFixed(1)}${stats[type].unit}</div>
        </div>
        <div class="stat-card">
          <h3>最小値</h3>
          <div class="value">${stats[type].min.toFixed(1)}${stats[type].unit}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>日時</th>
            <th>値</th>
            <th>単位</th>
          </tr>
        </thead>
        <tbody>
          ${groupedData[type]
            .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())
            .map(
              (data) => `
            <tr>
              <td>${new Date(data.recorded_at).toLocaleString('ja-JP')}</td>
              <td>${data.value}</td>
              <td>${data.unit || '-'}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `).join('')}

  <div class="footer">
    <p>このレポートはポケさぽシステムにより自動生成されました。</p>
  </div>
</body>
</html>
      `

      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `health_report_${new Date().toISOString().split('T')[0]}.html`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('レポートを生成しました')
    } catch (error) {
      toast.error('レポートの生成に失敗しました')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <button
      onClick={generateReport}
      disabled={generating || healthData.length === 0}
      className="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {generating ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          生成中...
        </>
      ) : (
        <>
          <FileText className="w-4 h-4" />
          レポート生成
        </>
      )}
    </button>
  )
}

