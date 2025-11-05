import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username || !password) {
      alert('Kullanıcı adı ve parola girin')
      return
    }
    try {
      setLoading(true)
      await login(username, password)
      navigate('/dashboard')
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Giriş başarısız')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <h2>Giriş</h2>
      <form onSubmit={handleSubmit} style={{ marginTop: 8, display: 'flex', gap: 12, flexDirection: 'column' }}>
        <div>
          <label>Kullanıcı</label>
          <input value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div>
          <label>Parola</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div>
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}</button>
        </div>
      </form>
    </div>
  )
}
