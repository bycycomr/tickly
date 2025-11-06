import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import {
  LayoutDashboard,
  Ticket,
  AlertCircle,
  Clock,
  TrendingUp,
  Users,
  Plus,
  LogOut,
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
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError('Dashboard yüklenemedi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <LayoutDashboard className="text-primary-600 mr-3" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Hoş geldiniz, <span className="font-medium">{user?.displayName || user?.username}</span>
                </p>
              </div>
            </div>
            <button onClick={logout} className="btn btn-ghost">
              <LogOut size={18} className="mr-2" />
              Çıkış
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6 flex items-start">
            <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Talep</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.totalTickets || 0}
                </p>
              </div>
              <div className="bg-primary-100 p-3 rounded-lg">
                <Ticket className="text-primary-600" size={24} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Açık Talep</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {stats?.openTickets || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <AlertCircle className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Geciken</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {stats?.overdueTickets || 0}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <Clock className="text-red-600" size={24} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">SLA Uyum</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats?.slaComplianceRate ? `${Math.round(stats.slaComplianceRate)}%` : 'N/A'}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h2>
            <div className="space-y-3">
              <Link to="/tickets/create" className="btn btn-primary w-full">
                <Plus size={18} className="mr-2" />
                Yeni Talep Oluştur
              </Link>
              <Link to="/tickets" className="btn btn-secondary w-full">
                <Ticket size={18} className="mr-2" />
                Tüm Talepleri Görüntüle
              </Link>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Durum Dağılımı</h2>
            <div className="space-y-2">
              {stats?.byStatus && Object.entries(stats.byStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{status}</span>
                  <span className="badge badge-info">{count as number}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        {stats?.byPriority && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Öncelik Dağılımı</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.byPriority).map(([priority, count]) => {
                const colors: Record<string, string> = {
                  Critical: 'badge-danger',
                  High: 'badge-warning',
                  Medium: 'badge-info',
                  Low: 'badge-success',
                };
                return (
                  <div key={priority} className="text-center">
                    <p className="text-sm text-gray-600 mb-2">{priority}</p>
                    <span className={`badge ${colors[priority] || 'badge-info'} text-lg px-4 py-2`}>
                      {count as number}
                    </span>
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

