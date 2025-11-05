import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import TicketList from './pages/TicketList'
import TicketCreate from './pages/TicketCreate'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'

function Header() {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [theme, setTheme] = useState<'light'|'dark'>(() => (localStorage.getItem('tickly_theme') as 'light'|'dark') || 'light')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('tickly_theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme(t => t === 'light' ? 'dark' : 'light')
  }

  return (
    <header className="app-header">
      <div className="brand">
        <span className="logo" aria-hidden />
        <span>Tickly</span>
      </div>

      <nav className={`nav-links`} aria-hidden={mobileOpen ? 'false' : 'true'}>
        <Link to="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</Link>
        <Link to="/" onClick={() => setMobileOpen(false)}>Talepler</Link>
        <Link to="/create" onClick={() => setMobileOpen(false)}>Yeni Oluştur</Link>
        {user?.roles?.includes('SuperAdmin') && <Link to="/admin" onClick={() => setMobileOpen(false)}>Admin Panel</Link>}
        {user?.deptRole && <Link to="/department" onClick={() => setMobileOpen(false)}>Departman Yönetimi</Link>}
      </nav>

      <div className="header-right">
        <button className="btn btn-ghost" onClick={toggleTheme} aria-label="Tema değiştir">{theme === 'light' ? '🌙' : '☀️'}</button>
        <button className="btn btn-ghost mobile-toggle" onClick={() => setMobileOpen(o => !o)} aria-label="Menü">{mobileOpen ? '✕' : '☰'}</button>
        {user ? (
          <div className="user-badge">
            <span className="avatar" aria-hidden />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <strong style={{ fontSize: 13 }}>{user.username}</strong>
              {user.deptRole && <span className="muted" style={{ fontSize: 11 }}>{user.deptRole}</span>}
            </div>
            <button className="btn btn-ghost" onClick={logout}>Çıkış</button>
          </div>
        ) : (
          <Link to="/login">Giriş</Link>
        )}
      </div>

      {/* mobile menu overlay */}
      {mobileOpen && (
        <div className="mobile-nav" onClick={() => setMobileOpen(false)}>
          <div className="mobile-nav-inner" onClick={e => e.stopPropagation()}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/">Talepler</Link>
              <Link to="/create">Yeni Oluştur</Link>
              {user?.roles?.includes('SuperAdmin') && <Link to="/admin">Admin Panel</Link>}
              {user?.deptRole && <Link to="/department">Departman Yönetimi</Link>}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-container">
          <Header />

          <main className="page-main">
            <Routes>
              <Route path="/" element={<TicketList />} />
              <Route path="/create" element={<TicketCreate />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
