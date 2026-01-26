import { useEffect, useState } from 'react';
import { supportRequestsAPI } from '../../utils/api';
import { HelpCircle, Eye, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageSupportRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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
      alert('Status updated successfully!');
      fetchRequests();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await supportRequestsAPI.delete(id);
      alert('Deleted successfully!');
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
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${req.status === 'approved' ? 'bg-green-100 text-green-800' :
                        req.status === 'declined' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                      }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
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
    </div>
  );
};

export default ManageSupportRequests;
