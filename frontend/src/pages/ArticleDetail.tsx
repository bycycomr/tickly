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
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="space-y-6">
        <div className="card text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-700 text-lg mb-4">Makale bulunamadı</p>
          <Link to="/kb" className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Bilgi Bankasına Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link 
        to="/kb" 
        className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Bilgi Bankasına Dön
      </Link>

      {/* Article Header */}
      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">{article.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {article.publishedAt && (
                <span className="flex items-center bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                  <Calendar className="w-4 h-4 mr-2 text-primary-600" />
                  {new Date(article.publishedAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              )}
              
              {article.departmentName && (
                <span className="flex items-center bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                  <Building2 className="w-4 h-4 mr-2 text-primary-600" />
                  {article.departmentName}
                </span>
              )}
              
              {article.categoryName && (
                <span className="flex items-center bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                  <FolderTree className="w-4 h-4 mr-2 text-primary-600" />
                  {article.categoryName}
                </span>
              )}
              
              <span className="flex items-center bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                <Eye className="w-4 h-4 mr-2 text-primary-600" />
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
                className="inline-flex items-center px-4 py-2 rounded-xl text-sm bg-gray-100 text-gray-700 border border-gray-200"
              >
                <Tag className="w-3 h-3 mr-2" />
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Summary */}
        {article.summary && (
          <div className="bg-primary-50 border-l-4 border-primary-600 rounded-r-xl p-5 mb-8">
            <p className="text-gray-800 font-medium leading-relaxed">{article.summary}</p>
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none text-gray-700 leading-relaxed
            prose-headings:text-gray-900 prose-headings:font-bold
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-a:text-primary-600 prose-a:no-underline hover:prose-a:text-primary-700
            prose-strong:text-gray-900 prose-strong:font-semibold
            prose-ul:text-gray-700 prose-ol:text-gray-700
            prose-li:marker:text-primary-600
            prose-code:text-primary-600 prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded
            prose-pre:bg-gray-100 prose-pre:border prose-pre:border-gray-200
            prose-blockquote:border-l-primary-600 prose-blockquote:text-gray-700"
          style={{
            fontSize: '1.05rem',
            lineHeight: '1.8'
          }}
          dangerouslySetInnerHTML={{ 
            __html: article.content
              .replace(/\n/g, '<br/>')
              .replace(/<br\/>/g, '<br/><br/>') 
          }}
        />

        {/* Helpful Button */}
        <div className="mt-10 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold text-gray-900 mb-2">Bu makale yardımcı oldu mu?</p>
              <p className="text-sm text-gray-600 flex items-center">
                <ThumbsUp className="w-4 h-4 mr-1.5 text-primary-600" />
                {article.helpfulCount} kişi bu makaleyi faydalı buldu
              </p>
            </div>
            <button
              onClick={handleMarkHelpful}
              disabled={marking}
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <ThumbsUp className="w-5 h-5 mr-2" />
              {marking ? 'İşleniyor...' : 'Evet, Yardımcı Oldu'}
            </button>
          </div>
        </div>
      </div>

      {/* Related Articles - Placeholder */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">İlgili Makaleler</h2>
        <p className="text-gray-600">
          Yakında ilgili makaleler burada görünecek.
        </p>
      </div>
    </div>
  );
}
