import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { BookOpen, ThumbsUp, Eye, Tag, ArrowLeft, Calendar, Building2, FolderTree } from 'lucide-react';
import type { Article } from '../lib/types';

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (slug) {
      loadArticle(slug);
    }
  }, [slug]);

  async function loadArticle(articleSlug: string) {
    setLoading(true);
    try {
      const data = await api.getArticle(articleSlug);
      setArticle(data);
    } catch (err: any) {
      console.error('Makale yüklenemedi', err);
      toast.error('Makale bulunamadı');
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkHelpful() {
    if (!article) return;

    setMarking(true);
    try {
      const result = await api.markArticleHelpful(article.id);
      setArticle((prev) => (prev ? { ...prev, helpfulCount: result.helpfulCount } : null));
      toast.success('Geri bildiriminiz için teşekkürler!');
    } catch (err) {
      console.error('İşaretleme başarısız', err);
      toast.error('Bir hata oluştu');
    } finally {
      setMarking(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="card text-center py-12">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg mb-4">Makale bulunamadı</p>
        <Link to="/kb" className="text-primary-600 hover:text-primary-800">
          ← Bilgi Bankasına Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Link to="/kb" className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Bilgi Bankasına Dön
      </Link>

      {/* Article Header */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {article.publishedAt && (
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(article.publishedAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              )}
              
              {article.departmentName && (
                <span className="flex items-center">
                  <Building2 className="w-4 h-4 mr-1" />
                  {article.departmentName}
                </span>
              )}
              
              {article.categoryName && (
                <span className="flex items-center">
                  <FolderTree className="w-4 h-4 mr-1" />
                  {article.categoryName}
                </span>
              )}
              
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {article.viewCount} görüntülenme
              </span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {article.tags && (
          <div className="flex flex-wrap gap-2 mb-6">
            {article.tags.split(',').map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Summary */}
        {article.summary && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="text-sm text-blue-900 font-medium">{article.summary}</p>
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-blue max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br/>') }}
        />

        {/* Helpful Button */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Bu makale yardımcı oldu mu?</p>
              <p className="text-xs text-gray-500">
                {article.helpfulCount} kişi bu makaleyi faydalı buldu
              </p>
            </div>
            <button
              onClick={handleMarkHelpful}
              disabled={marking}
              className="btn btn-primary flex items-center"
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              {marking ? 'İşleniyor...' : 'Evet, Yardımcı Oldu'}
            </button>
          </div>
        </div>
      </div>

      {/* Related Articles - Placeholder */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">İlgili Makaleler</h2>
        <p className="text-sm text-gray-500">
          Yakında ilgili makaleler burada görünecek.
        </p>
      </div>
    </div>
  );
}
