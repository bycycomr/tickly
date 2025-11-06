import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, User, Tag, AlertCircle, MessageSquare, Paperclip } from 'lucide-react'
import api from '../lib/api'
import { Ticket, TicketEvent } from '../lib/types'
import { useAuth } from '../context/AuthContext'

const statusMap: Record<number, string> = {
  0: 'New', 1: 'Assigned', 2: 'In Progress', 3: 'Waiting for Info',
  4: 'Completed', 5: 'Closed', 6: 'Rejected', 7: 'Duplicate', 8: 'Merged'
}

const priorityMap: Record<number, string> = {
  0: 'Low', 1: 'Normal', 2: 'High', 3: 'Urgent'
}

const statusColors: Record<number, string> = {
  0: 'bg-blue-100 text-blue-800', 1: 'bg-purple-100 text-purple-800',
  2: 'bg-yellow-100 text-yellow-800', 3: 'bg-orange-100 text-orange-800',
  4: 'bg-green-100 text-green-800', 5: 'bg-gray-100 text-gray-800',
  6: 'bg-red-100 text-red-800', 7: 'bg-gray-100 text-gray-600',
  8: 'bg-indigo-100 text-indigo-800'
}

const priorityColors: Record<number, string> = {
  0: 'bg-gray-100 text-gray-800', 1: 'bg-blue-100 text-blue-800',
  2: 'bg-orange-100 text-orange-800', 3: 'bg-red-100 text-red-800'
}

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [events, setEvents] = useState<TicketEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [comment, setComment] = useState('')
  const [addingComment, setAddingComment] = useState(false)

  async function loadTicket() {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const t = await api.getTicket(Number(id))
      setTicket(t)
    } catch (e: any) {
      console.error(e)
      setError(e?.response?.data?.error || 'Talep yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  async function loadEvents() {
    if (!id) return
    try {
      const evts = await api.getTicketEvents(Number(id))
      setEvents(evts)
    } catch (e: any) {
      console.error('Event yükleme hatası:', e)
    }
  }

  async function handleAddComment() {
    if (!comment.trim() || !id) return
    setAddingComment(true)
    try {
      await api.addComment(Number(id), comment, false)
      setComment('')
      await loadEvents()
    } catch (e: any) {
      console.error(e)
      alert(e?.response?.data?.error || 'Yorum eklenemedi')
    } finally {
      setAddingComment(false)
    }
  }

  async function handleStatusChange(newStatus: number) {
    if (!id) return
    try {
      await api.transitionTicketStatus(Number(id), newStatus)
      await loadTicket()
      await loadEvents()
    } catch (e: any) {
      console.error(e)
      alert(e?.response?.data?.error || 'Durum güncellenemedi')
    }
  }

  useEffect(() => {
    loadTicket()
    loadEvents()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    )
  }

  if (!ticket) {
    return <div className="text-gray-500">Talep bulunamadı.</div>
  }

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/tickets')} className="flex items-center text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Taleplere Dön
      </button>

      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">#{ticket.id} - {ticket.title}</h1>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColors[ticket.status]}`}>
                {statusMap[ticket.status]}
              </span>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${priorityColors[ticket.priority]}`}>
                {priorityMap[ticket.priority]}
              </span>
            </div>
            {ticket.description && (
              <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Oluşturan:</span>
            <span className="font-medium">{ticket.creatorId}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Oluşturma:</span>
            <span className="font-medium">{new Date(ticket.createdAt).toLocaleDateString('tr-TR')}</span>
          </div>
          {ticket.assignedToUserId && (
            <div className="flex items-center space-x-2 text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Atanan:</span>
              <span className="font-medium">{ticket.assignedToUserId}</span>
            </div>
          )}
          {ticket.dueAt && (
            <div className="flex items-center space-x-2 text-sm">
              <AlertCircle className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Son Tarih:</span>
              <span className="font-medium">{new Date(ticket.dueAt).toLocaleDateString('tr-TR')}</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200 mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Durum Değiştir</h3>
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4, 5].map(status => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={ticket.status === status}
                className={`px-3 py-1 text-sm rounded ${
                  ticket.status === status
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'btn-secondary'
                }`}
              >
                {statusMap[status]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          Yorumlar ve Aktiviteler
        </h2>

        <div className="space-y-4 mb-6">
          {events.length === 0 ? (
            <p className="text-gray-500 text-sm">Henüz aktivite bulunmuyor.</p>
          ) : (
            events.map(event => (
              <div key={event.id} className="border-l-2 border-gray-200 pl-4">
                <div className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">{event.actorId}</span>
                  {' · '}
                  <span className="text-gray-400">{new Date(event.createdAt).toLocaleString('tr-TR')}</span>
                  {' · '}
                  <span className="text-gray-500">{event.type}</span>
                </div>
                {event.payloadJson && (
                  <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                    {JSON.parse(event.payloadJson).message || event.payloadJson}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Yorum Ekle</h3>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Yorumunuzu yazın..."
            rows={3}
            className="input mb-2"
          />
          <button
            onClick={handleAddComment}
            disabled={!comment.trim() || addingComment}
            className="btn-primary disabled:opacity-50"
          >
            {addingComment ? 'Ekleniyor...' : 'Yorum Ekle'}
          </button>
        </div>
      </div>
    </div>
  )
}
