import { useEffect, useState } from 'react';
import { learningAPI, uploadFile } from '../../utils/api';
import { Plus, BookOpen, FileText, Download, Eye, Trash2, Edit, Upload, X, Check, File } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageLearning = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: null, // null for create
    title: '',
    description: '',
    category: 'Policy Papers',
    type: 'pdf',
    fileUrl: '',
    fileSize: '',
    pages: '',
    status: 'draft'
  });

  const categories = ['Policy Papers', 'Training Decks', 'Guidelines', 'Reports'];
  const types = ['pdf', 'ppt', 'doc'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await learningAPI.getAll();
      // Handle array vs response.data variation
      const data = Array.isArray(response) ? response : (response.data || []);
      setItems(data);
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Upload to server/Supabase
      const response = await uploadFile(file, 'learning-docs');
      const url = response.url || response; // Handle return format

      // 2. Auto-fill metadata
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

      setFormData(prev => ({
        ...prev,
        fileUrl: url,
        fileSize: sizeMB,
        // Auto-detect type from extension
        type: file.name.split('.').pop().toLowerCase().includes('ppt') ? 'ppt' : 'pdf'
      }));

    } catch (error) {
      console.error('Upload failed:', error);
      alert('File upload failed!');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await learningAPI.update(formData.id, formData);
      } else {
        await learningAPI.create(formData);
      }
      setShowModal(false);
      fetchData();
      resetForm();
    } catch (error) {
      console.error('Error saving module:', error);
      alert('Failed to save module');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await learningAPI.delete(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const openEdit = (item) => {
    setFormData({
      id: item.id,
      title: item.title,
      description: item.description || '',
      category: item.category,
      type: item.type,
      fileUrl: item.fileUrl || '',
      fileSize: item.fileSize || '',
      pages: item.pages || '',
      status: item.status
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      id: null,
      title: '',
      description: '',
      category: 'Policy Papers',
      type: 'pdf',
      fileUrl: '',
      fileSize: '',
      pages: '',
      status: 'draft'
    });
  };

  const getFileIcon = (type) => {
    const t = type?.toLowerCase();
    if (t === 'pdf') return <FileText size={24} className="text-red-500" />;
    if (t === 'ppt' || t === 'pptx') return <File size={24} className="text-orange-500" />;
    return <File size={24} className="text-gray-400" />;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <BookOpen size={28} />
              </div>
              Content Command Center
            </h1>
            <p className="text-gray-500 mt-2 ml-14">Manage and organize all learning resources.</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="btn-primary flex items-center gap-2 px-6 py-3 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus size={20} /> Add Resource
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase">Total Files</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{items.length}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><FileText size={24} /></div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase">Published</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{items.filter(i => i.status === 'published').length}</p>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-xl"><Check size={24} /></div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase">Total Downloads</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{items.reduce((acc, curr) => acc + (curr.downloads || 0), 0)}</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Download size={24} /></div>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group relative">
              {/* Header */}
              <div className="p-5 flex items-start gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  {getFileIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate" title={item.title}>{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{item.category} • {item.fileSize}</p>
                </div>
                <div className={`w-2 h-2 rounded-full mt-2 ${item.status === 'published' ? 'bg-green-500' : 'bg-gray-300'}`} title={item.status}></div>
              </div>

              {/* Actions Overlay (Visible on Hover) */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded-lg backdrop-blur">
                <button onClick={() => openEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit">
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Footer */}
              <div className="px-5 pb-5 pt-0 flex justify-between items-end">
                <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">
                  {item.status.toUpperCase()}
                </span>
                {item.fileUrl && (
                  <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline flex items-center gap-1">
                    View File <Eye size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold">{formData.id ? 'Edit Resource' : 'New Resource'}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* File Upload Section */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
                  {uploading ? (
                    <div className="text-blue-600 animate-pulse font-medium">Uploading...</div>
                  ) : formData.fileUrl ? (
                    <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                      <Check size={20} /> File Ready ({formData.fileSize})
                      <button
                        type="button"
                        className="ml-2 text-xs text-red-500 underline"
                        onClick={() => setFormData(p => ({ ...p, fileUrl: '', fileSize: '' }))}
                      >Change</button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                      <span className="text-sm text-gray-600">Click to upload document</span>
                      <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.ppt,.pptx,.doc,.docx" />
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text" required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pages</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 border rounded-lg outline-none"
                      value={formData.pages}
                      onChange={e => setFormData({ ...formData, pages: parseInt(e.target.value) || '' })}
                      placeholder="e.g. 12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg outline-none"
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value })}
                    >
                      {types.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows="3"
                    className="w-full px-4 py-2 border rounded-lg outline-none"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className={`w-full py-3 rounded-xl font-bold text-white transition-all ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg'}`}
                >
                  {formData.id ? 'Save Changes' : 'Create Resource'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ManageLearning;
