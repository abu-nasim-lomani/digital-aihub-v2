import { useEffect, useState } from 'react';
import { eventsAPI, settingsAPI } from '../../utils/api';
import { Plus, Calendar, MapPin, Edit, Trash2, X, Check, Eye, EyeOff, Users } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageEvents = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSectionVisible, setIsSectionVisible] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    description: '',
    outcome: '',
    date: '',
    type: 'Workshop',
    location: '',
    status: 'pending'
  });

  const eventTypes = ['Workshop', 'Seminar', 'Conference', 'Hackathon', 'Webinar'];

  useEffect(() => {
    fetchData();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await settingsAPI.get('event_visibility');
      setIsSectionVisible(res.data.value);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const toggleVisibility = async () => {
    try {
      const newValue = !isSectionVisible;
      setIsSectionVisible(newValue); // Optimistic update
      await settingsAPI.update('event_visibility', newValue);
    } catch (error) {
      console.error('Error updating setting:', error);
      setIsSectionVisible(!isSectionVisible); // Revert on error
      alert('Failed to update visibility setting');
    }
  };

  const fetchData = async () => {
    try {
      const response = await eventsAPI.getAll();
      const data = Array.isArray(response) ? response : (response.data || []);
      setItems(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Ensure date is properly formatted if needed, basic string for now based on input type="date"
      if (formData.id) {
        await eventsAPI.update(formData.id, formData);
      } else {
        await eventsAPI.create(formData);
      }
      setShowModal(false);
      fetchData();
      resetForm();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventsAPI.delete(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const openEdit = (item) => {
    setFormData({
      id: item.id,
      title: item.title,
      description: item.description,
      outcome: item.outcome,
      date: item.date ? item.date.split('T')[0] : '', // Format for input date
      type: item.type,
      location: item.location || '',
      status: item.status
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      id: null,
      title: '',
      description: '',
      outcome: '',
      date: '',
      type: 'Workshop',
      location: '',
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
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <Calendar size={28} />
              </div>
              Events Manager
            </h1>
            <p className="text-gray-500 mt-2 ml-14">Organize workshops, seminars and key milestones.</p>
          </div>

          <div className="flex gap-3">
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

            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="btn-primary flex items-center gap-2 px-6 py-3 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus size={20} /> Create Event
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase">Total Events</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{items.length}</p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Calendar size={24} /></div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase">Upcoming</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {items.filter(i => new Date(i.date) > new Date()).length}
              </p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {items.filter(i => new Date(i.date) <= new Date() && i.status === 'completed').length}
              </p>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-xl"><Check size={24} /></div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group relative flex flex-col">
              {/* Header */}
              <div className="p-5 flex items-start gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg flex flex-col items-center justify-center min-w-[60px]">
                  <span className="text-xs font-bold uppercase">{new Date(item.date).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-xl font-bold">{new Date(item.date).getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate" title={item.title}>{item.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <MapPin size={12} /> {item.location || 'Online'}
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide
                            ${item.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                    item.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {item.status}
                </div>
              </div>

              <div className="px-5 pb-4 flex-1">
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{item.description}</p>
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  <span className="font-semibold text-gray-700">Outcome:</span> {item.outcome}
                </div>
              </div>

              {/* Actions Overlay */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded-lg backdrop-blur shadow-sm">
                <button onClick={() => openEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit">
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Footer */}
              <div className="px-5 pb-5 pt-0 flex justify-between items-center border-t border-gray-100 mt-auto pt-3">
                <span className="text-xs text-gray-400 font-medium">{item.type}</span>
                {/* More actions if needed */}
              </div>
            </div>
          ))}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold">{formData.id ? 'Edit Event' : 'New Event'}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text" required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date" required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value })}
                    >
                      {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="e.g. Conference Hall A / Online"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows="3"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Outcome / Goal</label>
                  <textarea
                    rows="2"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.outcome}
                    onChange={e => setFormData({ ...formData, outcome: e.target.value })}
                    placeholder="What is the expected impact?"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-lg transition-all"
                >
                  {saving ? 'Saving...' : (formData.id ? 'Save Changes' : 'Create Event')}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ManageEvents;
