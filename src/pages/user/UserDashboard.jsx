import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../supabase/config';
import { FileText, Clock, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const UserDashboard = () => {
  const { currentUser } = useAuth();
  const [supportRequests, setSupportRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    declined: 0,
  });

  useEffect(() => {
    if (currentUser && currentUser.email) {
      fetchSupportRequests();
    }
  }, [currentUser]);

  const fetchSupportRequests = async () => {
    try {
      setLoading(true);
      const userEmail = currentUser.email;

      // Fetch only support requests from Supabase filtered by created_by
      const { data, error } = await supabase
        .from('support_requests')
        .select('*')
        .eq('created_by', userEmail)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching support requests:', error);
        setSupportRequests([]);
      } else {
        setSupportRequests(data || []);

        // Calculate stats
        const stats = {
          total: (data || []).length,
          pending: (data || []).filter(s => s.status === 'pending').length,
          approved: (data || []).filter(s => s.status === 'approved').length,
          declined: (data || []).filter(s => s.status === 'declined').length,
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching support requests:', error);
      setSupportRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock size={12} className="mr-1" />
            Pending
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle size={12} className="mr-1" />
            Declined
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date?.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-undp-blue text-white py-8">
        <div className="section-container">
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-lg opacity-90">Manage your support requests and track their status</p>
        </div>
      </div>

      <div className="section-container py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Requests</p>
                    <p className="text-3xl font-bold text-undp-blue">{stats.total}</p>
                  </div>
                  <HelpCircle className="text-undp-blue" size={32} />
                </div>
              </div>
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending Review</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <Clock className="text-yellow-600" size={32} />
                </div>
              </div>
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Approved</p>
                    <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                  </div>
                  <CheckCircle className="text-green-600" size={32} />
                </div>
              </div>
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Declined</p>
                    <p className="text-3xl font-bold text-red-600">{stats.declined}</p>
                  </div>
                  <XCircle className="text-red-600" size={32} />
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="card mb-8">
              <h2 className="text-xl font-bold text-undp-blue mb-4">Account Information</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold">{currentUser?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Account Type:</span>
                  <span className="font-semibold">{currentUser?.isAdmin ? 'Administrator' : 'User'}</span>
                </div>
              </div>
            </div>

            {/* Support Requests Section */}
            {supportRequests.length > 0 && (
              <div className="card mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <HelpCircle className="text-undp-blue" size={24} />
                  <h2 className="text-xl font-bold text-undp-blue">My Support Requests</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-undp-light-grey">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Request Title</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Support Type</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Duration</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Submitted</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {supportRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-undp-light-grey">
                          <td className="px-4 py-3 font-medium">{request.title}</td>
                          <td className="px-4 py-3 text-gray-600">{request.support_type || 'N/A'}</td>
                          <td className="px-4 py-3 text-gray-600">{request.duration || 'N/A'}</td>
                          <td className="px-4 py-3 text-gray-600">{formatDate(request.created_at)}</td>
                          <td className="px-4 py-3">{getStatusBadge(request.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Empty State */}
            {stats.total === 0 && (
              <div className="card text-center py-12">
                <HelpCircle className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Support Requests Yet</h3>
                <p className="text-gray-600 mb-6">Submit a support request to see it here!</p>
                <a href="/projects" className="btn-primary inline-flex items-center space-x-2">
                  <span>Submit Support Request</span>
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
