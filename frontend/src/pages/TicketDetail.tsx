import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, Clock, User, Tag, AlertCircle, MessageSquare, Paperclip } from 'lucide-react'
import api from '../lib/api'
import signalRService from '../lib/signalr'
import { Ticket, TicketEvent, SLAPlan } from '../lib/types'
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
  0: 'bg-gray-200 text-gray-700', 1: 'bg-blue-100 text-blue-700',
  2: 'bg-orange-200 text-orange-800', 3: 'bg-red-500 text-white font-bold'
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
  const [isInternalComment, setIsInternalComment] = useState(false)
  const [addingComment, setAddingComment] = useState(false)

  const [staffMembers, setStaffMembers] = useState<any[]>([])
  const [selectedAssignee, setSelectedAssignee] = useState('')
  const [assigning, setAssigning] = useState(false)

  const [slaPlans, setSlaPlans] = useState<SLAPlan[]>([])
  const [currentSLA, setCurrentSLA] = useState<SLAPlan | null>(null)

  // File preview
  const [previewFile, setPreviewFile] = useState<{ url: string; type: string; name: string } | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showSLAEdit, setShowSLAEdit] = useState(false)
  const [selectedSLAPlanId, setSelectedSLAPlanId] = useState<number | undefined>()

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

  async function loadStaffMembers() {
    if (!ticket?.departmentId) return
    try {
      const members = await api.getDepartmentMembers(ticket.departmentId)
      setStaffMembers(members)
    } catch (e) {
      console.error('Failed to load staff:', e)
    }
  }

  async function loadSLAPlans() {
    try {
      const plans = await api.getSLAPlans()
      setSlaPlans(plans)
      
      // Find current SLA plan
      if (ticket?.slaPlanId) {
        const current = plans.find(p => p.id === ticket.slaPlanId)
        if (current) setCurrentSLA(current)
      }
    } catch (e) {
      console.error('Failed to load SLA plans:', e)
    }
  }

  async function handleSLAChange() {
    if (!id || !selectedSLAPlanId) return
    try {
      await api.updateTicket(Number(id), { slaPlanId: selectedSLAPlanId })
      toast.success('SLA planı güncellendi')
      setShowSLAEdit(false)
      await loadTicket()
      await loadSLAPlans()
    } catch (e: any) {
      console.error(e)
      toast.error(e?.response?.data?.error || 'SLA güncellenemedi')
    }
  }

  function calculateSLAStatus() {
    if (!ticket?.dueAt) return null
    
    const now = new Date()
    const dueDate = new Date(ticket.dueAt)
    const diffMs = dueDate.getTime() - now.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 0) {
      return {
        status: 'breached',
        text: `${Math.abs(diffMins)} dakika gecikmiş`,
        color: 'text-red-600 bg-red-50 border-red-200'
      }
    } else if (diffMins < 30) {
      return {
        status: 'warning',
        text: `${diffMins} dakika kaldı`,
        color: 'text-orange-600 bg-orange-50 border-orange-200'
      }
    } else {
      const hours = Math.floor(diffMins / 60)
      const mins = diffMins % 60
      return {
        status: 'ok',
        text: `${hours > 0 ? `${hours} saat ` : ''}${mins} dakika kaldı`,
        color: 'text-green-600 bg-green-50 border-green-200'
      }
    }
  }

  async function handleAssign() {
    if (!selectedAssignee || !id) return
    setAssigning(true)
    try {
      await api.assignTicket(Number(id), selectedAssignee)
      await loadTicket()
      await loadEvents()
      setSelectedAssignee('')
      toast.success('Ticket başarıyla atandı')
    } catch (e: any) {
      console.error(e)
      toast.error(e?.response?.data?.error || 'Atama başarısız')
    } finally {
      setAssigning(false)
    }
  }

  async function handleAddComment() {
    if (!comment.trim() || !id) return
    setAddingComment(true)
    try {
      await api.addComment(Number(id), comment, isInternalComment)
      setComment('')
      setIsInternalComment(false)
      await loadEvents()
      toast.success('Yorum başarıyla eklendi')
    } catch (e: any) {
      console.error(e)
      const errorMsg = e?.response?.data?.error || 'Yorum eklenemedi'
      toast.error(errorMsg)
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
      toast.success(`Durum ${statusMap[newStatus]} olarak güncellendi`)
    } catch (e: any) {
      console.error(e)
      const errorMsg = e?.response?.data?.error || 'Durum güncellenemedi'
      toast.error(errorMsg)
    }
  }

  async function handlePreview(attachment: any) {
    try {
      const blob = await api.getAttachment(attachment.id)
      const url = URL.createObjectURL(blob)
      setPreviewFile({
        url,
        type: attachment.mimeType,
        name: attachment.fileName
      })
      setShowPreview(true)
    } catch (e: any) {
      toast.error('Dosya önizlenemedi')
      // Fallback to download
      try {
        const blob = await api.downloadAttachment(attachment.id)
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = attachment.fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (downloadErr: any) {
        toast.error('Dosya indirilemedi')
      }
    }
  }

  function closePreview() {
    if (previewFile?.url) {
      URL.revokeObjectURL(previewFile.url)
    }
    setPreviewFile(null)
    setShowPreview(false)
  }

  useEffect(() => {
    loadTicket()
  }, [id])

  useEffect(() => {
    if (ticket) {
      loadEvents()
      if (ticket.departmentId) {
        loadStaffMembers()
      }
      loadSLAPlans()
    }
  }, [ticket])

  // SignalR real-time updates
  useEffect(() => {
    if (!id) return

    // Join ticket room
    signalRService.joinTicket(id)

    // Listen for real-time comments
    const handleReceiveComment = (data: any) => {
      console.log('Real-time comment received:', data)
      // Reload events to show new comment
      loadEvents()
      toast.success(`Yeni yorum: ${data.username}`)
    }

    const handleUserTyping = (data: any) => {
      console.log(`${data.username} is typing...`)
      // You can show a "User is typing..." indicator here
    }

    signalRService.onReceiveComment(handleReceiveComment)
    signalRService.onUserTyping(handleUserTyping)

    return () => {
      // Leave ticket room on unmount
      signalRService.leaveTicket(id)
    }
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
    <div className="space-y-4 sm:space-y-6">
      <button onClick={() => navigate('/tickets')} className="flex items-center text-gray-600 hover:text-gray-900 transition">
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
        <span className="text-sm sm:text-base">Taleplere Dön</span>
      </button>

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">#{ticket.id}</h1>
              <span className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-full ${statusColors[ticket.status]}`}>
                {statusMap[ticket.status]}
              </span>
              <span className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-full ${priorityColors[ticket.priority]}`}>
                {priorityMap[ticket.priority]}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">{ticket.title}</h2>
            {ticket.description && (
              <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm">
            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600">Oluşturan:</span>
            <span className="font-medium truncate">{ticket.creatorId}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600">Oluşturma:</span>
            <span className="font-medium">{new Date(ticket.createdAt).toLocaleDateString('tr-TR')}</span>
          </div>
          {ticket.assignedToUserId && (
            <div className="flex items-center space-x-2 text-sm">
              <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-600">Atanan:</span>
              <span className="font-medium truncate">{ticket.assignedToUserId}</span>
            </div>
          )}
          {ticket.dueAt && (
            <div className="flex items-center space-x-2 text-sm">
              <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-600">Son Tarih:</span>
              <span className="font-medium">{new Date(ticket.dueAt).toLocaleDateString('tr-TR')}</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200 mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Durum Değiştir</h3>
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4, 5].map(status => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={ticket.status === status}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded transition ${
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

        {ticket.departmentId && staffMembers.length > 0 && (
          <div className="pt-4 border-t border-gray-200 mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Ticket'ı Ata</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="input flex-1"
                disabled={assigning}
              >
                <option value="">-- Kullanıcı Seç --</option>
                {staffMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.displayName || member.username} ({member.role})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAssign}
                disabled={!selectedAssignee || assigning}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assigning ? 'Atanıyor...' : 'Ata'}
              </button>
            </div>
          </div>
        )}

        {/* SLA Information Section */}
        <div className="pt-4 border-t border-gray-200 mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            SLA Bilgileri
          </h3>
          
          {currentSLA ? (
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-gray-900">{currentSLA.name}</span>
                  <button
                    onClick={() => setShowSLAEdit(!showSLAEdit)}
                    className="text-xs text-primary-600 hover:text-primary-800"
                  >
                    {showSLAEdit ? 'İptal' : 'Değiştir'}
                  </button>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Yanıt Süresi: {currentSLA.responseTimeMinutes} dakika</div>
                  <div>Çözüm Süresi: {currentSLA.resolutionTimeMinutes} dakika</div>
                  {currentSLA.description && (
                    <div className="text-gray-500 mt-1">{currentSLA.description}</div>
                  )}
                </div>
              </div>

              {ticket.dueAt && (() => {
                const slaStatus = calculateSLAStatus()
                return slaStatus ? (
                  <div className={`rounded-lg p-3 border ${slaStatus.color}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">
                          {slaStatus.status === 'breached' ? '⚠️ SLA İhlali!' : 
                           slaStatus.status === 'warning' ? '⏰ Son Dakika!' : 
                           '✅ SLA Uygunluğu'}
                        </span>
                      </div>
                      <span className="text-sm font-semibold">{slaStatus.text}</span>
                    </div>
                    <div className="text-xs mt-2">
                      Son Tarih: {new Date(ticket.dueAt).toLocaleString('tr-TR')}
                    </div>
                  </div>
                ) : null
              })()}

              {showSLAEdit && (
                <div className="flex flex-col sm:flex-row gap-2 mt-3">
                  <select
                    value={selectedSLAPlanId || ''}
                    onChange={(e) => setSelectedSLAPlanId(e.target.value ? Number(e.target.value) : undefined)}
                    className="input flex-1"
                  >
                    <option value="">-- SLA Planı Seç --</option>
                    {slaPlans.map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} (Yanıt: {plan.responseTimeMinutes}dk, Çözüm: {plan.resolutionTimeMinutes}dk)
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleSLAChange}
                    disabled={!selectedSLAPlanId}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Güncelle
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">SLA planı atanmamış (otomatik)</p>
              <button
                onClick={() => setShowSLAEdit(!showSLAEdit)}
                className="btn-secondary text-sm"
              >
                SLA Planı Ata
              </button>
              
              {showSLAEdit && (
                <div className="flex flex-col sm:flex-row gap-2 mt-3">
                  <select
                    value={selectedSLAPlanId || ''}
                    onChange={(e) => setSelectedSLAPlanId(e.target.value ? Number(e.target.value) : undefined)}
                    className="input flex-1"
                  >
                    <option value="">-- SLA Planı Seç --</option>
                    {slaPlans.map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} (Yanıt: {plan.responseTimeMinutes}dk, Çözüm: {plan.resolutionTimeMinutes}dk)
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleSLAChange}
                    disabled={!selectedSLAPlanId}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Ata
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Attachments Section */}
      {ticket.attachments && ticket.attachments.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Paperclip className="w-5 h-5 mr-2" />
            Ekler ({ticket.attachments.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ticket.attachments.map((attachment) => {
              const isImage = attachment.mimeType.startsWith('image/')
              const isPDF = attachment.mimeType === 'application/pdf'
              const icon = isImage ? '🖼️' : isPDF ? '📄' : '📎'
              
              return (
                <div
                  key={attachment.id}
                  className="glass hover-lift p-4 rounded-lg border border-gray-200 transition-all cursor-pointer"
                  onClick={() => handlePreview(attachment)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-3xl flex-shrink-0">{icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {attachment.fileName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(attachment.sizeBytes / 1024).toFixed(1)} KB
                      </p>
                      {attachment.scanStatus === 'Clean' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-2">
                          ✓ Güvenli
                        </span>
                      )}
                      {attachment.scanStatus === 'Pending' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
                          ⏳ Taranıyor
                        </span>
                      )}
                      {attachment.scanStatus === 'Quarantined' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mt-2">
                          ⚠️ Karantinada
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          Yorumlar ve Aktiviteler
        </h2>

        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-gray-500 text-sm">Henüz aktivite bulunmuyor.</p>
          ) : (
            events.map(event => {
              let payload: any = {};
              try {
                payload = event.payloadJson ? JSON.parse(event.payloadJson) : {};
              } catch (e) {
                payload = { raw: event.payloadJson };
              }

              // Safely handle event.type whether it's string or number
              const eventType = String(event.type || '');
              const isComment = eventType.includes('Comment') || eventType === '3';
              const isStatusChange = eventType === 'StatusChange' || eventType === '1';
              const isAssignment = eventType === 'Assignment' || eventType === '2';
              const isInternal = event.visibility === 'Internal';

              return (
                <div 
                  key={event.id} 
                  className={`border-l-4 pl-4 py-2 ${
                    isComment ? (isInternal ? 'border-orange-400 bg-orange-50' : 'border-blue-400 bg-blue-50') : 
                    isStatusChange ? 'border-green-400 bg-green-50' : 
                    isAssignment ? 'border-purple-400 bg-purple-50' : 
                    'border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-semibold text-gray-900">{event.actorId}</span>
                        {isComment && !isInternal && <span className="text-blue-600 ml-2">💬 yorum ekledi</span>}
                        {isComment && isInternal && <span className="text-orange-600 ml-2">🔒 dahili yorum ekledi</span>}
                        {isStatusChange && <span className="text-green-600 ml-2">🔄 durumu değiştirdi</span>}
                        {isAssignment && <span className="text-purple-600 ml-2">👤 atama yaptı</span>}
                        {!isComment && !isStatusChange && !isAssignment && (
                          <span className="text-gray-500 ml-2">• {event.type}</span>
                        )}
                      </div>
                      {(payload.text || payload.message || payload.note || payload.comment) && (
                        <div className="text-sm text-gray-800 mt-2 p-3 bg-white rounded border border-gray-200 whitespace-pre-wrap">
                          {payload.text || payload.message || payload.note || payload.comment}
                        </div>
                      )}
                      {payload.from !== undefined && payload.to !== undefined && isStatusChange && (
                        <div className="text-sm text-gray-700 mt-1">
                          <span className="inline-block px-2 py-0.5 bg-gray-200 rounded text-xs mr-1">
                            {payload.from}
                          </span>
                          →
                          <span className="inline-block px-2 py-0.5 bg-gray-200 rounded text-xs ml-1">
                            {payload.to}
                          </span>
                        </div>
                      )}
                      {payload.from !== undefined && payload.to !== undefined && isAssignment && (
                        <div className="text-sm text-gray-700 mt-1">
                          {payload.from ? (
                            <>
                              <span className="font-medium">{payload.from}</span>
                              {' → '}
                              <span className="font-medium">{payload.to}</span>
                            </>
                          ) : (
                            <>
                              Atanan: <span className="font-medium">{payload.to}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 ml-4 whitespace-nowrap">
                      {new Date(event.createdAt).toLocaleString('tr-TR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            Yeni Yorum Ekle
          </h3>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Yorumunuzu buraya yazın..."
            rows={4}
            className="input mb-3 resize-none"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={isInternalComment}
                onChange={(e) => setIsInternalComment(e.target.checked)}
                className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              🔒 Dahili Yorum (Sadece ekip üyeleri görebilir)
            </label>
            <button
              onClick={handleAddComment}
              disabled={!comment.trim() || addingComment}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addingComment ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Ekleniyor...
                </span>
              ) : (
                'Yorum Ekle'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && previewFile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={closePreview}
        >
          <div 
            className="relative bg-white rounded-lg max-w-5xl max-h-[90vh] w-full overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {previewFile.name}
              </h3>
              <button
                onClick={closePreview}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              {previewFile.type.startsWith('image/') ? (
                <img 
                  src={previewFile.url} 
                  alt={previewFile.name} 
                  className="max-w-full h-auto mx-auto"
                />
              ) : previewFile.type === 'application/pdf' ? (
                <iframe
                  src={previewFile.url}
                  className="w-full h-[70vh]"
                  title={previewFile.name}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    Bu dosya türü önizlenemiyor
                  </p>
                  <a
                    href={previewFile.url}
                    download={previewFile.name}
                    className="btn-primary inline-block"
                  >
                    📥 İndir
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
