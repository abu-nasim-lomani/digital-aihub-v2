import { useEffect, useState } from 'react';
import { standardsAPI, uploadFile } from '../../utils/api';
import { Plus, FileText, Edit2, Trash2, X, Upload, Check, AlertCircle, File, Download } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageStandards = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    category: 'DPI',
    description: '',
    fileUrl: '',
    status: 'pending'
  });

  const categories = ['DPI', 'LGI', 'Policy', 'Guideline', 'Framework'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await standardsAPI.getAll();
      const data = Array.isArray(response) ? response : (response.data || []);
      setItems(data);
    } catch (error) {
      console.error('Error fetching standards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadFile(file);
      setFormData(prev => ({ ...prev, fileUrl: response.url }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (formData.id) {
        await standardsAPI.update(formData.id, formData);
      } else {
        await standardsAPI.create(formData);
      }
      setShowModal(false);
      fetchData();
      resetForm();
    } catch (error) {
      console.error('Error saving standard:', error);
      alert('Failed to save standard');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this standard?')) return;
    try {
      await standardsAPI.delete(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const openEdit = (item) => {
    setFormData({
      id: item.id,
      title: item.title,
      category: item.category || 'DPI',
      description: item.description || '',
      fileUrl: item.fileUrl || '',
      status: item.status
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      id: null,
      title: '',
      category: 'DPI',
      description: '',
      fileUrl: '',
      status: 'pending'
    });
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
                <FileText size={28} />
              </div>
              Standards & Policies
            </h1>
            <p className="text-gray-500 mt-2 ml-14">Manage downloadable standards, frameworks, and policy documents.</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="btn-primary flex items-center gap-2 px-6 py-3 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus size={20} /> Add Standard
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase">Total Documents</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{items.length}</p>
            </div>
            <FileText size={32} className="text-gray-300" />
          </div>
          {/* Add more stats if needed */}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group flex flex-col h-full">

              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    {item.category}
                  </span>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide
                                ${item.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {item.status}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-3 flex-1">{item.description}</p>

                {item.fileUrl && (
                  <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <File size={16} />
                    <span className="truncate flex-1">View Document</span>
                    <Download size={14} />
                  </a>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                  <button onClick={() => openEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 text-sm font-semibold">
                    <Edit2 size={16} /> Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 text-sm font-semibold">
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold">{formData.id ? 'Edit Standard' : 'New Standard'}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text" required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. National AI Policy 2025"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
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
                      <option value="pending">Pending</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief summary of the document..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Document File</label>

                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-white transition-colors">
                    {formData.fileUrl ? (
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Check size={24} />
                        </div>
                        <p className="text-sm font-medium text-green-800">File attached successfully</p>
                        <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">{formData.fileUrl}</p>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, fileUrl: '' })}
                          className="text-xs text-red-600 font-bold mt-2 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        {uploading ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <div className="text-center relative">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-900">Click to upload document</p>
                            <p className="text-xs text-gray-500 mt-1">PDF, DOCX, PPT (Max 10MB)</p>
                            <input
                              type="file"
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              onChange={handleFileUpload}
                              accept=".pdf,.doc,.docx,.ppt,.pptx"
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg transition-all"
                  >
                    {saving ? 'Saving...' : (formData.id ? 'Save Changes' : 'Publish Standard')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ManageStandards;
