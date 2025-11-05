import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let mounted = true
    api.get('/api/tickets').then(r => {
      if (!mounted) return
      const data = r.data
      setCount(Array.isArray(data) ? data.length : 0)
    }).catch(() => { if (mounted) setCount(0) })
    return () => { mounted = false }
  }, [])

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Dashboard</h2>
            <p>Hoş geldiniz, <strong>{user?.username ?? 'Misafir'}</strong></p>
            {user?.deptRole && <p style={{ margin: 0 }}>Rol: <strong>{user.deptRole}</strong></p>}
          </div>
          <div>
            <button className="btn btn-ghost" onClick={logout}>Çıkış</button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12 }} className="grid">
        <div className="card" style={{ minWidth: 220 }}>
          <h3>Aktif Talepler</h3>
          <p className="muted" style={{ fontSize: 20, margin: '8px 0' }}>{count === null ? 'Yükleniyor...' : count}</p>
          <Link to="/">Talepleri Gör</Link>
        </div>

        <div className="card" style={{ minWidth: 220 }}>
          <h3>Yeni Talep</h3>
          <p className="muted" style={{ fontSize: 20, margin: '8px 0' }}>Oluştur</p>
          <Link to="/create">Oluştur</Link>
        </div>
      </div>
    </div>
  )
}
