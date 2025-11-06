import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Building2, Plus, Users, UserPlus, AlertCircle } from 'lucide-react';
import type { Department } from '../lib/types';

type Member = {
  id: string;
  username: string;
  displayName?: string;
  role: number;
};

export default function Admin() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [selectedDept, setSelectedDept] = useState<number | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [assignUserId, setAssignUserId] = useState('');
  const [assignRole, setAssignRole] = useState('DepartmentManager');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadDepartments();
  }, []);

  async function loadDepartments() {
    setLoading(true);
    try {
      const depts = await api.getDepartments();
      setDepartments(depts);
    } catch (err) {
      setError('Departmanlar yüklenemedi');
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
      setError('Departman adı gereklidir');
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
      setSuccess('Departman başarıyla oluşturuldu');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Departman oluşturulamadı');
    }
  }

  async function loadMembers(deptId: number) {
    try {
      const memberList = await api.getDepartmentMembers(deptId);
      setMembers(memberList);
      setSelectedDept(selectedDept === deptId ? null : deptId);
    } catch (err) {
      setError('Üyeler yüklenemedi');
      console.error(err);
    }
  }

  async function assignUser(deptId: number) {
    setError('');
    setSuccess('');

    if (!assignUserId.trim()) {
      setError('Kullanıcı ID gereklidir');
      return;
    }

    try {
      await api.assignDepartmentRole(deptId, assignUserId.trim(), assignRole);
      setSuccess('Rol başarıyla atandı');
      setAssignUserId('');
      loadMembers(deptId);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Rol ataması başarısız');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <Building2 className="text-primary-600 mr-3" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Departman Yönetimi</h1>
          </div>
          <p className="text-gray-600">Departmanları yönetin ve kullanıcılara rol atayın</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6 flex items-start">
            <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-6">
            {success}
          </div>
        )}

        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Yeni Departman Oluştur</h2>
          <form onSubmit={createDept} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="deptName" className="label">
                  Departman Adı <span className="text-red-500">*</span>
                </label>
                <input
                  id="deptName"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="input"
                  placeholder="Örn: Bilgi İşlem"
                  required
                />
              </div>
              <div>
                <label htmlFor="deptDesc" className="label">
                  Açıklama
                </label>
                <input
                  id="deptDesc"
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="input"
                  placeholder="Departman açıklaması"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              <Plus size={18} className="mr-2" />
              Departman Oluştur
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
              Henüz departman bulunmuyor
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
                  <button
                    onClick={() => loadMembers(dept.id)}
                    className="btn btn-secondary"
                  >
                    <Users size={18} className="mr-2" />
                    {selectedDept === dept.id ? 'Üyeleri Gizle' : 'Üyeleri Göster'}
                  </button>
                </div>

                {selectedDept === dept.id && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Departman Üyeleri</h4>
                    
                    {members.length === 0 ? (
                      <p className="text-sm text-gray-500 mb-4">Henüz üye bulunmuyor</p>
                    ) : (
                      <div className="overflow-x-auto mb-6">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Kullanıcı ID</th>
                              <th>Kullanıcı Adı</th>
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
                      <h5 className="text-sm font-semibold text-gray-900 mb-3">Kullanıcı Ata</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label htmlFor={`userId-${dept.id}`} className="label">
                            Kullanıcı ID
                          </label>
                          <input
                            id={`userId-${dept.id}`}
                            type="text"
                            value={assignUserId}
                            onChange={(e) => setAssignUserId(e.target.value)}
                            className="input"
                            placeholder="Kullanıcı ID girin"
                          />
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
                            <option value="DepartmentManager">Departman Yöneticisi</option>
                            <option value="DepartmentStaff">Departman Çalışanı</option>
                            <option value="EndUser">Son Kullanıcı</option>
                          </select>
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={() => assignUser(dept.id)}
                            className="btn btn-primary w-full"
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
      </div>
    </div>
  );
}
