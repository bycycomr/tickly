import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../lib/api';
import {
  Users,
  ClipboardList,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  UserPlus,
  Trash2,
} from 'lucide-react';
import type { Ticket, Department } from '../lib/types';
import { TicketStatus, TicketPriority } from '../lib/types';

type DepartmentStats = {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  completedTickets: number;
  averageResolutionTime: string;
  slaComplianceRate: number;
};

type StaffMember = {
  assignmentId: number;
  userId: string;
  username: string;
  displayName?: string;
  role: number;
  assignedTickets: number;
  completedTickets: number;
};

export default function DepartmentManager() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState<Department | null>(null);
  const [stats, setStats] = useState<DepartmentStats | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'staff'>('overview');

  // Staff management
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('DepartmentStaff');

  useEffect(() => {
    loadDepartmentData();
  }, []);

  async function loadDepartmentData() {
    setLoading(true);
    try {
      // Get user's department info
      const departments = await api.getDepartments();
      
      // For now, use the first department or create a method to get user's department
      // TODO: Backend should return user's department info
      const userDept = departments.length > 0 ? departments[0] : null;
      
      if (!userDept) {
        toast.error('Departman bulunamadı');
        return;
      }

      setDepartment(userDept);

      // Load department tickets
      const allTickets = await api.getTickets();
      const deptTickets = allTickets.filter((t: Ticket) => t.departmentId === userDept.id);
      setTickets(deptTickets);

      // Calculate stats
      const stats: DepartmentStats = {
        totalTickets: deptTickets.length,
        openTickets: deptTickets.filter((t: Ticket) => t.status === TicketStatus.New).length,
        inProgressTickets: deptTickets.filter((t: Ticket) => 
          t.status === TicketStatus.InProgress || t.status === TicketStatus.Assigned
        ).length,
        completedTickets: deptTickets.filter((t: Ticket) => 
          t.status === TicketStatus.Completed || t.status === TicketStatus.Closed
        ).length,
        averageResolutionTime: calculateAverageResolutionTime(deptTickets),
        slaComplianceRate: calculateSLACompliance(deptTickets),
      };
      setStats(stats);

      // Load staff members
      await loadStaffMembers(userDept.id);
    } catch (error) {
      console.error('Error loading department data:', error);
      toast.error('Departman bilgileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function loadStaffMembers(departmentId: number) {
    try {
      const members = await api.getDepartmentMembers(departmentId);
      
      // Calculate ticket counts for each member
      const membersWithStats = await Promise.all(
        members.map(async (member: any) => {
          const memberTickets = tickets.filter((t: Ticket) => t.assignedToUserId === member.userId);
          return {
            ...member,
            assignedTickets: memberTickets.filter((t: Ticket) => 
              t.status !== TicketStatus.Completed && t.status !== TicketStatus.Closed
            ).length,
            completedTickets: memberTickets.filter((t: Ticket) => 
              t.status === TicketStatus.Completed || t.status === TicketStatus.Closed
            ).length,
          };
        })
      );

      setStaffMembers(membersWithStats);
    } catch (error) {
      console.error('Error loading staff members:', error);
      toast.error('Personel listesi yüklenemedi');
    }
  }

  async function loadAllUsers() {
    try {
      const users = await api.getUsers();
      // Filter out users already in the department
      const availableUsers = users.filter(
        (u: any) => !staffMembers.some((m) => m.userId === u.id)
      );
      setAllUsers(availableUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Kullanıcı listesi yüklenemedi');
    }
  }

  async function handleAddStaff() {
    if (!selectedUserId || !department) {
      toast.error('Lütfen bir kullanıcı seçin');
      return;
    }

    try {
      await api.assignDepartmentRole(department.id, selectedUserId, selectedRole);
      toast.success('Personel başarıyla eklendi');
      setShowAddStaff(false);
      setSelectedUserId('');
      loadStaffMembers(department.id);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Personel eklenemedi');
    }
  }

  async function handleRemoveStaff(assignmentId: number) {
    if (!confirm('Bu personeli departmandan çıkarmak istediğinize emin misiniz?')) {
      return;
    }

    try {
      // TODO: API method needed
      // await api.removeDepartmentRole(assignmentId);
      toast.error('Bu özellik henüz backend\'de implement edilmemiş');
      // toast.success('Personel departmandan çıkarıldı');
      // if (department) {
      //   loadStaffMembers(department.id);
      // }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Personel çıkarılamadı');
    }
  }

  function calculateAverageResolutionTime(tickets: Ticket[]): string {
    const completedTickets = tickets.filter(
      (t) => t.status === TicketStatus.Completed || t.status === TicketStatus.Closed
    );

    if (completedTickets.length === 0) return 'N/A';

    const totalHours = completedTickets.reduce((sum, ticket) => {
      const created = new Date(ticket.createdAt);
      const updated = new Date(ticket.updatedAt);
      const hours = (updated.getTime() - created.getTime()) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);

    const avgHours = totalHours / completedTickets.length;
    
    if (avgHours < 24) {
      return `${Math.round(avgHours)} saat`;
    } else {
      return `${Math.round(avgHours / 24)} gün`;
    }
  }

  function calculateSLACompliance(tickets: Ticket[]): number {
    if (tickets.length === 0) return 100;

    const slaMetTickets = tickets.filter((t) => {
      if (!t.dueAt) return true;
      const now = new Date();
      const due = new Date(t.dueAt);
      return now <= due || t.status === TicketStatus.Completed || t.status === TicketStatus.Closed;
    });

    return Math.round((slaMetTickets.length / tickets.length) * 100);
  }

  function getPriorityBadgeColor(priority: TicketPriority): string {
    const colors: Record<number, string> = {
      [TicketPriority.Low]: 'bg-gray-200 text-gray-700',
      [TicketPriority.Normal]: 'bg-blue-100 text-blue-700',
      [TicketPriority.High]: 'bg-orange-200 text-orange-800',
      [TicketPriority.Urgent]: 'bg-red-500 text-white font-bold',
    };
    return colors[priority] || 'bg-gray-200 text-gray-700';
  }

  function getStatusBadgeColor(status: TicketStatus): string {
    const colors: Record<number, string> = {
      [TicketStatus.New]: 'bg-blue-100 text-blue-800',
      [TicketStatus.Assigned]: 'bg-purple-100 text-purple-800',
      [TicketStatus.InProgress]: 'bg-yellow-100 text-yellow-800',
      [TicketStatus.WaitingForInfo]: 'bg-orange-100 text-orange-800',
      [TicketStatus.Completed]: 'bg-green-100 text-green-800',
      [TicketStatus.Closed]: 'bg-gray-100 text-gray-800',
      [TicketStatus.Rejected]: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Departman Bulunamadı</h2>
          <p className="text-gray-600 mt-2">
            Bu sayfayı görüntülemek için bir departmana atanmış olmanız gerekir.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{department.name}</h1>
          <p className="text-gray-600 mt-2">
            {department.description || 'Departman Yönetim Paneli'}
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClipboardList className="h-10 w-10 text-blue-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Toplam Talep</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTickets}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-10 w-10 text-orange-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Açık Talepler</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.openTickets + stats.inProgressTickets}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-10 w-10 text-purple-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ort. Çözüm Süresi</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.averageResolutionTime}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-10 w-10 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">SLA Uyumu</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.slaComplianceRate}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="inline-block mr-2 h-5 w-5" />
              Genel Bakış
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tickets'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ClipboardList className="inline-block mr-2 h-5 w-5" />
              Talepler ({tickets.length})
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'staff'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="inline-block mr-2 h-5 w-5" />
              Personel ({staffMembers.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Durum Dağılımı
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Yeni</span>
                    <span className="font-medium">{stats?.openTickets || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${((stats?.openTickets || 0) / (stats?.totalTickets || 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">İşlemde</span>
                    <span className="font-medium">{stats?.inProgressTickets || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{
                        width: `${((stats?.inProgressTickets || 0) / (stats?.totalTickets || 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Tamamlandı</span>
                    <span className="font-medium">{stats?.completedTickets || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${((stats?.completedTickets || 0) / (stats?.totalTickets || 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Personel İş Yükü
              </h3>
              <div className="space-y-3">
                {staffMembers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Henüz personel bulunmuyor
                  </p>
                ) : (
                  staffMembers.map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {member.displayName || member.username}
                        </p>
                        <p className="text-sm text-gray-600">
                          {member.role === 0 ? 'Manager' : 'Staff'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Açık</p>
                          <p className="font-semibold text-orange-600">
                            {member.assignedTickets}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Tamamlandı</p>
                          <p className="font-semibold text-green-600">
                            {member.completedTickets}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="card">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Başlık</th>
                    <th>Durum</th>
                    <th>Öncelik</th>
                    <th>Atanan</th>
                    <th>Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        Henüz talep bulunmuyor
                      </td>
                    </tr>
                  ) : (
                    tickets.map((ticket) => (
                      <tr key={ticket.id}>
                        <td className="font-mono text-sm">#{ticket.id}</td>
                        <td>
                          <a
                            href={`/tickets/${ticket.id}`}
                            className="text-primary-600 hover:text-primary-800 font-medium"
                          >
                            {ticket.title}
                          </a>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeColor(ticket.status)}`}>
                            {TicketStatus[ticket.status]}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getPriorityBadgeColor(ticket.priority)}`}>
                            {['Low', 'Normal', 'High', 'Urgent'][ticket.priority]}
                          </span>
                        </td>
                        <td className="text-sm text-gray-600">
                          {ticket.assignedToUserId || '-'}
                        </td>
                        <td className="text-sm text-gray-600">
                          {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Departman Personeli
              </h3>
              <button
                onClick={() => {
                  setShowAddStaff(!showAddStaff);
                  if (!showAddStaff) loadAllUsers();
                }}
                className="btn btn-primary"
              >
                <UserPlus size={18} className="mr-2" />
                Personel Ekle
              </button>
            </div>

            {showAddStaff && (
              <div className="card bg-blue-50 border-blue-200">
                <h4 className="text-md font-semibold text-gray-900 mb-4">
                  Yeni Personel Ekle
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Kullanıcı</label>
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="select"
                    >
                      <option value="">Kullanıcı seçin</option>
                      {allUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.displayName || user.username} ({user.username})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Rol</label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="select"
                    >
                      <option value="DepartmentManager">Manager</option>
                      <option value="DepartmentStaff">Staff</option>
                    </select>
                  </div>
                  <div className="flex items-end space-x-2">
                    <button
                      onClick={handleAddStaff}
                      disabled={!selectedUserId}
                      className="btn btn-primary flex-1"
                    >
                      Ekle
                    </button>
                    <button
                      onClick={() => {
                        setShowAddStaff(false);
                        setSelectedUserId('');
                      }}
                      className="btn btn-secondary"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="card">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Ad Soyad</th>
                      <th>Kullanıcı Adı</th>
                      <th>Rol</th>
                      <th>Açık Talepler</th>
                      <th>Tamamlanan</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffMembers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">
                          Henüz personel bulunmuyor
                        </td>
                      </tr>
                    ) : (
                      staffMembers.map((member) => (
                        <tr key={member.userId}>
                          <td className="font-medium">
                            {member.displayName || '-'}
                          </td>
                          <td className="text-gray-600">{member.username}</td>
                          <td>
                            <span className="badge badge-info">
                              {member.role === 0 ? 'Manager' : 'Staff'}
                            </span>
                          </td>
                          <td>
                            <span className="text-orange-600 font-semibold">
                              {member.assignedTickets}
                            </span>
                          </td>
                          <td>
                            <span className="text-green-600 font-semibold">
                              {member.completedTickets}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => handleRemoveStaff(member.assignmentId)}
                              className="text-red-600 hover:text-red-800"
                              title="Departmandan Çıkar"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
