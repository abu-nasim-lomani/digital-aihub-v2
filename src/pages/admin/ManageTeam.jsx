import { useEffect, useState } from 'react';
import { teamAPI, uploadFile } from '../../utils/api';
import { Plus, Users, Edit2, Trash2, X, Upload, Linkedin, Mail, Check, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageTeam = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    designation: '',
    section: 'Leadership',
    email: '',
    linkedin: '',
    photoUrl: '',
    displayOrder: 0,
    status: 'pending'
  });

  const sections = ['Leadership', 'Technical', 'Advisory', 'Operations'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await teamAPI.getAll();
      const data = Array.isArray(response) ? response : (response.data || []);
      setItems(data);
    } catch (error) {
      console.error('Error fetching team:', error);
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
      setFormData(prev => ({ ...prev, photoUrl: response.url }));
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
        await teamAPI.update(formData.id, formData);
      } else {
        await teamAPI.create(formData);
      }
      setShowModal(false);
      fetchData();
      resetForm();
    } catch (error) {
      console.error('Error saving member:', error);
      alert('Failed to save team member');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;
    try {
      await teamAPI.delete(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const openEdit = (item) => {
    setFormData({
      id: item.id,
      name: item.name,
      designation: item.designation,
      section: item.section || 'Leadership',
      email: item.email || '',
      linkedin: item.linkedin || '',
      photoUrl: item.photoUrl || '',
      displayOrder: item.displayOrder || 0,
      status: item.status
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      id: null,
      name: '',
      designation: '',
      section: 'Leadership',
      email: '',
      linkedin: '',
      photoUrl: '',
      displayOrder: 0,
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
                <Users size={28} />
              </div>
              Team Management
            </h1>
            <p className="text-gray-500 mt-2 ml-14">Manage team members, roles and visibility.</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="btn-primary flex items-center gap-2 px-6 py-3 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus size={20} /> Add Member
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase">Total Members</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{items.length}</p>
            </div>
            <Users size={32} className="text-gray-300" />
          </div>
          {/* Add more stats if needed */}
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group relative flex flex-col items-center p-6 text-center">

              {/* Status Badge */}
              <div className={`absolute top-3 right-3 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide
                        ${item.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {item.status}
              </div>

              {/* Photo */}
              <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-gray-100 shadow-sm">
                <img
                  src={item.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random`}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
              <p className="text-sm text-blue-600 font-medium mb-1">{item.designation}</p>
              <p className="text-xs text-gray-400 uppercase tracking-widest">{item.section}</p>

              {/* Socials */}
              <div className="flex gap-3 mt-4 text-gray-400">
                {item.linkedin && <Linkedin size={16} />}
                {item.email && <Mail size={16} />}
              </div>

              {/* Actions Overlay */}
              <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold">{formData.id ? 'Edit Member' : 'New Team Member'}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="flex gap-8">
                  {/* Left: Photo Upload */}
                  <div className="w-1/3 flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden mb-3 bg-gray-50 relative group">
                      {formData.photoUrl ? (
                        <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-4">
                          {uploading ? <LoadingSpinner size="sm" /> : <Upload className="mx-auto text-gray-400 mb-2" />}
                          <span className="text-xs text-gray-500">Upload Photo</span>
                        </div>
                      )}
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFileUpload}
                        accept="image/*"
                      />
                    </div>
                    <p className="text-xs text-center text-gray-400">Click to upload (Max 2MB)</p>
                  </div>

                  {/* Right: Fields */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text" required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                      <input
                        type="text" required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.designation}
                        onChange={e => setFormData({ ...formData, designation: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                        <select
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          value={formData.section}
                          onChange={e => setFormData({ ...formData, section: e.target.value })}
                        >
                          {sections.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                        <input
                          type="number"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          value={formData.displayOrder}
                          onChange={e => setFormData({ ...formData, displayOrder: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL (Optional)</label>
                    <input
                      type="url"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.linkedin}
                      onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                    />
                  </div>
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

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg transition-all"
                >
                  {saving ? 'Saving...' : (formData.id ? 'Save Changes' : 'Add Member')}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ManageTeam;
