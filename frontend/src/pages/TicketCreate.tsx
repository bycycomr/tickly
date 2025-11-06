import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { ArrowLeft, Send, AlertCircle, Clock } from 'lucide-react';
import type { Category, Department, SLAPlan } from '../lib/types';

export default function TicketCreate() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(2); // Medium
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [departmentId, setDepartmentId] = useState<number | undefined>();
  const [slaPlanId, setSlaPlanId] = useState<number | undefined>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [slaPlans, setSlaPlans] = useState<SLAPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [cats, depts, plans] = await Promise.all([
        api.getCategories(),
        api.getDepartments(),
        api.getSLAPlans(),
      ]);
      setCategories(cats);
      setDepartments(depts);
      setSlaPlans(plans);
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
      toast.error('Başlık gereklidir');
      return;
    }

    try {
      setSaving(true);
      const ticket = await api.createTicket({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        categoryId,
        departmentId,
        slaPlanId,
        status: 0, // Open
        channel: 2, // Web
      });
      toast.success('Talep başarıyla oluşturuldu!');
      navigate(`/tickets/${ticket.id}`);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || 'Ticket oluşturulurken hata oluştu';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden py-8">
      {/* Animated blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/tickets"
            className="group inline-flex items-center px-4 py-2 text-sm font-medium text-purple-700 bg-white/80 backdrop-blur-xl rounded-full border-2 border-white/50 hover:bg-white hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Geri Dön
          </Link>
        </div>

        <div className="glass bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/50 p-6 sm:p-8 animate-slide-up">
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl hover:scale-110 hover:rotate-6 transition-all duration-300">
                <Send size={28} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Yeni Talep Oluştur</h1>
            </div>
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

            <div>
              <label htmlFor="sla" className="label">
                <Clock size={16} className="inline mr-1" />
                SLA Planı (Opsiyonel)
              </label>
              <select
                id="sla"
                value={slaPlanId || ''}
                onChange={(e) => setSlaPlanId(e.target.value ? Number(e.target.value) : undefined)}
                className="select"
                disabled={saving}
              >
                <option value="">Otomatik (önceliğe göre)</option>
                {slaPlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - Yanıt: {plan.responseTimeMinutes}dk, Çözüm: {plan.resolutionTimeMinutes}dk
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Boş bırakırsanız, önceliğe göre otomatik SLA atanacaktır
              </p>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <Link to="/tickets" className="btn btn-ghost">
                İptal
              </Link>
              <button type="submit" className="btn btn-primary bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300" disabled={saving}>
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

