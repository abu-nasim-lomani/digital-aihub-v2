import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/config';
import { CheckCircle, XCircle, FileText, Eye } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageSupportRequests = () => {
  const [supportRequests, setSupportRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchSupportRequests();
  }, []);

  const fetchSupportRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('support_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSupportRequests(data || []);
    } catch (error) {
      console.error('Error fetching support requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm('Are you sure you want to approve this support request?')) {
      try {
        const { error } = await supabase
          .from('support_requests')
          .update({ status: 'approved' })
          .eq('id', id);
        if (error) throw error;
        fetchSupportRequests();
        setSelectedRequest(null);
      } catch (error) {
        console.error('Error approving support request:', error);
        alert('Error approving support request. Please try again.');
      }
    }
  };

  const handleDecline = async (id) => {
    if (window.confirm('Are you sure you want to decline this support request?')) {
      try {
        const { error } = await supabase
          .from('support_requests')
          .update({ status: 'declined' })
          .eq('id', id);
        if (error) throw error;
        fetchSupportRequests();
        setSelectedRequest(null);
      } catch (error) {
        console.error('Error declining support request:', error);
        alert('Error declining support request. Please try again.');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
            Approved
          </span>
        );
      case 'declined':
        return (
          <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
            Declined
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-undp-light-grey p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-undp-blue">Manage Support Requests</h1>
          <p className="text-gray-600 mt-2">Review and manage user support requests</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 mt-4">Loading support requests...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-undp-light-grey">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Support Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Requested By</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {supportRequests.length > 0 ? (
                  supportRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-undp-light-grey">
                      <td className="px-6 py-4 font-semibold">{request.title}</td>
                      <td className="px-6 py-4">{request.support_type || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-600">{request.created_by || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(request.created_at)}</td>
                      <td className="px-6 py-4">{getStatusBadge(request.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="p-2 text-undp-blue hover:bg-undp-light-grey rounded"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(request.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded"
                                title="Approve"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button
                                onClick={() => handleDecline(request.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                title="Decline"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No support requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Request Details Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-undp-blue">{selectedRequest.title}</h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Request Title</h3>
                  <p className="text-gray-800 text-lg">{selectedRequest.title}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Support Type</h3>
                  <span className="inline-block bg-undp-blue text-white px-3 py-1 rounded-full text-sm font-medium">
                    {selectedRequest.support_type || 'N/A'}
                  </span>
                </div>
                
                {selectedRequest.duration && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Expected Duration</h3>
                    <p className="text-gray-600">{selectedRequest.duration}</p>
                  </div>
                )}
                
                {selectedRequest.impact && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Description/Impact</h3>
                    <p className="text-gray-600 whitespace-pre-line">{selectedRequest.impact}</p>
                  </div>
                )}
                
                {selectedRequest.document_url && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Supporting Documents</h3>
                    <a
                      href={selectedRequest.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary inline-flex items-center space-x-2"
                    >
                      <FileText size={18} />
                      <span>View Document</span>
                    </a>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Requested By</h3>
                  <p className="text-gray-600">{selectedRequest.created_by || 'N/A'}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Date Submitted</h3>
                  <p className="text-gray-600">{formatDate(selectedRequest.created_at)}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Status</h3>
                  {getStatusBadge(selectedRequest.status)}
                </div>

                {selectedRequest.status === 'pending' && (
                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <button
                      onClick={() => {
                        handleDecline(selectedRequest.id);
                      }}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <XCircle size={18} />
                      <span>Decline</span>
                    </button>
                    <button
                      onClick={() => {
                        handleApprove(selectedRequest.id);
                      }}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <CheckCircle size={18} />
                      <span>Approve</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageSupportRequests;
