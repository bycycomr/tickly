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
      <div className="flex items-center justify-center h-64">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Raporlar</h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Talep</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.total || stats?.totalTickets || 0}</p>
            </div>
            <BarChart3 className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Açık Talepler</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.openTickets || 0}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-yellow-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tamamlanan</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.closedTickets || 0}
              </p>
            </div>
            <BarChart3 className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">SLA Uyum</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.slaComplianceRate ? `${(stats.slaComplianceRate * 100).toFixed(0)}%` : 'N/A'}
              </p>
            </div>
            <Calendar className="w-10 h-10 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
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

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Öncelik Dağılımı</h2>
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

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Rapor Dışa Aktar</h2>
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
            <button onClick={handleExport} className="btn-primary w-full">
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
  )
}
