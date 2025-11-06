import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { Building2, Plus, Users, UserPlus, AlertCircle, Trash2, Clock, FolderTree, Zap, BookOpen, Edit, Save, Search } from 'lucide-react';
import type { Department, SLAPlan, Category, AutomationRule, Article, ArticleStatus, CreateArticleDto } from '../lib/types';

type Member = {
  assignmentId: number;
  userId: string;
  username: string;
  displayName?: string;
  role: number;
};

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'departments' | 'users' | 'sla' | 'categories' | 'automation' | 'kb'>('departments');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [selectedDept, setSelectedDept] = useState<number | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [assignUserId, setAssignUserId] = useState('');
  const [assignRole, setAssignRole] = useState('DepartmentManager');
  
  // Current user info for authorization
  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const isHRManager = currentUser?.departmentRoles?.some(
    (dr: any) => dr.role === 'DepartmentManager' && departments.find(d => d.id === dr.departmentId)?.name === 'İnsan Kaynakları'
  );
  const isSuperAdmin = currentUser?.roles?.includes('SuperAdmin');
  const canDeleteUsers = isSuperAdmin || isHRManager;
  
  // User creation states
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newOrgDepartment, setNewOrgDepartment] = useState('');
  const [newDepartmentId, setNewDepartmentId] = useState<number | ''>('');
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // User editing states
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editOrgDepartment, setEditOrgDepartment] = useState('');
  const [editDepartmentId, setEditDepartmentId] = useState<number | ''>('');
  
  // User filtering states
  const [filterSearch, setFilterSearch] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<number | ''>('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState<number | ''>('');
  
  // SLA Plan states
  const [slaPlans, setSlaPlans] = useState<SLAPlan[]>([]);
  const [loadingSLA, setLoadingSLA] = useState(false);
  const [newSLAName, setNewSLAName] = useState('');
  const [newSLADescription, setNewSLADescription] = useState('');
  const [newSLAResponseTime, setNewSLAResponseTime] = useState('');
  const [newSLAResolutionTime, setNewSLAResolutionTime] = useState('');
  
  // Category states
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDeptId, setNewCategoryDeptId] = useState<number | ''>('');
  const [newCategoryParentId, setNewCategoryParentId] = useState<number | ''>('');
  
  // Automation Rule states
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [loadingAutomation, setLoadingAutomation] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleDescription, setNewRuleDescription] = useState('');
  const [newRuleTrigger, setNewRuleTrigger] = useState<number>(0);
  const [newRuleEnabled, setNewRuleEnabled] = useState(true);
  const [newRulePriority, setNewRulePriority] = useState('100');
  const [newRuleCondition, setNewRuleCondition] = useState('{}');
  const [newRuleAction, setNewRuleAction] = useState('{}');
  
  // Knowledge Base states
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingKB, setLoadingKB] = useState(false);
  const [newArticleTitle, setNewArticleTitle] = useState('');
  const [newArticleContent, setNewArticleContent] = useState('');
  const [newArticleSummary, setNewArticleSummary] = useState('');
  const [newArticleDeptId, setNewArticleDeptId] = useState<number | ''>('');
  const [newArticleCategoryId, setNewArticleCategoryId] = useState<number | ''>('');
  const [newArticleStatus, setNewArticleStatus] = useState<ArticleStatus>(1); // Published
  const [newArticleFeatured, setNewArticleFeatured] = useState(false);
  const [newArticleTags, setNewArticleTags] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadDepartments();
    loadUsers(); // Her zaman yükle, kullanıcı dropdown için gerekli
    if (activeTab === 'sla') {
      loadSLAPlans();
    }
    if (activeTab === 'categories') {
      loadCategories();
    }
    if (activeTab === 'automation') {
      loadAutomationRules();
    }
    if (activeTab === 'kb') {
      loadArticles();
    }
  }, [activeTab]);

  async function loadDepartments() {
    setLoading(true);
    try {
      const depts = await api.getDepartments();
      setDepartments(depts);
    } catch (err) {
      setError('Departmanlar yuklenemedi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function createDept(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newName.trim()) {
      setError('Departman adi gereklidir');
      return;
    }

    try {
      if (editingDept) {
        // Update existing department
        const updated = await api.updateDepartment(editingDept.id, {
          name: newName.trim(),
          description: newDesc.trim() || undefined,
        });
        setDepartments((prev) => prev.map(d => d.id === editingDept.id ? updated : d));
        toast.success('Departman başarıyla güncellendi');
        setSuccess('Departman başarıyla güncellendi');
        setEditingDept(null);
      } else {
        // Create new department
        const dept = await api.createDepartment({
          name: newName.trim(),
          description: newDesc.trim() || undefined,
        });
        setDepartments((prev) => [...prev, dept]);
        toast.success('Departman başarıyla oluşturuldu');
        setSuccess('Departman basariyla olusturuldu');
      }
      
      setNewName('');
      setNewDesc('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || (editingDept ? 'Departman güncellenemedi' : 'Departman oluşturulamadı');
      setError(errorMsg);
      toast.error(errorMsg);
    }
  }

  function startEditDept(dept: Department) {
    setEditingDept(dept);
    setNewName(dept.name);
    setNewDesc(dept.description || '');
  }

  function cancelEditDept() {
    setEditingDept(null);
    setNewName('');
    setNewDesc('');
  }

  async function deleteDept(deptId: number) {
    if (!confirm('Bu departmanı silmek istediğinizden emin misiniz?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await api.deleteDepartment(deptId);
      setDepartments((prev) => prev.filter(d => d.id !== deptId));
      toast.success('Departman başarıyla silindi');
      setSuccess('Departman başarıyla silindi');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || 'Departman silinemedi';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  }

  async function loadMembers(deptId: number) {
    try {
      const memberList = await api.getDepartmentMembers(deptId);
      setMembers(memberList);
      setSelectedDept(selectedDept === deptId ? null : deptId);
    } catch (err) {
      setError('Uyeler yuklenemedi');
      console.error(err);
    }
  }

  async function assignUser(deptId: number) {
    setError('');
    setSuccess('');

    if (!assignUserId.trim()) {
      setError('Kullanici ID gereklidir');
      toast.error('Kullanıcı seçiniz');
      return;
    }

    try {
      await api.assignDepartmentRole(deptId, assignUserId.trim(), assignRole);
      toast.success('Rol basariyla atandi');
      setSuccess('Rol basariyla atandi');
      setAssignUserId('');
      loadMembers(deptId);
      loadUsers(); // Kullanıcı listesini güncelle
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Rol atamasi basarisiz';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  }

  async function removeUserFromDept(deptId: number, userId: string) {
    if (!confirm('Bu kullanıcıyı departmandan çıkarmak istediğinizden emin misiniz?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await api.removeUserFromDepartment(deptId, userId);
      toast.success('Kullanıcı departmandan çıkarıldı');
      setSuccess('Kullanıcı departmandan çıkarıldı');
      loadMembers(deptId);
      loadUsers(); // Kullanıcı listesini güncelle
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || 'Kullanıcı çıkarılamadı';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  }

  async function handleDeleteUser(userId: string) {
    const user = users.find(u => u.id === userId);
    const userName = user?.displayName || user?.username || 'Bu kullanıcı';
    
    // SuperAdmin kontrolü
    const isSuperAdmin = user?.roles?.includes('SuperAdmin');
    if (isSuperAdmin) {
      toast.error('SuperAdmin kullanıcıları silinemez!');
      setError('SuperAdmin kullanıcıları silinemez!');
      return;
    }
    
    if (!confirm(`⚠️ DİKKAT: ${userName} kullanıcısını kalıcı olarak silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz ve kullanıcının tüm verileri silinecektir!`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await api.deleteUser(userId);
      toast.success('Kullanıcı kalıcı olarak silindi');
      setSuccess('Kullanıcı kalıcı olarak silindi');
      loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || 'Kullanıcı silinemedi';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  }

  function startEditUser(user: any) {
    setEditingUser(user);
    setEditUsername(user.username);
    setEditEmail(user.email || '');
    setEditDisplayName(user.displayName || '');
    setEditJobTitle(user.jobTitle || '');
    setEditOrgDepartment(user.organizationalDepartment || '');
    setEditDepartmentId(user.departmentId || '');
  }

  function cancelEditUser() {
    setEditingUser(null);
    setEditUsername('');
    setEditEmail('');
    setEditDisplayName('');
    setEditJobTitle('');
    setEditOrgDepartment('');
    setEditDepartmentId('');
  }

  async function updateUser(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!editingUser) return;

    try {
      await api.updateUser(editingUser.id, {
        displayName: editDisplayName.trim() || undefined,
        email: editEmail.trim() || undefined,
        jobTitle: editJobTitle.trim() || undefined,
        organizationalDepartment: editOrgDepartment.trim() || undefined,
        departmentId: editDepartmentId || undefined,
      });
      
      toast.success('Kullanıcı başarıyla güncellendi');
      setSuccess('Kullanıcı başarıyla güncellendi');
      cancelEditUser();
      loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || 'Kullanıcı güncellenemedi';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newUsername.trim() || !newEmail.trim() || !newPassword.trim()) {
      setError('Kullanıcı adı, email ve şifre gereklidir');
      return;
    }

    try {
      const result = await api.register({
        username: newUsername.trim(),
        email: newEmail.trim(),
        password: newPassword,
        displayName: newDisplayName.trim() || newUsername.trim(),
        organizationalDepartment: newOrgDepartment.trim() || undefined,
        jobTitle: newJobTitle.trim() || undefined
      });
      
      // Eğer departman seçildiyse, kullanıcıyı departmana ata
      if (newDepartmentId && result.user?.id) {
        try {
          await api.assignDepartmentRole(
            newDepartmentId as number,
            result.user.id,
            'EndUser'
          );
        } catch (assignErr) {
          console.error('Departman ataması başarısız:', assignErr);
        }
      }
      
      setSuccess(`Kullanıcı başarıyla oluşturuldu: ${newUsername}${newJobTitle ? ` (${newJobTitle})` : ''}`);
      setNewUsername('');
      setNewEmail('');
      setNewPassword('');
      setNewDisplayName('');
      setNewJobTitle('');
      setNewOrgDepartment('');
      setNewDepartmentId('');
      loadUsers();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Kullanıcı oluşturulamadı');
    }
  }

  async function loadUsers() {
    setLoadingUsers(true);
    try {
      const userList = await api.getUsers();
      setUsers(userList);
    } catch (err) {
      console.error('Kullanıcılar yüklenemedi', err);
      toast.error('Kullanıcılar yüklenemedi');
    } finally {
      setLoadingUsers(false);
    }
  }

  async function loadSLAPlans() {
    setLoadingSLA(true);
    try {
      const plans = await api.getAdminSLAPlans();
      setSlaPlans(plans);
    } catch (err) {
      console.error('SLA planları yüklenemedi', err);
      toast.error('SLA planları yüklenemedi');
    } finally {
      setLoadingSLA(false);
    }
  }

  async function createSLAPlan(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newSLAName.trim() || !newSLAResponseTime || !newSLAResolutionTime) {
      setError('Tüm alanlar gereklidir');
      return;
    }

    try {
      const plan = await api.createSLAPlan({
        name: newSLAName.trim(),
        description: newSLADescription.trim() || undefined,
        responseTimeMinutes: parseInt(newSLAResponseTime),
        resolutionTimeMinutes: parseInt(newSLAResolutionTime),
      });
      setSlaPlans((prev) => [...prev, plan]);
      setNewSLAName('');
      setNewSLADescription('');
      setNewSLAResponseTime('');
      setNewSLAResolutionTime('');
      toast.success('SLA planı başarıyla oluşturuldu');
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || 'SLA planı oluşturulamadı';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  }

  async function deleteSLAPlan(id: number) {
    if (!confirm('Bu SLA planını silmek istediğinizden emin misiniz?')) return;
    
    try {
      await api.deleteSLAPlan(id);
      setSlaPlans((prev) => prev.filter(p => p.id !== id));
      toast.success('SLA planı silindi');
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || 'SLA planı silinemedi';
      toast.error(errorMsg);
    }
  }

  async function loadCategories() {
    setLoadingCategories(true);
    try {
      const tree = await api.getCategoryTree();
      setCategories(tree);
    } catch (err) {
      console.error('Kategoriler yüklenemedi', err);
      toast.error('Kategoriler yüklenemedi');
    } finally {
      setLoadingCategories(false);
    }
  }

  async function createCategory(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    
    if (!newCategoryName.trim()) {
      setError('Kategori adı gereklidir');
      return;
    }

    try {
      await api.createCategory({
        name: newCategoryName.trim(),
        departmentId: newCategoryDeptId || undefined,
        parentId: newCategoryParentId || undefined,
        visibility: 0, // Public
        sortOrder: 0
      });
      setNewCategoryName('');
      setNewCategoryDeptId('');
      setNewCategoryParentId('');
      loadCategories();
      toast.success('Kategori başarıyla oluşturuldu');
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || 'Kategori oluşturulamadı';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  }

  async function deleteCategory(id: number) {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;
    
    try {
      await api.deleteCategory(id);
      loadCategories();
      toast.success('Kategori silindi');
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || 'Kategori silinemedi';
      toast.error(errorMsg);
    }
  }

  async function loadAutomationRules() {
    setLoadingAutomation(true);
    try {
      const rules = await api.getAutomationRules();
      setAutomationRules(rules);
    } catch (err) {
      console.error('Automation rules yüklenemedi', err);
      toast.error('Automation rules yüklenemedi');
    } finally {
      setLoadingAutomation(false);
    }
  }

  async function createAutomationRule(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newRuleName.trim()) {
      setError('Kural adı gereklidir');
      return;
    }

    try {
      // Validate JSON
      const condition = newRuleCondition.trim() ? JSON.parse(newRuleCondition) : null;
      const action = newRuleAction.trim() ? JSON.parse(newRuleAction) : null;

      const rule = await api.createAutomationRule({
        name: newRuleName.trim(),
        description: newRuleDescription.trim() || undefined,
        trigger: newRuleTrigger,
        enabled: newRuleEnabled,
        priority: parseInt(newRulePriority) || 100,
        conditionJson: condition ? JSON.stringify(condition) : undefined,
        actionJson: action ? JSON.stringify(action) : undefined,
      });

      setAutomationRules((prev) => [...prev, rule]);
      setNewRuleName('');
      setNewRuleDescription('');
      setNewRuleTrigger(0);
      setNewRuleEnabled(true);
      setNewRulePriority('100');
      setNewRuleCondition('{}');
      setNewRuleAction('{}');
      toast.success('Automation rule başarıyla oluşturuldu');
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || err.message || 'Rule oluşturulamadı';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  }

  async function toggleAutomationRule(id: number, enabled: boolean) {
    try {
      await api.updateAutomationRule(id, { enabled });
      setAutomationRules((prev) =>
        prev.map((rule) => (rule.id === id ? { ...rule, enabled } : rule))
      );
      toast.success(`Rule ${enabled ? 'aktif' : 'pasif'} edildi`);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || 'Rule güncellenemedi';
      toast.error(errorMsg);
    }
  }

  async function deleteAutomationRule(id: number) {
    if (!confirm('Bu automation rule\'u silmek istediğinizden emin misiniz?')) return;
    
    try {
      await api.deleteAutomationRule(id);
      setAutomationRules((prev) => prev.filter((r) => r.id !== id));
      toast.success('Rule silindi');
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || 'Rule silinemedi';
      toast.error(errorMsg);
    }
  }

  async function loadArticles() {
    setLoadingKB(true);
    try {
      const data = await api.getAdminArticles();
      setArticles(data);
    } catch (err) {
      console.error('Makaleler yüklenemedi', err);
      toast.error('Makaleler yüklenemedi');
    } finally {
      setLoadingKB(false);
    }
  }

  async function createArticle(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    
    if (!newArticleTitle.trim() || !newArticleContent.trim()) {
      setError('Başlık ve içerik gereklidir');
      return;
    }

    try {
      const dto: CreateArticleDto = {
        title: newArticleTitle.trim(),
        content: newArticleContent.trim(),
        summary: newArticleSummary.trim() || undefined,
        departmentId: newArticleDeptId || undefined,
        categoryId: newArticleCategoryId || undefined,
        status: newArticleStatus,
        isFeatured: newArticleFeatured,
        tags: newArticleTags.trim() || undefined,
      };

      const article = await api.createArticle(dto);
      setArticles((prev) => [article, ...prev]);
      
      // Reset form
      setNewArticleTitle('');
      setNewArticleContent('');
      setNewArticleSummary('');
      setNewArticleDeptId('');
      setNewArticleCategoryId('');
      setNewArticleStatus(1);
      setNewArticleFeatured(false);
      setNewArticleTags('');
      
      toast.success('Makale başarıyla oluşturuldu');
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || 'Makale oluşturulamadı';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  }

  async function deleteArticle(id: number) {
    if (!confirm('Bu makaleyi silmek istediğinizden emin misiniz?')) return;
    
    try {
      await api.deleteArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
      toast.success('Makale silindi');
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || 'Makale silinemedi';
      toast.error(errorMsg);
    }
  }

  function renderCategoryTree(nodes: any[], level: number = 0): JSX.Element[] {
    return nodes.map(node => (
      <div key={node.category.id} style={{ marginLeft: `${level * 20}px` }} className="border-l-2 border-gray-200 pl-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FolderTree className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-medium">{node.category.name}</span>
            {node.category.departmentId && (
              <span className="ml-2 text-xs text-gray-500">
                (Dept: {node.category.departmentId})
              </span>
            )}
          </div>
          <button
            onClick={() => deleteCategory(node.category.id)}
            className="text-red-600 hover:text-red-900"
            title="Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        {node.children && node.children.length > 0 && (
          <div className="mt-1">
            {renderCategoryTree(node.children, level + 1)}
          </div>
        )}
      </div>
    ));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden py-8">
      {/* Animated blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative space-y-6 max-w-7xl mx-auto px-4">
        <div className="glass bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/50 p-6 animate-slide-up">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl hover:scale-110 hover:rotate-6 transition-all duration-300">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Admin Panel</h1>
          </div>
        </div>

        <div className="glass bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/50 overflow-hidden">
          <nav className="flex flex-wrap gap-3 p-3">
            <button
              onClick={() => setActiveTab('departments')}
              className={`flex items-center px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'departments'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Building2 className="w-4 h-4 mr-2" />
              Departmanlar
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'users'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Kullanıcılar
            </button>
            <button
              onClick={() => setActiveTab('sla')}
              className={`flex items-center px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'sla'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Clock className="w-4 h-4 mr-2" />
              SLA Planları
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'categories'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <FolderTree className="w-4 h-4 mr-2" />
              Kategoriler
            </button>
            <button
              onClick={() => setActiveTab('automation')}
              className={`flex items-center px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'automation'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Zap className="w-4 h-4 mr-2" />
              Automation
            </button>
            <button
              onClick={() => setActiveTab('kb')}
              className={`flex items-center px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'kb'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Bilgi Bankası
            </button>
          </nav>
        </div>      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-start">
          <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4">
          {success}
        </div>
      )}

      {activeTab === 'departments' && (
        <>
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Yeni Departman Olustur</h2>
          <form onSubmit={createDept} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="deptName" className="label">
                  Departman Adi <span className="text-red-500">*</span>
                </label>
                <input
                  id="deptName"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="input"
                  placeholder="Orn: Bilgi Islem"
                  required
                />
              </div>
              <div>
                <label htmlFor="deptDesc" className="label">
                  Aciklama
                </label>
                <input
                  id="deptDesc"
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="input"
                  placeholder="Departman aciklamasi"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">
                <Plus size={18} className="mr-2" />
                {editingDept ? 'Departmanı Güncelle' : 'Departman Oluştur'}
              </button>
              {editingDept && (
                <button 
                  type="button" 
                  onClick={cancelEditDept}
                  className="btn bg-gray-500 hover:bg-gray-600 text-white"
                >
                  İptal
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Departmanlar</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : departments.length === 0 ? (
            <div className="card text-center py-12 text-gray-500">
              Henuz departman bulunmuyor
            </div>
          ) : (
            departments.map((dept) => (
              <div key={dept.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start">
                    <Building2 className="text-primary-600 mr-3 mt-1" size={24} />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{dept.name}</h3>
                      {dept.description && (
                        <p className="text-sm text-gray-600 mt-1">{dept.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEditDept(dept)}
                      className="btn bg-blue-600 hover:bg-blue-700 text-white"
                      title="Düzenle"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => loadMembers(dept.id)}
                      className="btn btn-secondary"
                    >
                      <Users size={18} className="mr-2" />
                      {selectedDept === dept.id ? 'Uyeleri Gizle' : 'Uyeleri Goster'}
                    </button>
                    <button
                      onClick={() => deleteDept(dept.id)}
                      className="btn bg-red-600 hover:bg-red-700 text-white"
                      title="Sil"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {selectedDept === dept.id && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Departman Uyeleri</h4>
                    
                    {members.length === 0 ? (
                      <p className="text-sm text-gray-500 mb-4">Henuz uye bulunmuyor</p>
                    ) : (
                      <div className="overflow-x-auto mb-6">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Kullanici ID</th>
                              <th>Kullanici Adi</th>
                              <th>Ad Soyad</th>
                              <th>Rol</th>
                              <th>İşlemler</th>
                            </tr>
                          </thead>
                          <tbody>
                            {members.map((member) => (
                              <tr key={member.assignmentId}>
                                <td className="font-mono text-xs">{member.userId}</td>
                                <td>{member.username}</td>
                                <td>{member.displayName || '-'}</td>
                                <td>
                                  <span className="badge badge-info">
                                    {member.role === 0
                                      ? 'Manager'
                                      : member.role === 1
                                      ? 'Staff'
                                      : 'End User'}
                                  </span>
                                </td>
                                <td>
                                  <button
                                    onClick={() => removeUserFromDept(dept.id, member.userId)}
                                    className="text-red-600 hover:text-red-900 text-sm flex items-center"
                                    title="Departmandan Çıkar"
                                  >
                                    <Trash2 size={16} className="mr-1" />
                                    Çıkar
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-3">Kullanici Ata</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label htmlFor={`userId-${dept.id}`} className="label">
                            Kullanıcı Seçin
                          </label>
                          <select
                            id={`userId-${dept.id}`}
                            value={assignUserId}
                            onChange={(e) => setAssignUserId(e.target.value)}
                            className="select"
                          >
                            <option value="">Kullanıcı seçiniz...</option>
                            {users.map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.displayName} ({user.username})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor={`role-${dept.id}`} className="label">
                            Rol
                          </label>
                          <select
                            id={`role-${dept.id}`}
                            value={assignRole}
                            onChange={(e) => setAssignRole(e.target.value)}
                            className="select"
                          >
                            <option value="DepartmentManager">Departman Yoneticisi</option>
                            <option value="DepartmentStaff">Departman Calisani</option>
                            <option value="EndUser">Son Kullanici</option>
                          </select>
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={() => assignUser(dept.id)}
                            className="btn btn-primary w-full"
                            disabled={!assignUserId}
                          >
                            <UserPlus size={18} className="mr-2" />
                            Ata
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        </>
      )}

      {activeTab === 'sla' && (
        <>
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Clock className="w-6 h-6 mr-2 text-primary-600" />
              Yeni SLA Planı Oluştur
            </h2>
            <form onSubmit={createSLAPlan} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan Adı *
                  </label>
                  <input
                    type="text"
                    value={newSLAName}
                    onChange={(e) => setNewSLAName(e.target.value)}
                    className="input"
                    placeholder="örn: Standard, Premium, Critical"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama
                  </label>
                  <input
                    type="text"
                    value={newSLADescription}
                    onChange={(e) => setNewSLADescription(e.target.value)}
                    className="input"
                    placeholder="Plan açıklaması"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Yanıt Süresi (dakika) *
                  </label>
                  <input
                    type="number"
                    value={newSLAResponseTime}
                    onChange={(e) => setNewSLAResponseTime(e.target.value)}
                    className="input"
                    placeholder="örn: 60"
                    min="1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">İlk yanıt için maksimum süre</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Çözüm Süresi (dakika) *
                  </label>
                  <input
                    type="number"
                    value={newSLAResolutionTime}
                    onChange={(e) => setNewSLAResolutionTime(e.target.value)}
                    className="input"
                    placeholder="örn: 480"
                    min="1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Ticket kapatma için maksimum süre</p>
                </div>
              </div>
              <button type="submit" className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                SLA Planı Oluştur
              </button>
            </form>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">SLA Planları</h2>
            {loadingSLA ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-gray-600">Yükleniyor...</p>
              </div>
            ) : slaPlans.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Henüz SLA planı bulunmuyor.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan Adı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Açıklama
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Yanıt Süresi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Çözüm Süresi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {slaPlans.map((plan) => (
                      <tr key={plan.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">{plan.description || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {plan.responseTimeMinutes} dk
                            <span className="text-gray-500 ml-1">
                              ({Math.floor(plan.responseTimeMinutes / 60)}s {plan.responseTimeMinutes % 60}dk)
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {plan.resolutionTimeMinutes} dk
                            <span className="text-gray-500 ml-1">
                              ({Math.floor(plan.resolutionTimeMinutes / 60)}s {plan.resolutionTimeMinutes % 60}dk)
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => deleteSLAPlan(plan.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card bg-gray-50 border-gray-200">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-gray-600 mr-3 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-2 text-gray-900">SLA (Service Level Agreement) Nedir?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Yanıt Süresi:</strong> Ticket oluşturulduktan sonra ilk yanıt için maksimum süre</li>
                  <li><strong>Çözüm Süresi:</strong> Ticket'ın tamamen çözülmesi için maksimum süre</li>
                  <li>SLA planları ticket önceliğine göre otomatik atanabilir</li>
                  <li>Süre aşımları otomatik olarak monitör edilir ve bildirim gönderilir</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'categories' && (
        <>
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FolderTree className="w-6 h-6 mr-2 text-primary-600" />
              Yeni Kategori Oluştur
            </h2>
            <form onSubmit={createCategory} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori Adı *
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="input"
                    placeholder="örn: Yazılım, Donanım, İK"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departman (Opsiyonel)
                  </label>
                  <select
                    value={newCategoryDeptId}
                    onChange={(e) => setNewCategoryDeptId(e.target.value ? Number(e.target.value) : '')}
                    className="input"
                  >
                    <option value="">Genel (Tüm departmanlar)</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Üst Kategori (Opsiyonel)
                  </label>
                  <select
                    value={newCategoryParentId}
                    onChange={(e) => setNewCategoryParentId(e.target.value ? Number(e.target.value) : '')}
                    className="input"
                  >
                    <option value="">Yok (Ana kategori)</option>
                    {categories.map(node => (
                      <option key={node.category.id} value={node.category.id}>
                        {node.category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-start">
                <button type="submit" className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Kategori Oluştur
                </button>
              </div>
            </form>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Kategori Hiyerarşisi</h2>
            {loadingCategories ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-gray-600">Yükleniyor...</p>
              </div>
            ) : categories.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Henüz kategori bulunmuyor.</p>
            ) : (
              <div className="space-y-2">
                {renderCategoryTree(categories)}
              </div>
            )}
          </div>

          <div className="card bg-gray-50 border-gray-200">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-gray-600 mr-3 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-2 text-gray-900">Kategoriler Nasıl Kullanılır?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Ana Kategoriler:</strong> Üst kategori seçmeden oluşturulan kategoriler</li>
                  <li><strong>Alt Kategoriler:</strong> Bir üst kategoriye bağlı kategoriler (hiyerarşik yapı)</li>
                  <li><strong>Departmana Özel:</strong> Sadece belirli bir departman için görünür kategoriler</li>
                  <li><strong>Genel Kategoriler:</strong> Tüm departmanlar tarafından kullanılabilir</li>
                  <li>Ticket oluştururken kullanıcılar kategori seçebilir</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'automation' && (
        <>
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Zap className="w-6 h-6 mr-2 text-primary-600" />
              Yeni Automation Rule Oluştur
            </h2>
            <form onSubmit={createAutomationRule} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rule Adı *
                  </label>
                  <input
                    type="text"
                    value={newRuleName}
                    onChange={(e) => setNewRuleName(e.target.value)}
                    className="input"
                    placeholder="örn: Yüksek Öncelikli Ticket Bildirimi"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama
                  </label>
                  <input
                    type="text"
                    value={newRuleDescription}
                    onChange={(e) => setNewRuleDescription(e.target.value)}
                    className="input"
                    placeholder="Rule açıklaması"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trigger *
                  </label>
                  <select
                    value={newRuleTrigger}
                    onChange={(e) => setNewRuleTrigger(Number(e.target.value))}
                    className="input"
                    required
                  >
                    <option value={0}>Ticket Created</option>
                    <option value={1}>Ticket Updated</option>
                    <option value={2}>Status Changed</option>
                    <option value={3}>Comment Added</option>
                    <option value={4}>SLA Warning</option>
                    <option value={5}>Schedule (Cron)</option>
                    <option value={6}>Inbound Email</option>
                    <option value={7}>Custom Webhook</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <input
                    type="number"
                    value={newRulePriority}
                    onChange={(e) => setNewRulePriority(e.target.value)}
                    className="input"
                    placeholder="100"
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Düşük değer = yüksek öncelik</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condition (JSON)
                  </label>
                  <textarea
                    value={newRuleCondition}
                    onChange={(e) => setNewRuleCondition(e.target.value)}
                    className="input font-mono text-xs"
                    rows={6}
                    placeholder='{"priority": 3, "status": 0}'
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Koşul JSON formatında (örn: priority=3 ve status=0)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action (JSON)
                  </label>
                  <textarea
                    value={newRuleAction}
                    onChange={(e) => setNewRuleAction(e.target.value)}
                    className="input font-mono text-xs"
                    rows={6}
                    placeholder='{"assignTo": "admin", "notify": true}'
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Aksiyon JSON formatında (örn: atama, bildirim, email)
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ruleEnabled"
                  checked={newRuleEnabled}
                  onChange={(e) => setNewRuleEnabled(e.target.checked)}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="ruleEnabled" className="ml-2 text-sm text-gray-700">
                  Rule aktif (oluşturulduğunda hemen çalışsın)
                </label>
              </div>

              <div className="flex justify-start">
                <button type="submit" className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Automation Rule Oluştur
                </button>
              </div>
            </form>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Automation Rules</h2>
            {loadingAutomation ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-gray-600">Yükleniyor...</p>
              </div>
            ) : automationRules.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Henüz automation rule bulunmuyor.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rule Adı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trigger
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Son Çalıştırma
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {automationRules.map((rule) => {
                      const triggerNames = [
                        'Ticket Created',
                        'Ticket Updated',
                        'Status Changed',
                        'Comment Added',
                        'SLA Warning',
                        'Schedule (Cron)',
                        'Inbound Email',
                        'Custom Webhook',
                      ];
                      return (
                        <tr key={rule.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                            {rule.description && (
                              <div className="text-xs text-gray-500 mt-1">{rule.description}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {triggerNames[rule.trigger] || `Unknown (${rule.trigger})`}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {rule.priority}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {rule.lastRunAt
                              ? new Date(rule.lastRunAt).toLocaleString('tr-TR')
                              : 'Hiç çalışmadı'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleAutomationRule(rule.id, !rule.enabled)}
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                rule.enabled
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              }`}
                            >
                              {rule.enabled ? 'Aktif' : 'Pasif'}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => deleteAutomationRule(rule.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card bg-gray-50 border-gray-200">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-gray-600 mr-3 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-2 text-gray-900">Automation Rules Nasıl Çalışır?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Trigger:</strong> Rule'un ne zaman çalışacağını belirler (örn: yeni ticket, durum değişimi)</li>
                  <li><strong>Condition:</strong> Rule'un çalışması için gerekli koşullar (JSON formatında)</li>
                  <li><strong>Action:</strong> Koşul sağlandığında yapılacak işlemler (JSON formatında)</li>
                  <li><strong>Priority:</strong> Birden fazla rule tetiklendiğinde öncelik sırası (düşük sayı = yüksek öncelik)</li>
                </ul>
                <p className="mt-3 text-xs">
                  <strong>Örnek Kullanım:</strong> Yüksek öncelikli ticket oluşturulduğunda otomatik olarak manager'a atama yapabilir veya email bildirimi gönderebilirsiniz.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'kb' && (
        <>
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <BookOpen className="w-6 h-6 mr-2 text-primary-600" />
              Yeni Makale Oluştur
            </h2>
            <form onSubmit={createArticle} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Başlık *
                  </label>
                  <input
                    type="text"
                    value={newArticleTitle}
                    onChange={(e) => setNewArticleTitle(e.target.value)}
                    className="input"
                    placeholder="Makale başlığı"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Özet
                  </label>
                  <textarea
                    value={newArticleSummary}
                    onChange={(e) => setNewArticleSummary(e.target.value)}
                    className="input"
                    rows={2}
                    placeholder="Kısa özet (opsiyonel)"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İçerik *
                  </label>
                  <textarea
                    value={newArticleContent}
                    onChange={(e) => setNewArticleContent(e.target.value)}
                    className="input"
                    rows={10}
                    placeholder="Makale içeriği"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departman
                  </label>
                  <select
                    value={newArticleDeptId}
                    onChange={(e) => setNewArticleDeptId(e.target.value ? Number(e.target.value) : '')}
                    className="input"
                  >
                    <option value="">Genel (Tüm departmanlar)</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={newArticleCategoryId}
                    onChange={(e) => setNewArticleCategoryId(e.target.value ? Number(e.target.value) : '')}
                    className="input"
                  >
                    <option value="">Kategori Yok</option>
                    {categories.map((node) => (
                      <option key={node.category.id} value={node.category.id}>
                        {node.category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durum
                  </label>
                  <select
                    value={newArticleStatus}
                    onChange={(e) => setNewArticleStatus(Number(e.target.value) as ArticleStatus)}
                    className="input"
                  >
                    <option value={0}>Taslak</option>
                    <option value={1}>Yayınlandı</option>
                    <option value={2}>Arşivlendi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Etiketler (virgülle ayırın)
                  </label>
                  <input
                    type="text"
                    value={newArticleTags}
                    onChange={(e) => setNewArticleTags(e.target.value)}
                    className="input"
                    placeholder="örn: yazılım, windows, outlook"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="articleFeatured"
                  checked={newArticleFeatured}
                  onChange={(e) => setNewArticleFeatured(e.target.checked)}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="articleFeatured" className="ml-2 text-sm text-gray-700">
                  Öne çıkan makale (anasayfada gösterilsin)
                </label>
              </div>

              <button type="submit" className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Makale Oluştur
              </button>
            </form>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Makaleler</h2>
            {loadingKB ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-gray-600">Yükleniyor...</p>
              </div>
            ) : articles.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Henüz makale bulunmuyor.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Başlık
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Departman
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kategori
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Görüntülenme
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {articles.map((article) => {
                      const statusLabels = ['Taslak', 'Yayınlandı', 'Arşivlendi'];
                      const statusColors = [
                        'bg-gray-100 text-gray-800',
                        'bg-green-100 text-green-800',
                        'bg-yellow-100 text-yellow-800',
                      ];

                      return (
                        <tr key={article.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {article.isFeatured && (
                                <span className="text-yellow-500 mr-2" title="Öne Çıkan">
                                  ⭐
                                </span>
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {article.title}
                                </div>
                                {article.summary && (
                                  <div className="text-xs text-gray-500 line-clamp-1">
                                    {article.summary}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {article.departmentName || '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {article.categoryName || '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                statusColors[article.status]
                              }`}
                            >
                              {statusLabels[article.status]}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{article.viewCount} görüntülenme</div>
                            <div className="text-xs text-gray-500">{article.helpfulCount} faydalı</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => deleteArticle(article.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card bg-blue-50 border-blue-200">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-2">Bilgi Bankası Nasıl Kullanılır?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <strong>Yayınlanan</strong> makaleler kullanıcılar tarafından görülebilir
                  </li>
                  <li>
                    <strong>Taslak</strong> makaleler sadece admin tarafından görülebilir
                  </li>
                  <li>
                    <strong>Öne Çıkan</strong> makaleler Bilgi Bankası anasayfasında üstte gösterilir
                  </li>
                  <li>Makaleler departman ve kategorilere göre filtrelenebilir</li>
                  <li>Slug otomatik olarak başlıktan oluşturulur (URL dostu)</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <>
          <div className="card mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Yeni Kullanıcı Oluştur</h2>
            <p className="text-sm text-gray-600 mb-4">
              Yeni kullanıcı oluşturduktan sonra, <strong>Departmanlar</strong> sekmesinden ilgili departmanı seçip kullanıcıyı atayabilirsiniz.
            </p>
            <form onSubmit={createUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="username" className="label">
                    Kullanıcı Adı <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="input"
                    placeholder="kullaniciadi"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="label">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="input"
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="displayName" className="label">
                    Ad Soyad <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className="input"
                    placeholder="Ad Soyad"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="jobTitle" className="label">
                    Ünvan
                  </label>
                  <input
                    id="jobTitle"
                    type="text"
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    className="input"
                    placeholder="Yazılım Geliştirici, Müdür, vb."
                  />
                </div>
                <div>
                  <label htmlFor="orgDepartment" className="label">
                    Organizasyon Departmanı
                  </label>
                  <input
                    id="orgDepartment"
                    type="text"
                    value={newOrgDepartment}
                    onChange={(e) => setNewOrgDepartment(e.target.value)}
                    className="input"
                    placeholder="İnsan Kaynakları, AR-GE, Finans, vb."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Bu sadece bilgilendirme amaçlıdır. Ticket sistemi için ayrıca departman atayabilirsiniz.
                  </p>
                </div>
                <div>
                  <label htmlFor="password" className="label">
                    Şifre <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input"
                    placeholder="********"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="department" className="label">
                    Ticket Departmanı
                  </label>
                  <select
                    id="department"
                    value={newDepartmentId}
                    onChange={(e) => setNewDepartmentId(e.target.value ? Number(e.target.value) : '')}
                    className="input"
                  >
                    <option value="">Departman Seçiniz (Opsiyonel)</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Bu kullanıcının hangi departmanın ticketlarını yöneteceğini belirtir.
                  </p>
                </div>
              </div>
              <button type="submit" className="btn btn-primary">
                <UserPlus size={18} className="mr-2 inline" />
                Kullanıcı Oluştur
              </button>
            </form>
          </div>

          {editingUser && (
            <div className="card mb-6 border-2 border-blue-500">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Edit className="w-6 h-6 mr-2 text-blue-600" />
                Kullanıcı Düzenle: {editingUser.displayName || editingUser.username}
              </h2>
              <form onSubmit={updateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      Kullanıcı Adı (Değiştirilemez)
                    </label>
                    <input
                      type="text"
                      value={editUsername}
                      disabled
                      className="input bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label htmlFor="editEmail" className="label">
                      Email
                    </label>
                    <input
                      id="editEmail"
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="input"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="editDisplayName" className="label">
                      Ad Soyad
                    </label>
                    <input
                      id="editDisplayName"
                      type="text"
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      className="input"
                      placeholder="Ad Soyad"
                    />
                  </div>
                  <div>
                    <label htmlFor="editJobTitle" className="label">
                      Ünvan
                    </label>
                    <input
                      id="editJobTitle"
                      type="text"
                      value={editJobTitle}
                      onChange={(e) => setEditJobTitle(e.target.value)}
                      className="input"
                      placeholder="Yazılım Geliştirici, Müdür, vb."
                    />
                  </div>
                  <div>
                    <label htmlFor="editOrgDepartment" className="label">
                      Organizasyon Departmanı
                    </label>
                    <input
                      id="editOrgDepartment"
                      type="text"
                      value={editOrgDepartment}
                      onChange={(e) => setEditOrgDepartment(e.target.value)}
                      className="input"
                      placeholder="İnsan Kaynakları, AR-GE, Finans, vb."
                    />
                  </div>
                  <div>
                    <label htmlFor="editDepartment" className="label">
                      Ticket Departmanı
                    </label>
                    <select
                      id="editDepartment"
                      value={editDepartmentId}
                      onChange={(e) => setEditDepartmentId(e.target.value ? Number(e.target.value) : '')}
                      className="input"
                    >
                      <option value="">Departman Seçiniz (Opsiyonel)</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn bg-blue-600 hover:bg-blue-700 text-white">
                    <Save size={18} className="mr-2 inline" />
                    Değişiklikleri Kaydet
                  </button>
                  <button 
                    type="button" 
                    onClick={cancelEditUser}
                    className="btn bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Kullanıcı Yönetimi</h3>
            
            {/* Filtreleme Alanları */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Search className="w-4 h-4 mr-2" />
                Filtrele
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Ara
                  </label>
                  <input
                    type="text"
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    className="input text-sm"
                    placeholder="Ad, email, kullanıcı adı..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Departman
                  </label>
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value ? Number(e.target.value) : '')}
                    className="input text-sm"
                  >
                    <option value="">Tümü</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Rol
                  </label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="input text-sm"
                  >
                    <option value="">Tümü</option>
                    <option value="SuperAdmin">SuperAdmin</option>
                    <option value="DepartmentManager">DepartmentManager</option>
                    <option value="Agent">Agent</option>
                    <option value="EndUser">EndUser</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Durum
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value ? Number(e.target.value) : '')}
                    className="input text-sm"
                  >
                    <option value="">Tümü</option>
                    <option value="0">Aktif</option>
                    <option value="1">Pasif</option>
                    <option value="2">Askıda</option>
                  </select>
                </div>
              </div>
            </div>
            
            {loadingUsers ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Henüz kullanıcı bulunmuyor. Yukarıdaki formu kullanarak kullanıcı oluşturun.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Ad Soyad</th>
                      <th>Kullanıcı Adı</th>
                      <th>Email</th>
                      <th>Organizasyon</th>
                      <th>Ticket Departmanı</th>
                      <th>Roller</th>
                      <th>Durum</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter((user) => {
                        // Arama filtresi
                        if (filterSearch) {
                          const search = filterSearch.toLowerCase();
                          const matchesSearch = 
                            user.displayName?.toLowerCase().includes(search) ||
                            user.username?.toLowerCase().includes(search) ||
                            user.email?.toLowerCase().includes(search) ||
                            user.organizationalDepartment?.toLowerCase().includes(search) ||
                            user.jobTitle?.toLowerCase().includes(search);
                          if (!matchesSearch) return false;
                        }
                        
                        // Departman filtresi
                        if (filterDepartment && user.departmentId !== filterDepartment) {
                          return false;
                        }
                        
                        // Rol filtresi
                        if (filterRole && !user.roles?.includes(filterRole)) {
                          return false;
                        }
                        
                        // Durum filtresi
                        if (filterStatus !== '' && user.status !== filterStatus) {
                          return false;
                        }
                        
                        return true;
                      })
                      .map((user) => {
                      const userDept = departments.find(d => d.id === user.departmentId);
                      return (
                        <tr key={user.id}>
                          <td className="font-medium">
                            <div>{user.displayName}</div>
                            {user.jobTitle && (
                              <div className="text-xs text-gray-500">{user.jobTitle}</div>
                            )}
                          </td>
                          <td className="text-sm text-gray-600">{user.username}</td>
                          <td className="text-sm text-gray-600">{user.email}</td>
                          <td className="text-sm">
                            {user.organizationalDepartment || <span className="text-gray-400">—</span>}
                          </td>
                          <td className="text-sm">{userDept?.name || '—'}</td>
                          <td>
                            {user.roles && user.roles.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {user.roles.map((role: string, idx: number) => (
                                  <span key={idx} className="badge badge-info text-xs">
                                    {role}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${user.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                              {user.status}
                            </span>
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEditUser(user)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium flex items-center transition-colors"
                                title="Düzenle"
                              >
                                <Edit size={16} className="mr-1" />
                                Düzenle
                              </button>
                              {canDeleteUsers && !user.roles?.includes('SuperAdmin') ? (
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm font-medium flex items-center transition-colors"
                                >
                                  <Trash2 size={16} className="mr-1" />
                                  Sil
                                </button>
                              ) : user.roles?.includes('SuperAdmin') ? (
                                <span className="text-gray-400 text-sm">Korumalı</span>
                              ) : (
                                <span className="text-gray-400 text-sm">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-2">Sistem Rolleri Hakkında:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Herkes EndUser:</strong> Tüm kullanıcılar otomatik olarak EndUser rolüyle oluşturulur ve ticket açabilir.</li>
                    <li><strong>Departman Rolleri:</strong> Kullanıcıları departmanlara atayarak ticket'ları yönetme yetkisi verebilirsiniz:
                      <ul className="list-disc list-inside ml-4 mt-1">
                        <li><strong>Departman Yöneticisi:</strong> Departman ticket'larını tam yönetim (atama, durum değiştirme, çözme)</li>
                        <li><strong>Departman Çalışanı:</strong> Departman ticket'larını çözebilir ve güncelleyebilir</li>
                      </ul>
                    </li>
                    <li><strong>Ticket Mantığı:</strong>
                      <ul className="list-disc list-inside ml-4 mt-1">
                        <li>Herkes herhangi bir departmana ticket oluşturabilir</li>
                        <li>Sadece o departmana atanan Manager/Staff ticket'ı yönetebilir ve çözebilir</li>
                        <li>Ticket sahibi kendi ticket'ını görebilir ama düzenleyemez</li>
                      </ul>
                    </li>
                  </ul>
                  <p className="mt-3 font-semibold">Departmana Kullanıcı Atamak İçin:</p>
                  <ol className="list-decimal list-inside space-y-1 mt-1">
                    <li><strong>Departmanlar</strong> sekmesine gidin</li>
                    <li>Departmanın <strong>"Üyeleri Göster"</strong> butonuna tıklayın</li>
                    <li>Altta <strong>"Kullanıcı Ata"</strong> bölümünden kullanıcıyı seçip rol atayın</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  );
}
