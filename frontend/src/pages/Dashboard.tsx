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
  const [userDepartment, setUserDepartment] = useState<number | undefined>(undefined);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      
      // Kullanıcının departmanını ve rolünü kontrol et
      // Eğer SuperAdmin değilse, departman bazlı stats çek
      const isSuperAdmin = user?.roles?.includes('SuperAdmin');
      
      // Eğer kullanıcı bir departmana atanmışsa, o departmanın stats'ını göster
      // Bu bilgiyi user context'ten veya API'den alabiliriz
      const data = await api.getDashboardStats(undefined, userDepartment);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg">
                <LayoutDashboard className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Hoş geldiniz, <span className="font-semibold text-primary-600">{user?.displayName || user?.username}</span>
                </p>
              </div>
            </div>
            <button onClick={logout} className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200">
              <LogOut size={18} />
              <span className="font-medium">Çıkış</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-6 flex items-start animate-shake">
            <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Talep</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.total || stats?.totalTickets || 0}
                </p>
              </div>
              <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-4 rounded-xl">
                <Ticket className="text-primary-600" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Açık Talep</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {stats?.openTickets || 0}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-xl">
                <AlertCircle className="text-blue-600" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Geciken</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {stats?.overdueTickets || 0}
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-100 to-red-200 p-4 rounded-xl">
                <Clock className="text-red-600" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">SLA Uyum</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats?.slaComplianceRate ? `${Math.round(stats.slaComplianceRate)}%` : 'N/A'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-xl">
                <TrendingUp className="text-green-600" size={28} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="text-primary-600" size={20} />
              Hızlı İşlemler
            </h2>
            <div className="space-y-3">
              <Link 
                to="/tickets/create" 
                className="flex items-center gap-3 w-full px-4 py-3 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
              >
                <Plus size={20} />
                <span className="font-medium">Yeni Talep Oluştur</span>
              </Link>
              <Link 
                to="/tickets" 
                className="flex items-center gap-3 w-full px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]"
              >
                <Ticket size={20} />
                <span className="font-medium">Tüm Talepleri Görüntüle</span>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Durum Dağılımı</h2>
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

