import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import signalRService from '../lib/signalr';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  Ticket,
  AlertCircle,
  Clock,
  TrendingUp,
  Users,
  Plus,
  LogOut,
  Bell,
} from 'lucide-react';
import type { DashboardStats } from '../lib/types';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      
      // Kullanıcının departmanını ve rolünü kontrol et
      const isSuperAdmin = user?.roles?.includes('SuperAdmin');
      const userDepartmentId = user?.departmentId;
      
      // Eğer SuperAdmin değilse ve bir departmana atanmışsa, o departmanın stats'ını göster
      const departmentFilter = !isSuperAdmin && userDepartmentId ? userDepartmentId : undefined;
      
      const data = await api.getDashboardStats(undefined, departmentFilter);
      setStats(data);
    } catch (err: any) {
      setError('Dashboard yüklenemedi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Setup real-time notifications
  useEffect(() => {
    // Ticket status changed
    signalRService.onTicketStatusChanged((data: any) => {
      toast.success(data.message, {
        duration: 5000,
        icon: '🔄',
      })
      loadDashboard() // Refresh stats
    })

    // Ticket assigned
    signalRService.onTicketAssigned((data: any) => {
      toast.success(data.message, {
        duration: 5000,
        icon: '📋',
      })
      loadDashboard()
    })

    // Comment added
    signalRService.onCommentAdded((data: any) => {
      toast(data.message, {
        duration: 4000,
        icon: '💬',
      })
    })

    // SLA violation (urgent)
    signalRService.onSLAViolation((data: any) => {
      toast.error(data.message, {
        duration: 8000,
        icon: '⚠️',
      })
      loadDashboard()
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-purple-300 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-indigo-300 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/70 backdrop-blur-xl shadow-lg sticky top-0 z-10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl transform hover:scale-110 transition-all duration-300 hover:rotate-6">
                <LayoutDashboard className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-sm text-gray-700 font-medium">
                  Hoş geldiniz, <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">{user?.displayName || user?.username}</span> 👋
                </p>
              </div>
            </div>
            <button 
              onClick={logout} 
              className="flex items-center gap-2 px-5 py-2.5 text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 rounded-xl transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105 font-medium border-2 border-gray-200 hover:border-transparent"
            >
              <LogOut size={18} />
              <span>Çıkış</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 text-red-800 rounded-2xl p-5 mb-6 flex items-start animate-shake shadow-xl">
            <AlertCircle size={24} className="mr-3 mt-0.5 flex-shrink-0 text-red-600" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-xl p-6 border-2 border-white/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 transform animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-indigo-700 uppercase tracking-wide">Toplam Talep</p>
                <p className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mt-2">
                  {stats?.total || stats?.totalTickets || 0}
                </p>
                <p className="text-xs text-gray-600 mt-1">Tüm talepler</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-4 rounded-2xl shadow-lg transform hover:rotate-12 transition-transform duration-300">
                <Ticket className="text-white" size={32} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <div className="glass bg-gradient-to-br from-cyan-50 to-blue-100 rounded-2xl shadow-xl p-6 border-2 border-white/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 transform animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-blue-700 uppercase tracking-wide">Açık Talep</p>
                <p className="text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-2">
                  {stats?.openTickets || 0}
                </p>
                <p className="text-xs text-gray-600 mt-1">Bekleyen işlemler</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-4 rounded-2xl shadow-lg transform hover:rotate-12 transition-transform duration-300">
                <AlertCircle className="text-white" size={32} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <div className="glass bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl shadow-xl p-6 border-2 border-white/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 transform animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-red-700 uppercase tracking-wide">Geciken</p>
                <p className="text-4xl font-black bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mt-2">
                  {stats?.overdueTickets || 0}
                </p>
                <p className="text-xs text-gray-600 mt-1">Acil müdahale</p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-pink-600 p-4 rounded-2xl shadow-lg transform hover:rotate-12 transition-transform duration-300 animate-pulse-slow">
                <Clock className="text-white" size={32} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <div className="glass bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl shadow-xl p-6 border-2 border-white/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 transform animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-green-700 uppercase tracking-wide">SLA Uyum</p>
                <p className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-2">
                  {stats?.slaComplianceRate ? `${Math.round(stats.slaComplianceRate)}%` : 'N/A'}
                </p>
                <p className="text-xs text-gray-600 mt-1">Performans skoru</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-2xl shadow-lg transform hover:rotate-12 transition-transform duration-300">
                <TrendingUp className="text-white" size={32} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="glass bg-white/80 rounded-2xl shadow-xl p-6 border-2 border-white/50 animate-fade-in backdrop-blur-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <Plus className="text-white" size={22} />
              </div>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Hızlı İşlemler</span>
            </h2>
            <div className="space-y-3">
              <Link 
                to="/tickets/create" 
                className="group flex items-center gap-4 w-full px-5 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 hover:from-purple-700 hover:via-pink-700 hover:to-red-600 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              >
                <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all">
                  <Plus size={24} strokeWidth={2.5} />
                </div>
                <span className="font-bold text-lg">Yeni Talep Oluştur</span>
              </Link>
              <Link 
                to="/tickets" 
                className="group flex items-center gap-4 w-full px-5 py-4 bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 hover:from-blue-200 hover:via-indigo-200 hover:to-purple-200 text-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-blue-200 hover:border-purple-300"
              >
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg shadow-md group-hover:scale-110 transition-transform">
                  <Ticket size={24} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="font-bold text-lg">Tüm Talepleri Görüntüle</span>
              </Link>
            </div>
          </div>

          <div className="glass bg-white/80 rounded-2xl shadow-xl p-6 border-2 border-white/50 animate-fade-in backdrop-blur-xl" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl shadow-lg">
                <Ticket className="text-white" size={22} />
              </div>
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Durum Dağılımı</span>
            </h2>
            <div className="space-y-3">
              {stats?.byStatus && (Array.isArray(stats.byStatus) 
                ? stats.byStatus.map((item: any) => {
                    const status = item.status;
                    const countValue = item.count || 0;
                    const statusColors: Record<string, string> = {
                      'New': 'bg-blue-100 text-blue-700',
                      'Assigned': 'bg-purple-100 text-purple-700',
                      'InProgress': 'bg-yellow-100 text-yellow-700',
                      'Completed': 'bg-green-100 text-green-700',
                      'Closed': 'bg-gray-100 text-gray-700',
                      'Rejected': 'bg-red-100 text-red-700',
                    };
                    const colorClass = statusColors[status] || 'bg-primary-100 text-primary-700';
                    
                    return (
                      <div key={status} className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg hover:shadow-md transition-all duration-200 border border-gray-100">
                        <span className="text-sm font-semibold text-gray-700">{status}</span>
                        <span className={`px-4 py-1.5 ${colorClass} rounded-full text-sm font-bold shadow-sm`}>{countValue}</span>
                      </div>
                    );
                  })
                : Object.entries(stats.byStatus).map(([status, count]) => {
                    const countValue = typeof count === 'number' ? count : (typeof count === 'object' && count !== null ? (count as any).count || 0 : 0);
                    const statusColors: Record<string, string> = {
                      'New': 'bg-blue-100 text-blue-700',
                      'InProgress': 'bg-yellow-100 text-yellow-700',
                      'Completed': 'bg-green-100 text-green-700',
                      'Closed': 'bg-gray-100 text-gray-700',
                    };
                    const colorClass = statusColors[status] || 'bg-primary-100 text-primary-700';
                    
                    return (
                      <div key={status} className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg hover:shadow-md transition-all duration-200 border border-gray-100">
                        <span className="text-sm font-semibold text-gray-700">{status}</span>
                        <span className={`px-4 py-1.5 ${colorClass} rounded-full text-sm font-bold shadow-sm`}>{countValue}</span>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        {stats?.byPriority && (Array.isArray(stats.byPriority) ? stats.byPriority.length > 0 : Object.keys(stats.byPriority).length > 0) && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Öncelik Dağılımı</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {(Array.isArray(stats.byPriority) 
                ? stats.byPriority
                : Object.entries(stats.byPriority)
              ).map((item: any, index: number) => {
                const priority = Array.isArray(item) ? item[0] : item.priority;
                const count = Array.isArray(item) ? item[1] : item.count;
                const colors: Record<string, { bg: string; text: string; gradient: string; icon: string }> = {
                  Critical: { 
                    bg: 'bg-red-100', 
                    text: 'text-red-700', 
                    gradient: 'from-red-500 to-red-600',
                    icon: '🔴'
                  },
                  High: { 
                    bg: 'bg-orange-100', 
                    text: 'text-orange-700', 
                    gradient: 'from-orange-500 to-orange-600',
                    icon: '🟠'
                  },
                  Normal: { 
                    bg: 'bg-blue-100', 
                    text: 'text-blue-700', 
                    gradient: 'from-blue-500 to-blue-600',
                    icon: '🔵'
                  },
                  Low: { 
                    bg: 'bg-green-100', 
                    text: 'text-green-700', 
                    gradient: 'from-green-500 to-green-600',
                    icon: '🟢'
                  },
                };
                const color = colors[priority] || colors.Normal;
                const countValue = typeof count === 'number' ? count : (typeof count === 'object' && count !== null ? (count as any).count || 0 : 0);
                
                return (
                  <div key={priority} className="text-center p-4 rounded-xl hover:shadow-md transition-all duration-200 bg-gradient-to-br from-gray-50 to-white border border-gray-100">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <span className="text-lg">{color.icon}</span>
                      <p className="text-sm font-semibold text-gray-700">{priority}</p>
                    </div>
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${color.gradient} text-white shadow-lg mb-2 transform hover:scale-110 transition-transform duration-200`}>
                      <span className="text-3xl font-bold">{countValue}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">talep</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

