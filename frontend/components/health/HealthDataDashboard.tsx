'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Activity, Plus } from 'lucide-react'
import HealthDataForm from './HealthDataForm'
import HealthDataItem from './HealthDataItem'
import SearchBar from '../common/SearchBar'
import ExportButton from './ExportButton'
import Pagination from '../common/Pagination'
import SortSelect from '../common/SortSelect'
import HealthStats from './HealthStats'
import DataComparison from './DataComparison'
import HealthReport from './HealthReport'
import ChartOptions from './ChartOptions'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface HealthData {
  id: number
  data_type: string
  value: number
  unit?: string
  notes?: string
  recorded_at: string
}

export default function HealthDataDashboard() {
  const [healthData, setHealthData] = useState<HealthData[]>([])
  const [filteredHealthData, setFilteredHealthData] = useState<HealthData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('recorded_at_desc')
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line')
  const itemsPerPage = 10

  useEffect(() => {
    fetchHealthData()
  }, [selectedType])

  useEffect(() => {
    let filtered = healthData

    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(
        (data) =>
          data.data_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          data.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort data
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'recorded_at_desc':
          return new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
        case 'recorded_at_asc':
          return new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
        case 'value_desc':
          return b.value - a.value
        case 'value_asc':
          return a.value - b.value
        default:
          return 0
      }
    })

    setFilteredHealthData(filtered)
    setCurrentPage(1) // Reset to first page when filtering
  }, [searchQuery, healthData, sortBy])

  const fetchHealthData = async () => {
    try {
      const params = selectedType !== 'all' ? { data_type: selectedType } : {}
      const response = await api.get('/health-data', { params })
      setHealthData(response.data)
      setFilteredHealthData(response.data)
    } catch (error) {
      console.error('Failed to fetch health data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const dataTypes = [
    { value: 'all', label: 'すべて' },
    { value: 'blood_pressure', label: '血圧' },
    { value: 'weight', label: '体重' },
    { value: 'blood_sugar', label: '血糖値' },
    { value: 'temperature', label: '体温' },
  ]

  // Group data by type for chart
  const chartData = filteredHealthData.reduce((acc, item) => {
    const date = new Date(item.recorded_at).toLocaleDateString('ja-JP')
    if (!acc[date]) {
      acc[date] = {}
    }
    acc[date][item.data_type] = item.value
    acc[date].date = date
    return acc
  }, {} as Record<string, any>)

  const chartDataArray = Object.values(chartData).reverse()

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary-600" />
          健康データ
        </h2>
        <div className="flex items-center gap-2">
          {healthData.length > 0 && (
            <>
              <ExportButton healthData={healthData} />
              <HealthReport healthData={healthData} />
            </>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            データを追加
          </button>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex gap-2 flex-wrap">
          {dataTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedType === type.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="flex-1">
            <SearchBar
              placeholder="データを検索..."
              onSearch={handleSearch}
            />
          </div>
          <SortSelect
            options={[
              { value: 'recorded_at_desc', label: '記録日時（新しい順）' },
              { value: 'recorded_at_asc', label: '記録日時（古い順）' },
              { value: 'value_desc', label: '値（大きい順）' },
              { value: 'value_asc', label: '値（小さい順）' },
            ]}
            value={sortBy}
            onChange={setSortBy}
            className="w-full sm:w-48"
          />
        </div>
      </div>

      {filteredHealthData.length === 0 && healthData.length > 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>検索結果が見つかりません</p>
        </div>
      ) : filteredHealthData.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>健康データがありません</p>
          <p className="text-sm">データを追加して健康状態を記録しましょう</p>
        </div>
      ) : (
        <>
          {selectedType !== 'all' && (
            <div className="mb-6 space-y-4">
              <HealthStats data={healthData} dataType={selectedType} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DataComparison data={healthData} dataType={selectedType} period="week" />
                <DataComparison data={healthData} dataType={selectedType} period="month" />
                <DataComparison data={healthData} dataType={selectedType} period="year" />
              </div>
            </div>
          )}
          <div className="mb-4">
            <ChartOptions chartType={chartType} onChartTypeChange={setChartType} />
          </div>
          <div className="h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={chartDataArray}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="blood_pressure"
                    stroke="#0ea5e9"
                    name="血圧"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#d946ef"
                    name="体重"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="blood_sugar"
                    stroke="#10b981"
                    name="血糖値"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#f59e0b"
                    name="体温"
                    strokeWidth={2}
                  />
                </LineChart>
              ) : chartType === 'bar' ? (
                <BarChart data={chartDataArray}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="blood_pressure" fill="#0ea5e9" name="血圧" />
                  <Bar dataKey="weight" fill="#d946ef" name="体重" />
                  <Bar dataKey="blood_sugar" fill="#10b981" name="血糖値" />
                  <Bar dataKey="temperature" fill="#f59e0b" name="体温" />
                </BarChart>
              ) : (
                <AreaChart data={chartDataArray}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="blood_pressure"
                    stroke="#0ea5e9"
                    fill="#0ea5e9"
                    fillOpacity={0.6}
                    name="血圧"
                  />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="#d946ef"
                    fill="#d946ef"
                    fillOpacity={0.6}
                    name="体重"
                  />
                  <Area
                    type="monotone"
                    dataKey="blood_sugar"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="血糖値"
                  />
                  <Area
                    type="monotone"
                    dataKey="temperature"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.6}
                    name="体温"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              データ一覧 ({filteredHealthData.length}件)
            </h3>
            {filteredHealthData
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((item) => (
                <HealthDataItem key={item.id} data={item} onUpdate={fetchHealthData} />
              ))}
            {filteredHealthData.length > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredHealthData.length / itemsPerPage)}
                onPageChange={setCurrentPage}
                className="mt-6"
              />
            )}
          </div>
        </>
      )}

      {showForm && (
        <HealthDataForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            fetchHealthData()
            setShowForm(false)
          }}
        />
      )}
    </div>
  )
}

