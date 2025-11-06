import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, List, ChevronLeft, ChevronRight, SlidersHorizontal, X, Calendar, ArrowUpDown } from 'lucide-react'
import api from '../lib/api'
import { Ticket } from '../lib/types'
import { useAuth } from '../context/AuthContext'

const statusMap: Record<number, string> = {
  0: 'New',
  1: 'Assigned',
  2: 'In Progress',
  3: 'Waiting for Info',
  4: 'Completed',
  5: 'Closed',
  6: 'Rejected',
  7: 'Duplicate',
  8: 'Merged'
}

const priorityMap: Record<number, string> = {
  0: 'Low',
  1: 'Normal',
  2: 'High',
  3: 'Urgent'
}

const statusColors: Record<number, string> = {
  0: 'bg-blue-100 text-blue-800',
  1: 'bg-purple-100 text-purple-800',
  2: 'bg-yellow-100 text-yellow-800',
  3: 'bg-orange-100 text-orange-800',
  4: 'bg-green-100 text-green-800',
  5: 'bg-gray-100 text-gray-800',
  6: 'bg-red-100 text-red-800',
  7: 'bg-gray-100 text-gray-600',
  8: 'bg-indigo-100 text-indigo-800'
}

const priorityColors: Record<number, string> = {
  0: 'bg-gray-200 text-gray-700',
  1: 'bg-blue-100 text-blue-700',
  2: 'bg-orange-200 text-orange-800',
  3: 'bg-red-500 text-white font-bold animate-pulse'
}

export default function TicketList() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Basic filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<number | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<number | 'all'>('all')
  
  // Advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  async function load() {
    setLoading(true)
    setError(null)
    try {
      // SuperAdmin tüm ticket'ları görebilir, diğerleri sadece kendi departmanlarını
      const isSuperAdmin = user?.roles?.includes('SuperAdmin')
      const userDepartmentId = user?.departmentId
      
      const res = await api.getTickets({
        status: statusFilter !== 'all' ? statusFilter as number : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter as number : undefined,
        search: search || undefined,
        departmentId: !isSuperAdmin && userDepartmentId ? userDepartmentId : undefined
      })
      setTickets(res)
    } catch (e: any) {
      console.error(e)
      setError(e?.response?.data?.error || 'Ticket listesi yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [statusFilter, priorityFilter, search])

  // Apply advanced filters and sorting
  const filteredAndSortedTickets = React.useMemo(() => {
    let result = [...tickets]

    // Date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      result = result.filter(t => new Date(t.createdAt) >= fromDate)
    }
    if (dateTo) {
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999) // End of day
      result = result.filter(t => new Date(t.createdAt) <= toDate)
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'priority':
          comparison = a.priority - b.priority
          break
        case 'status':
          comparison = a.status - b.status
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [tickets, dateFrom, dateTo, sortBy, sortOrder])

  const totalPages = Math.ceil(filteredAndSortedTickets.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTickets = filteredAndSortedTickets.slice(startIndex, startIndex + itemsPerPage)

  function clearAdvancedFilters() {
    setDateFrom('')
    setDateTo('')
    setSortBy('date')
    setSortOrder('desc')
  }

  const hasActiveAdvancedFilters = dateFrom || dateTo || sortBy !== 'date' || sortOrder !== 'desc'

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-96 h-96 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-br from-purple-300 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-gradient-to-br from-pink-300 to-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header with gradient */}
        <div className="flex items-center justify-between animate-slide-in-left">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 rounded-2xl shadow-2xl transform hover:scale-110 hover:rotate-6 transition-all duration-300">
              <List className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Talepler
              </h1>
              <p className="text-sm text-gray-700 mt-1 font-medium">Tüm destek taleplerini yönetin ✨</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`glass px-5 py-3 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center gap-3 transform hover:scale-105 ${
                hasActiveAdvancedFilters ? 'ring-4 ring-purple-400 bg-gradient-to-r from-purple-100 to-pink-100' : 'bg-white/80'
              }`}
            >
              <SlidersHorizontal className={`w-5 h-5 ${hasActiveAdvancedFilters ? 'text-purple-600' : 'text-indigo-600'}`} />
              <span className="text-sm font-bold text-gray-800">Gelişmiş Filtre</span>
              {hasActiveAdvancedFilters && (
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-black shadow-lg animate-pulse">
                  !
                </span>
              )}
            </button>
            <div className="glass bg-gradient-to-r from-indigo-100 to-purple-100 px-6 py-3 rounded-2xl shadow-lg border-2 border-white/50">
              <span className="text-lg font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{filteredAndSortedTickets.length}</span>
              <span className="text-sm text-gray-700 ml-2 font-semibold">talep</span>
            </div>
          </div>
        </div>

        {/* Filters Card with glassmorphism */}
        <div className="glass bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-white/50 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Talep ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10 bg-white/80 backdrop-blur-sm"
              />
            </div>

            <div className="relative group">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="input pl-10 bg-white/80 backdrop-blur-sm"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="0">New</option>
                <option value="1">Assigned</option>
                <option value="2">In Progress</option>
                <option value="3">Waiting for Info</option>
                <option value="4">Completed</option>
                <option value="5">Closed</option>
                <option value="6">Rejected</option>
                <option value="7">Duplicate</option>
                <option value="8">Merged</option>
              </select>
            </div>

            <div className="relative group">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="input pl-10 bg-white/80 backdrop-blur-sm"
              >
                <option value="all">Tüm Öncelikler</option>
                <option value="0">Low</option>
                <option value="1">Normal</option>
                <option value="2">High</option>
                <option value="3">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="glass rounded-2xl shadow-xl p-6 border border-white/50 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="w-6 h-6 text-primary-600" />
                <h3 className="text-lg font-bold text-gray-900">Gelişmiş Filtreler</h3>
              </div>
              <button
                onClick={() => setShowAdvancedFilters(false)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Date Range */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="w-4 h-4 text-primary-600" />
                  Başlangıç Tarihi
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="input bg-white/80 backdrop-blur-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="w-4 h-4 text-primary-600" />
                  Bitiş Tarihi
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="input bg-white/80 backdrop-blur-sm"
                />
              </div>

              {/* Sort Options */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <ArrowUpDown className="w-4 h-4 text-primary-600" />
                  Sıralama
                </label>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="input bg-white/80 backdrop-blur-sm flex-1"
                  >
                    <option value="date">Tarih</option>
                    <option value="priority">Öncelik</option>
                    <option value="status">Durum</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="glass px-4 py-2 rounded-xl hover:bg-white/50 transition-all"
                    title={sortOrder === 'asc' ? 'Artan' : 'Azalan'}
                  >
                    <ArrowUpDown className={`w-5 h-5 text-primary-600 transition-transform ${
                      sortOrder === 'desc' ? 'rotate-180' : ''
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveAdvancedFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={clearAdvancedFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <X className="w-4 h-4" />
                  Filtreleri Temizle
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results Card */}
        <div className="card hover-lift animate-scale-in">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
              <p className="mt-4 text-gray-600 font-medium">Yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg shadow-md animate-shake">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4 animate-bounce-slow">
                <List className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium">Henüz talep bulunmuyor.</p>
              <p className="text-gray-400 text-sm mt-2">İlk talebi oluşturmak için yukarıdaki butonu kullanın</p>
            </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto custom-scrollbar rounded-xl">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Başlık
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Öncelik
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Oluşturan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Tarih
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {paginatedTickets.map((ticket, index) => (
                    <tr
                      key={ticket.id}
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                      className="hover:bg-gradient-to-r hover:from-primary-50 hover:to-purple-50 cursor-pointer transition-all duration-200 group animate-fade-in"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="font-bold text-primary-600 group-hover:text-primary-700">
                          #{ticket.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">{ticket.title}</div>
                        {ticket.description && (
                          <div className="text-gray-500 truncate max-w-md">
                            {ticket.description.substring(0, 60)}
                            {ticket.description.length > 60 ? '...' : ''}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[ticket.status]}`}>
                          {statusMap[ticket.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityColors[ticket.priority]}`}>
                          {priorityMap[ticket.priority]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.creatorName || ticket.creatorId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {paginatedTickets.map((ticket, index) => (
                <div
                  key={ticket.id}
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                  className="glass rounded-xl p-5 hover:shadow-xl transition-all duration-200 cursor-pointer hover-lift border border-white/50 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-bold text-primary-600">#{ticket.id}</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${priorityColors[ticket.priority]}`}>
                          {priorityMap[ticket.priority]}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 text-lg">{ticket.title}</h3>
                      {ticket.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                          {ticket.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className={`px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm ${statusColors[ticket.status]}`}>
                      {statusMap[ticket.status]}
                    </span>
                    <div className="text-xs text-gray-500 font-medium">
                      {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    <span className="font-medium">Oluşturan:</span> {ticket.creatorName || ticket.creatorId}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t border-gray-200 gap-4">
                <div className="glass px-4 py-2 rounded-xl shadow-md text-sm font-medium text-gray-700">
                  <span className="text-primary-600">{startIndex + 1}</span>
                  {' - '}
                  <span className="text-primary-600">{Math.min(startIndex + itemsPerPage, tickets.length)}</span>
                  {' / '}
                  <span className="text-primary-600">{tickets.length}</span>
                  {' talep'}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="glass p-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/90 hover:shadow-lg transition-all duration-200 group"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
                  </button>
                  <div className="glass px-6 py-3 rounded-xl font-bold text-primary-600 shadow-md">
                    {currentPage} <span className="text-gray-400 font-normal">/ {totalPages}</span>
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="glass p-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/90 hover:shadow-lg transition-all duration-200 group"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      </div>
    </div>
  )
}
