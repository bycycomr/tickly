import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      toast.error('Geçersiz sıfırlama linki');
      navigate('/login');
      return;
    }
    setToken(tokenParam);
  }, [searchParams, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error('Tüm alanları doldurun');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword(token, newPassword);
      setSuccess(true);
      toast.success('Şifreniz başarıyla sıfırlandı');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Şifre sıfırlama başarısız');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Şifre Sıfırlandı
            </h2>
            <p className="text-gray-600 mb-6">
              Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full btn btn-primary"
            >
              <ArrowLeft size={18} className="mr-2" />
              Hemen Giriş Yap
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
            <Lock className="text-purple-600" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Yeni Şifre Oluştur
          </h2>
          <p className="text-gray-600">
            Hesabınız için yeni bir şifre belirleyin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Yeni Şifre
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="text-gray-400" size={20} />
              </div>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input pl-10"
                placeholder="En az 6 karakter"
                required
                minLength={6}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Şifre Tekrar
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="text-gray-400" size={20} />
              </div>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input pl-10"
                placeholder="Şifrenizi tekrar girin"
                required
                minLength={6}
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Şifre Güncelleniyor...' : 'Şifremi Güncelle'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-purple-600 hover:text-purple-700 font-medium inline-flex items-center"
          >
            <ArrowLeft size={16} className="mr-1" />
            Giriş sayfasına dön
          </Link>
        </div>
      </div>
    </div>
  );
}
