import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { ArrowLeft, Send, AlertCircle } from 'lucide-react';
import type { Category, Department } from '../lib/types';

export default function TicketCreate() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(2); // Medium
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [departmentId, setDepartmentId] = useState<number | undefined>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [cats, depts] = await Promise.all([
        api.getCategories(),
        api.getDepartments(),
      ]);
      setCategories(cats);
      setDepartments(depts);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Başlık gereklidir');
      return;
    }

    try {
      setSaving(true);
      await api.createTicket({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        categoryId,
        departmentId,
        status: 0, // Open
        channel: 2, // Web
      });
      navigate('/tickets');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Ticket oluşturulurken hata oluştu');
    } finally {
      setSaving(false);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to="/tickets"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={16} className="mr-1" />
            Geri Dön
          </Link>
        </div>

        <div className="card">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Yeni Talep Oluştur</h1>
            <p className="text-sm text-gray-600 mt-1">
              Destek talebinizi detaylı bir şekilde açıklayın
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6 flex items-start">
              <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="label">
                Başlık <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="Sorununuzu kısaca özetleyin"
                required
                disabled={saving}
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {title.length}/200 karakter
              </p>
            </div>

            <div>
              <label htmlFor="description" className="label">
                Açıklama
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea"
                rows={6}
                placeholder="Sorununuzu detaylı bir şekilde açıklayın..."
                disabled={saving}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="priority" className="label">
                  Öncelik
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  className="select"
                  disabled={saving}
                >
                  <option value={0}>Düşük</option>
                  <option value={1}>Normal</option>
                  <option value={2}>Orta</option>
                  <option value={3}>Yüksek</option>
                  <option value={4}>Kritik</option>
                </select>
              </div>

              <div>
                <label htmlFor="department" className="label">
                  Departman
                </label>
                <select
                  id="department"
                  value={departmentId || ''}
                  onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : undefined)}
                  className="select"
                  disabled={saving}
                >
                  <option value="">Seçiniz</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="category" className="label">
                  Kategori
                </label>
                <select
                  id="category"
                  value={categoryId || ''}
                  onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
                  className="select"
                  disabled={saving}
                >
                  <option value="">Seçiniz</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <Link to="/tickets" className="btn btn-ghost">
                İptal
              </Link>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Oluşturuluyor...
                  </div>
                ) : (
                  <>
                    <Send size={18} className="mr-2" />
                    Talep Oluştur
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

