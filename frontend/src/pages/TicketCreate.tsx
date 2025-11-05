import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'

export default function TicketCreate() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!title) return alert('Başlık gerekli')
    setSaving(true)
    try {
      await api.post('/api/tickets', { title, description })
      navigate('/')
    } catch (err: any) {
      console.error(err)
      alert(err?.response?.data?.error || 'Kaydetme hatası')
    } finally { setSaving(false) }
  }

  return (
    <div>
      <div className="card">
        <h2>Yeni Ticket Oluştur</h2>
        <form onSubmit={save} style={{ marginTop: 8, display: 'flex', gap: 8, flexDirection: 'column', maxWidth: 600 }}>
          <div>
            <label>Başlık</label>
            <input placeholder="Başlık" value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div>
            <label>Açıklama (opsiyonel)</label>
            <textarea placeholder="Açıklama (opsiyonel)" rows={4} value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Kaydediliyor...' : 'Oluştur'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
