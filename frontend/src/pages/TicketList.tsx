import React, { useEffect, useState } from 'react'
import api from '../lib/api'

type Ticket = {
  id: number
  title: string
  description?: string
  status: string | number
  priority: string | number
  createdAt: string
}

export default function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/api/tickets')
      setTickets(res.data)
    } catch (e: any) {
      console.error(e)
      setError(e?.response?.data?.error || 'Listeleme hatası')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <div className="card">
        <h2>Mevcut Talepler</h2>
        {loading ? <div>Yükleniyor...</div> : error ? <div style={{ color: 'crimson' }}>{error}</div> : (
          tickets.length === 0 ? <div>Henüz ticket yok.</div> : (
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Başlık</th>
                  <th>Durum</th>
                  <th>Öncelik</th>
                  <th>Oluşturulma</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.title}</td>
                    <td>{String(t.status)}</td>
                    <td>{String(t.priority)}</td>
                    <td>{new Date(t.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  )
}
