import React, { useEffect, useState } from 'react'
import api from '../lib/api'

type Department = { id: number; name: string; description?: string }
type Member = { id: string; username: string; displayName?: string; role: number }

export default function Admin() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<Record<number, Member[]>>({})
  const [assignUserId, setAssignUserId] = useState('')
  const [assignRole, setAssignRole] = useState('DepartmentManager')

  async function load() {
    setLoading(true)
    try {
      const res = await api.get('/api/admin/departments')
      setDepartments(res.data)
    } catch (e) {
      console.error(e)
      alert('Departmanlar yüklenemedi')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function createDept(e: React.FormEvent) {
    e.preventDefault()
    if (!newName) return alert('İsim gerekli')
    try {
      const res = await api.post('/api/admin/departments', { Name: newName, Description: newDesc })
      setDepartments(prev => [...prev, res.data])
      setNewName('')
      setNewDesc('')
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Oluşturulamadı')
    }
  }

  async function loadMembers(id: number) {
    try {
      const res = await api.get(`/api/admin/departments/${id}/members`)
      setSelectedMembers(prev => ({ ...prev, [id]: res.data }))
    } catch (e) { console.error(e); alert('Üyeler yüklenemedi') }
  }

  async function assignRoleToDept(id: number) {
    if (!assignUserId) return alert('UserId girin')
    try {
      await api.post(`/api/admin/departments/${id}/assign`, { UserId: assignUserId, Role: assignRole })
      alert('Rol atandı')
      loadMembers(id)
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Atama hatası')
    }
  }

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Admin - Departmanlar</h2>
        </div>

        <form onSubmit={createDept} style={{ display: 'flex', gap: 8, marginTop: 12, marginBottom: 16, alignItems: 'center' }} className="admin-create">
          <div style={{ flex: 1 }}>
            <label>Departman Adı</label>
            <input placeholder="Departman adı" value={newName} onChange={e => setNewName(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label>Açıklama</label>
            <input placeholder="Açıklama" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn btn-primary" type="submit">Oluştur</button>
          </div>
        </form>

        {loading ? <div>Yükleniyor...</div> : (
          departments.length === 0 ? <div>Henüz departman yok.</div> : (
            <div className="dept-list">
              {departments.map(d => (
                <div key={d.id} className="dept-card card" style={{ marginBottom: 12 }}>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <div>
                      <strong style={{ fontSize: 16 }}>{d.name}</strong>
                      <div className="muted" style={{ fontSize: 13 }}>{d.description}</div>
                    </div>
                    <div className="dept-actions">
                      <button className="btn btn-ghost" onClick={() => loadMembers(d.id)}>Üyeleri Göster</button>
                    </div>
                  </div>

                  {selectedMembers[d.id] && (
                    <div style={{ marginTop: 12 }}>
                      <h4 style={{ margin: '6px 0' }}>Üyeler</h4>
                      <div className="table-wrap">
                        <table className="table">
                          <thead><tr><th>Id</th><th>Kullanıcı</th><th>Ad</th><th>Rol</th></tr></thead>
                          <tbody>
                            {selectedMembers[d.id].map(m => (
                              <tr key={m.id}><td style={{ width: 180 }}>{m.id}</td><td>{m.username}</td><td>{m.displayName}</td><td>{String(m.role)}</td></tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <label>UserId</label>
                          <input placeholder="UserId" value={assignUserId} onChange={e => setAssignUserId(e.target.value)} />
                        </div>
                        <div style={{ width: 220 }}>
                          <label>Rol</label>
                          <select value={assignRole} onChange={e => setAssignRole(e.target.value)}>
                            <option>DepartmentManager</option>
                            <option>DepartmentStaff</option>
                            <option>EndUser</option>
                          </select>
                        </div>
                        <div>
                          <label>&nbsp;</label>
                          <button className="btn btn-primary" onClick={() => assignRoleToDept(d.id)}>Ata</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
