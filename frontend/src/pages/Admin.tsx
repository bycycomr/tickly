import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { Building2, Plus, Users, UserPlus, AlertCircle, Trash2 } from 'lucide-react';
import type { Department } from '../lib/types';

type Member = {
  id: string;
  username: string;
  displayName?: string;
  role: number;
};

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'departments' | 'users'>('departments');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [selectedDept, setSelectedDept] = useState<number | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [assignUserId, setAssignUserId] = useState('');
  const [assignRole, setAssignRole] = useState('DepartmentManager');
  
  // User creation states
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newDepartmentId, setNewDepartmentId] = useState<number | ''>('');
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadDepartments();
    loadUsers(); // Her zaman yükle, kullanıcı dropdown için gerekli
    if (activeTab === 'users') {
      // Kullanıcılar tabındayken zaten yüklenecek
    }
  }, [activeTab]);

  async function loadDepartments() {
    setLoading(true);
    try {
      const depts = await api.getDepartments();
      setDepartments(depts);
    } catch (err) {
      setError('Departmanlar yuklenemedi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function createDept(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newName.trim()) {
      setError('Departman adi gereklidir');
      return;
    }

    try {
      const dept = await api.createDepartment({
        name: newName.trim(),
        description: newDesc.trim() || undefined,
      });
      setDepartments((prev) => [...prev, dept]);
      setNewName('');
      setNewDesc('');
      toast.success('Departman başarıyla oluşturuldu');
      setSuccess('Departman basariyla olusturuldu');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || 'Departman oluşturulamadı';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  }

  async function deleteDept(deptId: number) {
    if (!confirm('Bu departmanı silmek istediğinizden emin misiniz?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await api.deleteDepartment(deptId);
      setDepartments((prev) => prev.filter(d => d.id !== deptId));
      toast.success('Departman başarıyla silindi');
      setSuccess('Departman başarıyla silindi');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || 'Departman silinemedi';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  }

  async function loadMembers(deptId: number) {
    try {
      const memberList = await api.getDepartmentMembers(deptId);
      setMembers(memberList);
      setSelectedDept(selectedDept === deptId ? null : deptId);
    } catch (err) {
      setError('Uyeler yuklenemedi');
      console.error(err);
    }
  }

  async function assignUser(deptId: number) {
    setError('');
    setSuccess('');

    if (!assignUserId.trim()) {
      setError('Kullanici ID gereklidir');
      toast.error('Kullanıcı seçiniz');
      return;
    }

    try {
      await api.assignDepartmentRole(deptId, assignUserId.trim(), assignRole);
      toast.success('Rol basariyla atandi');
      setSuccess('Rol basariyla atandi');
      setAssignUserId('');
      loadMembers(deptId);
      loadUsers(); // Kullanıcı listesini güncelle
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Rol atamasi basarisiz';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm('Bu kullanıcıyı arşivlemek istediğinizden emin misiniz?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await api.deleteUser(userId);
      toast.success('Kullanıcı başarıyla arşivlendi');
      setSuccess('Kullanıcı başarıyla arşivlendi');
      loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || 'Kullanıcı arşivlenemedi';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newUsername.trim() || !newEmail.trim() || !newPassword.trim()) {
      setError('Kullanıcı adı, email ve şifre gereklidir');
      return;
    }

    try {
      const result = await api.register({
        username: newUsername.trim(),
        email: newEmail.trim(),
        password: newPassword,
        displayName: newDisplayName.trim() || newUsername.trim()
      });
      
      // Eğer departman seçildiyse, kullanıcıyı departmana ata
      if (newDepartmentId && result.user?.id) {
        try {
          await api.assignDepartmentRole(
            newDepartmentId as number,
            result.user.id,
            'EndUser'
          );
        } catch (assignErr) {
          console.error('Departman ataması başarısız:', assignErr);
        }
      }
      
      setSuccess(`Kullanıcı başarıyla oluşturuldu: ${newUsername}${newJobTitle ? ` (${newJobTitle})` : ''}`);
      setNewUsername('');
      setNewEmail('');
      setNewPassword('');
      setNewDisplayName('');
      setNewJobTitle('');
      setNewDepartmentId('');
      loadUsers();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Kullanıcı oluşturulamadı');
    }
  }

  async function loadUsers() {
    setLoadingUsers(true);
    try {
      const userList = await api.getUsers();
      setUsers(userList);
    } catch (err) {
      console.error('Kullanıcılar yüklenemedi', err);
      toast.error('Kullanıcılar yüklenemedi');
    } finally {
      setLoadingUsers(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building2 className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('departments')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'departments'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Building2 className="w-5 h-5 inline mr-2" />
            Departmanlar
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <UserPlus className="w-5 h-5 inline mr-2" />
            Kullanıcılar
          </button>
        </nav>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-start">
          <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4">
          {success}
        </div>
      )}

      {activeTab === 'departments' && (
        <>
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Yeni Departman Olustur</h2>
          <form onSubmit={createDept} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="deptName" className="label">
                  Departman Adi <span className="text-red-500">*</span>
                </label>
                <input
                  id="deptName"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="input"
                  placeholder="Orn: Bilgi Islem"
                  required
                />
              </div>
              <div>
                <label htmlFor="deptDesc" className="label">
                  Aciklama
                </label>
                <input
                  id="deptDesc"
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="input"
                  placeholder="Departman aciklamasi"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              <Plus size={18} className="mr-2" />
              Departman Olustur
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Departmanlar</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : departments.length === 0 ? (
            <div className="card text-center py-12 text-gray-500">
              Henuz departman bulunmuyor
            </div>
          ) : (
            departments.map((dept) => (
              <div key={dept.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start">
                    <Building2 className="text-primary-600 mr-3 mt-1" size={24} />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{dept.name}</h3>
                      {dept.description && (
                        <p className="text-sm text-gray-600 mt-1">{dept.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => loadMembers(dept.id)}
                      className="btn btn-secondary"
                    >
                      <Users size={18} className="mr-2" />
                      {selectedDept === dept.id ? 'Uyeleri Gizle' : 'Uyeleri Goster'}
                    </button>
                    <button
                      onClick={() => deleteDept(dept.id)}
                      className="btn bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {selectedDept === dept.id && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Departman Uyeleri</h4>
                    
                    {members.length === 0 ? (
                      <p className="text-sm text-gray-500 mb-4">Henuz uye bulunmuyor</p>
                    ) : (
                      <div className="overflow-x-auto mb-6">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Kullanici ID</th>
                              <th>Kullanici Adi</th>
                              <th>Ad Soyad</th>
                              <th>Rol</th>
                            </tr>
                          </thead>
                          <tbody>
                            {members.map((member) => (
                              <tr key={member.id}>
                                <td className="font-mono text-xs">{member.id}</td>
                                <td>{member.username}</td>
                                <td>{member.displayName || '-'}</td>
                                <td>
                                  <span className="badge badge-info">
                                    {member.role === 0
                                      ? 'Manager'
                                      : member.role === 1
                                      ? 'Staff'
                                      : 'End User'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-3">Kullanici Ata</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label htmlFor={`userId-${dept.id}`} className="label">
                            Kullanıcı Seçin
                          </label>
                          <select
                            id={`userId-${dept.id}`}
                            value={assignUserId}
                            onChange={(e) => setAssignUserId(e.target.value)}
                            className="select"
                          >
                            <option value="">Kullanıcı seçiniz...</option>
                            {users.map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.displayName} ({user.username})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor={`role-${dept.id}`} className="label">
                            Rol
                          </label>
                          <select
                            id={`role-${dept.id}`}
                            value={assignRole}
                            onChange={(e) => setAssignRole(e.target.value)}
                            className="select"
                          >
                            <option value="DepartmentManager">Departman Yoneticisi</option>
                            <option value="DepartmentStaff">Departman Calisani</option>
                            <option value="EndUser">Son Kullanici</option>
                          </select>
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={() => assignUser(dept.id)}
                            className="btn btn-primary w-full"
                            disabled={!assignUserId}
                          >
                            <UserPlus size={18} className="mr-2" />
                            Ata
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        </>
      )}

      {activeTab === 'users' && (
        <>
          <div className="card mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Yeni Kullanıcı Oluştur</h2>
            <p className="text-sm text-gray-600 mb-4">
              Yeni kullanıcı oluşturduktan sonra, <strong>Departmanlar</strong> sekmesinden ilgili departmanı seçip kullanıcıyı atayabilirsiniz.
            </p>
            <form onSubmit={createUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="username" className="label">
                    Kullanıcı Adı <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="input"
                    placeholder="kullaniciadi"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="label">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="input"
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="displayName" className="label">
                    Ad Soyad <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className="input"
                    placeholder="Ad Soyad"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="jobTitle" className="label">
                    Ünvan
                  </label>
                  <input
                    id="jobTitle"
                    type="text"
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    className="input"
                    placeholder="Yazılım Geliştirici, Müdür, vb."
                  />
                </div>
                <div>
                  <label htmlFor="password" className="label">
                    Şifre <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input"
                    placeholder="********"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="department" className="label">
                    Departman
                  </label>
                  <select
                    id="department"
                    value={newDepartmentId}
                    onChange={(e) => setNewDepartmentId(e.target.value ? Number(e.target.value) : '')}
                    className="input"
                  >
                    <option value="">Departman Seçiniz (Opsiyonel)</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary">
                <UserPlus size={18} className="mr-2 inline" />
                Kullanıcı Oluştur
              </button>
            </form>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Kullanıcı Yönetimi</h3>
            
            {loadingUsers ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Henüz kullanıcı bulunmuyor. Yukarıdaki formu kullanarak kullanıcı oluşturun.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Ad Soyad</th>
                      <th>Kullanıcı Adı</th>
                      <th>Email</th>
                      <th>Departman</th>
                      <th>Roller</th>
                      <th>Durum</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const userDept = departments.find(d => d.id === user.departmentId);
                      return (
                        <tr key={user.id}>
                          <td className="font-medium">{user.displayName}</td>
                          <td className="text-sm text-gray-600">{user.username}</td>
                          <td className="text-sm text-gray-600">{user.email}</td>
                          <td className="text-sm">{userDept?.name || '—'}</td>
                          <td>
                            {user.roles && user.roles.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {user.roles.map((role: string, idx: number) => (
                                  <span key={idx} className="badge badge-info text-xs">
                                    {role}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${user.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                              {user.status}
                            </span>
                          </td>
                          <td>
                            {user.status === 'Active' && (
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-800 text-sm flex items-center"
                              >
                                <Trash2 size={16} className="mr-1" />
                                Arşivle
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-2">Kullanıcı Oluşturduktan Sonra:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li><strong>Departmanlar</strong> sekmesine gidin</li>
                    <li>İlgili departmanı seçip <strong>"Üyeleri Göster"</strong> butonuna tıklayın</li>
                    <li>En altta <strong>"Kullanıcı Ata"</strong> bölümünden:
                      <ul className="list-disc list-inside ml-4 mt-1">
                        <li>Kullanıcıyı dropdown'dan seçin</li>
                        <li>Rol seçin (Departman Yöneticisi, Çalışan, veya Son Kullanıcı)</li>
                        <li><strong>"Ata"</strong> butonuna tıklayın</li>
                      </ul>
                    </li>
                  </ol>
                  <p className="mt-3 text-xs">
                    <strong>Not:</strong> Son Kullanıcı rolü, normal şirket çalışanları için kullanılır. Talep oluşturabilir ve kendi taleplerini görüntüleyebilirler.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
