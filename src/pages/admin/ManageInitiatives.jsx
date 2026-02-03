import { useEffect, useState } from 'react';
import { initiativesAPI, settingsAPI } from '../../utils/api';
import { Plus, Edit2, Trash2, Search, X, Save, Lightbulb, CheckCircle, Clock, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageInitiatives = () => {
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isSectionVisible, setIsSectionVisible] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    documentUrl: '',
    documentName: '',
    type: '',
    result: '',
    impact: '',
    status: 'pending'
  });

  useEffect(() => {
    fetchData();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await settingsAPI.get('initiative_visibility');
      setIsSectionVisible(res.data.value);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const toggleVisibility = async () => {
    try {
      const newValue = !isSectionVisible;
      setIsSectionVisible(newValue); // Optimistic update
      await settingsAPI.update('initiative_visibility', newValue);
    } catch (error) {
      console.error('Error updating setting:', error);
      setIsSectionVisible(!isSectionVisible); // Revert on error
      alert('Failed to update visibility setting');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await initiativesAPI.getAll();
      setInitiatives(response.data);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to fetch initiatives');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        await initiativesAPI.update(editingItem.id, formData);
        alert('Initiative updated successfully!');
      } else {
        await initiativesAPI.create(formData);
        alert('Initiative created successfully!');
      }
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save initiative: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      documentUrl: item.documentUrl || '',
      documentName: item.documentName || '',
      type: item.type || '',
      result: item.result || '',
      impact: item.impact || '',
      status: item.status || 'pending'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await initiativesAPI.delete(id);
      alert('Deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      documentUrl: '',
      documentName: '',
      type: '',
      result: '',
      impact: '',
      status: 'pending'
    });
    setEditingItem(null);
    setShowModal(false);
  };

  const filteredData = initiatives.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Lightbulb className="text-purple-600" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Manage Initiatives</h1>
                <p className="text-sm text-gray-500">{initiatives.length} total initiatives</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Visibility Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg mr-2 border border-gray-200">
                <span className="text-sm font-medium text-gray-700">Section Visibility:</span>
                <button
                  onClick={toggleVisibility}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${isSectionVisible ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`${isSectionVisible ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </button>
                <span className="text-xs text-gray-500 w-16">
                  {isSectionVisible ? 'Visible' : 'Hidden'}
                </span>
              </div>

              <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                <Plus size={20} />
                Add Initiative
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search initiatives..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">No initiatives found</td></tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{item.description}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.type || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {item.status === 'published' ? <><CheckCircle size={12} className="mr-1" /> Published</> : <><Clock size={12} className="mr-1" /> Pending</>}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900"><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={resetForm}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{editingItem ? 'Edit Initiative' : 'Add New Initiative'}</h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea rows="3" required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Impact *</label>
                  <textarea rows="2" required value={formData.impact} onChange={(e) => setFormData({ ...formData, impact: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <input type="text" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                    <select required value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="pending">Pending</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
                    {submitting ? <LoadingSpinner size="sm" color="white" /> : <Save size={18} />}
                    {submitting ? 'Saving...' : 'Save Initiative'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageInitiatives;
