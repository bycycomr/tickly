import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Menu, X, Ticket } from 'lucide-react';
import TicketList from './pages/TicketList';
import TicketCreate from './pages/TicketCreate';
import TicketDetail from './pages/TicketDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import DepartmentManager from './pages/DepartmentManager';
import Reports from './pages/Reports';
import KnowledgeBase from './pages/KnowledgeBase';
import ArticleDetail from './pages/ArticleDetail';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function Header() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-md">
              <Ticket className="text-white" size={20} />
            </div>
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              Tickly
            </Link>
          </div>

          {user && (
            <>
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-1">
                <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg text-sm font-medium transition-all">
                  Dashboard
                </Link>
                <Link to="/tickets" className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg text-sm font-medium transition-all">
                  Talepler
                </Link>
                <Link to="/tickets/create" className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg text-sm font-medium transition-all">
                  Yeni Talep
                </Link>
                <Link to="/kb" className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg text-sm font-medium transition-all">
                  Bilgi Bankası
                </Link>
                {(user.roles?.includes('SuperAdmin') || user.roles?.includes('DepartmentManager')) && (
                  <Link to="/reports" className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg text-sm font-medium transition-all">
                    Raporlar
                  </Link>
                )}
                {user.roles?.includes('DepartmentManager') && (
                  <Link to="/department" className="text-blue-700 hover:text-blue-800 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold transition-all">
                    Departman
                  </Link>
                )}
                {user.roles?.includes('SuperAdmin') && (
                  <Link to="/admin" className="text-purple-700 hover:text-purple-800 hover:bg-purple-50 px-4 py-2 rounded-lg text-sm font-semibold transition-all">
                    Admin
                  </Link>
                )}
              </nav>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-all"
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </>
          )}

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {(user.displayName || user.username)?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 truncate max-w-xs">{user.displayName || user.username}</span>
                </div>
                <button onClick={logout} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
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

        {/* Mobile Navigation */}
        {user && mobileOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-1 border-t border-gray-200 animate-slide-down">
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all"
            >
              Dashboard
            </Link>
            <Link
              to="/tickets"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all"
            >
              Talepler
            </Link>
            <Link
              to="/tickets/create"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all"
            >
              Yeni Talep
            </Link>
            <Link
              to="/kb"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all"
            >
              Bilgi Bankası
            </Link>
            {(user.roles?.includes('SuperAdmin') || user.roles?.includes('DepartmentManager')) && (
              <Link
                to="/reports"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all"
              >
                Raporlar
              </Link>
            )}
            {user.roles?.includes('DepartmentManager') && (
              <Link
                to="/department"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-base font-semibold text-blue-700 hover:text-blue-800 hover:bg-blue-50 transition-all"
              >
                Departman
              </Link>
            )}
            {user.roles?.includes('SuperAdmin') && (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-base font-semibold text-purple-700 hover:text-purple-800 hover:bg-purple-50 transition-all"
              >
                Admin
              </Link>
            )}
            <div className="pt-4 border-t border-gray-200 mt-2">
              <div className="px-4 py-2 text-sm font-medium text-gray-600">
                {user.displayName || user.username}
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                className="block w-full text-left px-4 py-2.5 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-all"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <Header />
          
          <main>
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
                path="/tickets/create"
                element={
                  <ProtectedRoute>
                    <TicketCreate />
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
                path="/admin"
                element={
                  <ProtectedRoute requireRole="SuperAdmin">
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/department"
                element={
                  <ProtectedRoute requireRole="DepartmentManager">
                    <DepartmentManager />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute requireRole="SuperAdmin,DepartmentManager">
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kb"
                element={
                  <ProtectedRoute>
                    <KnowledgeBase />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kb/:slug"
                element={
                  <ProtectedRoute>
                    <ArticleDetail />
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
