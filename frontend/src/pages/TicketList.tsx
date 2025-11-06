import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, List, ChevronLeft, ChevronRight } from 'lucide-react'
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
  
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<number | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<number | 'all'>('all')
  
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

  const totalPages = Math.ceil(tickets.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTickets = tickets.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header with gradient */}
        <div className="flex items-center justify-between animate-slide-in-left">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-primary-500 to-purple-600 p-3 rounded-2xl shadow-lg">
              <List className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Talepler</h1>
              <p className="text-sm text-gray-500 mt-1">Tüm destek taleplerini yönetin</p>
            </div>
          </div>
          <div className="glass px-4 py-2 rounded-xl shadow-md">
            <span className="text-sm font-semibold text-gray-700">{tickets.length}</span>
            <span className="text-sm text-gray-500 ml-1">talep</span>
          </div>
        </div>

        {/* Filters Card with glassmorphism */}
        <div className="glass rounded-2xl shadow-xl p-6 border border-white/50 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Başlık
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Öncelik
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Oluşturan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedTickets.map(ticket => (
                    <tr
                      key={ticket.id}
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        #{ticket.id}
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
                        {ticket.creatorId}
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
              {paginatedTickets.map(ticket => (
                <div
                  key={ticket.id}
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-500">#{ticket.id}</span>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${priorityColors[ticket.priority]}`}>
                          {priorityMap[ticket.priority]}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{ticket.title}</h3>
                      {ticket.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {ticket.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[ticket.status]}`}>
                      {statusMap[ticket.status]}
                    </span>
                    <div className="text-xs text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Oluşturan: {ticket.creatorId}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-gray-200 gap-4">
                <div className="text-sm text-gray-700 text-center sm:text-left">
                  <span className="font-medium">{startIndex + 1}</span>
                  {' - '}
                  <span className="font-medium">{Math.min(startIndex + itemsPerPage, tickets.length)}</span>
                  {' / '}
                  <span className="font-medium">{tickets.length}</span>
                  {' talep'}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
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
