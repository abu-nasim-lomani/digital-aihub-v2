import { useEffect, useState } from 'react';
import { supportRequestsAPI } from '../../utils/api';
import { HelpCircle, Eye, CheckCircle, XCircle, Clock, Trash2, BarChart2, Save, X } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageSupportRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Progress Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressData, setProgressData] = useState({ progress: 0, workUpdate: '' });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await supportRequestsAPI.getAll();
      setRequests(response.data);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to fetch support requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await supportRequestsAPI.updateStatus(id, status);
      fetchRequests();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update status');
    }
  };

  const handleProgressClick = (req) => {
    setSelectedRequest(req);
    setProgressData({ progress: req.progress || 0, workUpdate: '' });
    setShowProgressModal(true);
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await supportRequestsAPI.updateProgress(selectedRequest.id, parseInt(progressData.progress), progressData.workUpdate);
      setShowProgressModal(false);
      fetchRequests();
      alert('Progress updated successfully!');
    } catch (error) {
      console.error('Error updating progress:', error);
      alert('Failed to update progress');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await supportRequestsAPI.delete(id);
      fetchRequests();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete');
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <HelpCircle className="text-purple-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Support Requests</h1>
              <p className="text-sm text-gray-500">{requests.length} total requests</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex gap-2">
          {['all', 'pending', 'approved', 'declined'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium ${filter === status ? 'bg-undp-blue text-white' : 'bg-white text-gray-700'
                }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRequests.map(req => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{req.title}</div>
                    <div className="text-sm text-gray-500">{req.impact?.substring(0, 100)}...</div>
                  </td>
                  <td className="px-6 py-4 text-sm">{req.supportType || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${req.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold">{req.progress || 0}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${req.status === 'approved' ? 'bg-green-100 text-green-800' :
                      req.status === 'declined' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {req.status === 'approved' && (
                      <button
                        onClick={() => handleProgressClick(req)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Update Progress"
                      >
                        <BarChart2 size={18} />
                      </button>
                    )}
                    {req.status === 'pending' && (
                      <>
                        <button onClick={() => handleStatusUpdate(req.id, 'approved')} className="text-green-600 hover:text-green-900">
                          <CheckCircle size={18} />
                        </button>
                        <button onClick={() => handleStatusUpdate(req.id, 'declined')} className="text-red-600 hover:text-red-900">
                          <XCircle size={18} />
                        </button>
                      </>
                    )}
                    <button onClick={() => handleDelete(req.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Progress Update Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Update Progress</h3>
              <button onClick={() => setShowProgressModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <form onSubmit={handleProgressSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Progress Percentage ({progressData.progress}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressData.progress}
                  onChange={(e) => setProgressData({ ...progressData, progress: e.target.value })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Work Update / Note</label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  rows="4"
                  placeholder="Describe what has been done..."
                  value={progressData.workUpdate}
                  onChange={(e) => setProgressData({ ...progressData, workUpdate: e.target.value })}
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">This update will be visible to the user.</p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowProgressModal(false)}
                  className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save size={18} />
                  {updating ? 'Saving...' : 'Save Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSupportRequests;
