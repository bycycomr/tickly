import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import TicketList from './pages/TicketList';
import TicketCreate from './pages/TicketCreate';
import TicketDetail from './pages/TicketDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Reports from './pages/Reports';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function Header() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary-600">
              Tickly
            </Link>
          </div>

          {user && (
            <nav className="hidden md:flex space-x-4">
              <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </Link>
              <Link to="/tickets" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                Talepler
              </Link>
              <Link to="/tickets/create" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                Yeni Talep
              </Link>
              <Link to="/reports" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                Raporlar
              </Link>
              {user.roles?.includes('SuperAdmin') && (
                <Link to="/admin" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  Admin
                </Link>
              )}
            </nav>
          )}

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">{user.displayName || user.username}</span>
                <button onClick={logout} className="btn btn-ghost text-sm">
                  Çıkış
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary">
                Giriş Yap
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tickets"
                element={
                  <ProtectedRoute>
                    <TicketList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tickets/:id"
                element={
                  <ProtectedRoute>
                    <TicketDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tickets/create"
                element={
                  <ProtectedRoute>
                    <TicketCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireRole="SuperAdmin">
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Login />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
