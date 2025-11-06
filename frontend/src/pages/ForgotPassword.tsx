import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!email) {
      toast.error('Email adresi gereklidir');
      return;
    }

    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
      toast.success('Şifre sıfırlama linki email adresinize gönderildi');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Email Gönderildi
            </h2>
            <p className="text-gray-600 mb-6">
              Şifre sıfırlama linki <strong>{email}</strong> adresine gönderildi. 
              Lütfen email kutunuzu kontrol edin.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Email gelmedi mi? Spam klasörünüzü kontrol edin veya birkaç dakika bekleyip tekrar deneyin.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full btn btn-primary"
            >
              <ArrowLeft size={18} className="mr-2" />
              Giriş Sayfasına Dön
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
            <Mail className="text-purple-600" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Şifremi Unuttum
          </h2>
          <p className="text-gray-600">
            Email adresinizi girin, şifre sıfırlama linki gönderelim.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Adresi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="text-gray-400" size={20} />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-10"
                placeholder="ornek@email.com"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Gönderiliyor...' : 'Sıfırlama Linki Gönder'}
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
