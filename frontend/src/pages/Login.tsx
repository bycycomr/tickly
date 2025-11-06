import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle, Ticket, Sparkles } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Kullanıcı adı ve şifre gereklidir');
      return;
    }

    try {
      setLoading(true);
      await login(username, password);
      toast.success('Giriş başarılı! Hoş geldiniz.');
      navigate('/dashboard');
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative backdrop-blur-sm bg-white/80 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-white/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 text-white mb-4 shadow-lg transform hover:scale-110 transition-transform duration-300">
            <Ticket size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Tickly
          </h1>
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <Sparkles size={16} className="text-purple-500" />
            Modern Destek Talep Sistemi
            <Sparkles size={16} className="text-purple-500" />
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-6 flex items-start animate-shake">
            <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="group">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Kullanıcı Adı
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 group-hover:border-primary-300"
              placeholder="kullanici.adi"
              required
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="group">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 group-hover:border-primary-300"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-medium py-3.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Giriş yapılıyor...
              </div>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <LogIn size={20} />
                Giriş Yap
              </span>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link 
            to="/forgot-password" 
            className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
          >
            Şifremi unuttum
          </Link>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Hesabınız yok mu?{' '}
            <Link 
              to="/register" 
              className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-all"
            >
              Kayıt Olun
            </Link>
          </p>
        </div>

        {/* Demo credentials hint */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <p className="text-xs text-gray-600 text-center">
            <span className="font-semibold text-gray-700">Demo:</span> mehmet.kaya / Password123
          </p>
        </div>
      </div>
    </div>
  );
}

