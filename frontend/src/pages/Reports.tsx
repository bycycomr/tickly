import React, { useEffect, useState } from 'react'
import { BarChart3, TrendingUp, Download, Calendar } from 'lucide-react'
import api from '../lib/api'
import { DashboardStats } from '../lib/types'

export default function Reports() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  async function loadStats() {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getDashboardStats()
      setStats(data)
    } catch (e: any) {
      console.error(e)
      setError(e?.response?.data?.error || 'İstatistikler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  async function handleExport() {
    try {
      const blob = await api.exportTicketsCSV()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tickly-report-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (e: any) {
      console.error(e)
      alert(e?.response?.data?.error || 'Rapor dışa aktarılamadı')
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden py-8">
      {/* Animated blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative space-y-6 max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between glass bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/50 p-6 animate-slide-up">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl hover:scale-110 hover:rotate-6 transition-all duration-300">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Raporlar</h1>
          </div>
        </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-white/50 p-6 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Toplam Talep</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{stats?.total || stats?.totalTickets || 0}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="glass bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-white/50 p-6 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Açık Talepler</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                {stats?.openTickets || 0}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="glass bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-white/50 p-6 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Tamamlanan</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {stats?.closedTickets || 0}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="glass bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-white/50 p-6 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold">SLA Uyum</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {stats?.slaComplianceRate ? `${(stats.slaComplianceRate * 100).toFixed(0)}%` : 'N/A'}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <Calendar className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-white/50 p-6 animate-slide-up">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Durum Dağılımı</h2>
          <div className="space-y-3">
            {stats?.byStatus && (Array.isArray(stats.byStatus) 
              ? stats.byStatus.map((item: any) => {
                  const status = item.status;
                  const count = item.count || 0;
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{status}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-600"
                            style={{ width: `${(count / (stats?.total || stats?.totalTickets || 1)) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                      </div>
                    </div>
                  );
                })
              : Object.entries(stats.byStatus).map(([key, value]) => {
                  const count = typeof value === 'number' ? value : (value as any).count || 0;
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{key}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-600"
                            style={{ width: `${(count / (stats?.total || stats?.totalTickets || 1)) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        <div className="glass bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-white/50 p-6 animate-slide-up">
          <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">Öncelik Dağılımı</h2>
          <div className="space-y-3">
            {stats?.byPriority && (Array.isArray(stats.byPriority)
              ? stats.byPriority.map((item: any) => {
                  const priority = item.priority;
                  const count = item.count || 0;
                  const colors: Record<string, string> = {
                    Low: 'bg-gray-600',
                    Normal: 'bg-blue-600',
                    High: 'bg-orange-600',
                    Urgent: 'bg-red-600',
                    Critical: 'bg-red-800'
                  };
                  return (
                    <div key={priority} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{priority}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${colors[priority] || 'bg-gray-600'}`}
                            style={{ width: `${(count / (stats?.total || stats?.totalTickets || 1)) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                      </div>
                    </div>
                  );
                })
              : Object.entries(stats.byPriority).map(([key, value]) => {
                  const count = typeof value === 'number' ? value : (value as any).count || 0;
                  const colors: Record<string, string> = {
                    Low: 'bg-gray-600',
                    Normal: 'bg-blue-600',
                    High: 'bg-orange-600',
                    Urgent: 'bg-red-600',
                    Critical: 'bg-red-800'
                  };
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{key}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${colors[key] || 'bg-gray-600'}`}
                            style={{ width: `${(count / (stats?.total || stats?.totalTickets || 1)) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      <div className="glass bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-white/50 p-6 animate-slide-up">
        <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">Rapor Dışa Aktar</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="label">Başlangıç Tarihi</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">Bitiş Tarihi</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input"
            />
          </div>
          <div className="flex items-end">
            <button onClick={handleExport} className="btn-primary bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 w-full">
              <Download className="w-4 h-4 mr-2 inline" />
              CSV İndir
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Belirtilen tarih aralığındaki tüm talepleri CSV formatında indirebilirsiniz.
        </p>
      </div>
      </div>
    </div>
  )
}
