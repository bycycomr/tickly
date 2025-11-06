import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle } from 'lucide-react';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!username || !email || !password || !displayName) {
      setError('Tüm alanları doldurunuz');
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    try {
      setLoading(true);
      await register(username, email, password, displayName);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Kayıt başarısız. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-600 text-white mb-4">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Kayıt Ol</h1>
          <p className="text-gray-600 mt-2">Yeni hesap oluşturun</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6 flex items-start">
            <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="label">
              Kullanıcı Adı
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              placeholder="kullaniciadi"
              required
              autoFocus
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="email" className="label">
              E-posta
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="ornek@email.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="displayName" className="label">
              Ad Soyad
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input"
              placeholder="Ad Soyad"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="label">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="En az 6 karakter"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="label">
              Şifre Tekrar
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              placeholder="Şifrenizi tekrar girin"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Kayıt yapılıyor...
              </div>
            ) : (
              'Kayıt Ol'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Hesabınız var mı?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Giriş Yapın
          </Link>
        </div>
      </div>
    </div>
  );
}
