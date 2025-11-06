import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { BookOpen, Search, Star, Eye, ThumbsUp, Tag, Filter } from 'lucide-react';
import type { Article, Department, Category } from '../lib/types';

export default function KnowledgeBase() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<number | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [featuredOnly, setFeaturedOnly] = useState(false);

  useEffect(() => {
    loadDepartments();
    loadCategories();
    loadArticles();
  }, []);

  useEffect(() => {
    loadArticles();
  }, [search, selectedDept, selectedCategory, featuredOnly]);

  async function loadDepartments() {
    try {
      const depts = await api.getDepartments();
      setDepartments(depts);
    } catch (err) {
      console.error('Departmanlar yüklenemedi', err);
    }
  }

  async function loadCategories() {
    try {
      const cats = await api.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Kategoriler yüklenemedi', err);
    }
  }

  async function loadArticles() {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (selectedDept) params.departmentId = selectedDept;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (featuredOnly) params.featured = true;

      const data = await api.getArticles(params);
      setArticles(data);
    } catch (err) {
      console.error('Makaleler yüklenemedi', err);
      toast.error('Makaleler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setSearch('');
    setSelectedDept('');
    setSelectedCategory('');
    setFeaturedOnly(false);
  }

  const hasFilters = search || selectedDept || selectedCategory || featuredOnly;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BookOpen className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Bilgi Bankası</h1>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="label">
              <Search className="w-4 h-4 inline mr-1" />
              Ara
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
              placeholder="Makale başlığı, içerik veya etiket ara..."
            />
          </div>

          <div>
            <label className="label">
              <Filter className="w-4 h-4 inline mr-1" />
              Departman
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value ? Number(e.target.value) : '')}
              className="input"
            >
              <option value="">Tüm Departmanlar</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">
              <Filter className="w-4 h-4 inline mr-1" />
              Kategori
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : '')}
              className="input"
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              checked={featuredOnly}
              onChange={(e) => setFeaturedOnly(e.target.checked)}
              className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="featured" className="ml-2 text-sm text-gray-700 flex items-center">
              <Star className="w-4 h-4 text-yellow-500 mr-1" />
              Sadece Öne Çıkanlar
            </label>
          </div>

          {hasFilters && (
            <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-800">
              Filtreleri Temizle
            </button>
          )}
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : articles.length === 0 ? (
        <div className="card text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {hasFilters ? 'Arama kriterlerine uygun makale bulunamadı' : 'Henüz makale bulunmuyor'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/kb/${article.slug}`}
              className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            >
              {article.isFeatured && (
                <div className="flex items-center mb-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs text-yellow-700 ml-1 font-medium">Öne Çıkan</span>
                </div>
              )}

              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {article.title}
              </h3>

              {article.summary && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{article.summary}</p>
              )}

              {article.tags && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {article.tags.split(',').slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    {article.viewCount}
                  </span>
                  <span className="flex items-center">
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    {article.helpfulCount}
                  </span>
                </div>
                {article.publishedAt && (
                  <span>{new Date(article.publishedAt).toLocaleDateString('tr-TR')}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
