import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/config';
import { ArrowLeft, Download, FileText, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';
import { useRequireAuth } from '../utils/requireAuth';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requireAuth } = useRequireAuth();
  const [project, setProject] = useState(null);
  const [supportRequests, setSupportRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ongoing'); // 'ongoing' or 'completed'

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProject = async () => {
      try {
        // Fetch project by ID directly from Supabase
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .eq('status', 'published')
          .single();

        if (error) {
          console.error('Error fetching project:', error);
          setProject(null);
        } else if (data) {
          // Map snake_case to camelCase for display
          const mappedData = {
            ...data,
            supportType: data.support_type || data.supportType,
            documentUrl: data.document_url || data.documentUrl,
          };
          setProject(mappedData);

          // Fetch related support requests
          const { data: requestsData, error: requestsError } = await supabase
            .from('support_requests')
            .select('*')
            .eq('project_id', id)
            .order('created_at', { ascending: false });

          if (requestsError) {
            console.error('Error fetching support requests:', requestsError);
          } else {
            setSupportRequests(requestsData || []);
          }

        } else {
          setProject(null);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="section-container py-12">
          <SkeletonLoader type="card" count={1} />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-white">
        <div className="section-container py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Project Not Found</h1>
            <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/projects')}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <ArrowLeft size={18} />
              <span>Back to Projects</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      {/* Hero Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => window.location.href = '/'}
            className="group inline-flex items-center space-x-2 text-gray-500 hover:text-undp-blue transition-colors px-3 py-2 rounded-lg hover:bg-blue-50"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-semibold text-sm">Back to Projects</span>
          </button>

          <div className="hidden md:block text-sm text-gray-400 font-medium">
            Project Details
          </div>
        </div>
      </div>

      {/* Title & Banner Section */}
      <div className="text-white py-10 md:py-12 relative overflow-hidden" style={{ backgroundColor: 'rgb(0 61 107 / var(--tw-bg-opacity, 1))' }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-2xl md:text-4xl font-bold max-w-4xl leading-tight tracking-tight">
            {project.title}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 pb-20">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Main Project Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
            <div className="flex flex-col md:flex-row gap-10">
              <div className="flex-grow space-y-8">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Project Impact & Description</h3>
                  <div className="prose prose-blue max-w-none">
                    <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                      {project.impact || 'No description available for this project.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sidebar / Sidebar-like area for Documents */}
              {project.documentUrl && (
                <div className="md:w-80 flex-shrink-0">
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 sticky top-24">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <FileText size={16} className="text-undp-blue" />
                      Project Documents
                    </h3>
                    <a
                      href={project.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        if (!requireAuth('download this document')) {
                          e.preventDefault();
                        }
                      }}
                      className="w-full btn-primary flex items-center justify-center space-x-2 py-3 shadow-md hover:shadow-lg transform active:scale-95 transition-all"
                    >
                      <Download size={18} />
                      <span>Download Details</span>
                    </a>
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      Download the full project documentation and reports.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Support Requests Section */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                Support Requests
              </h2>

              {/* Tabs */}
              <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                <button
                  onClick={() => setActiveTab('ongoing')}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === 'ongoing'
                    ? 'bg-white text-undp-blue shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Ongoing & Pending
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === 'completed'
                    ? 'bg-white text-undp-blue shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Completed & History
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {(() => {
              const ongoingStatuses = ['approved', 'in_progress', 'ongoing'];
              const completedStatuses = ['declined', 'completed', 'resolved', 'closed'];

              const filteredRequests = supportRequests.filter(req =>
                activeTab === 'ongoing'
                  ? ongoingStatuses.includes(req.status)
                  : completedStatuses.includes(req.status)
              );

              if (filteredRequests.length > 0) {
                return (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {filteredRequests.map((request) => (
                      <div key={request.id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-4">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide flex items-center gap-1.5
                                    ${(request.status === 'approved' || request.status === 'ongoing') ? 'bg-green-50 text-green-700 border border-green-100' :
                              request.status === 'declined' ? 'bg-red-50 text-red-700 border border-red-100' :
                                request.status === 'completed' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                  'bg-yellow-50 text-yellow-700 border border-yellow-100'}`}>
                            {(request.status === 'approved' || request.status === 'ongoing') ? <CheckCircle size={12} /> :
                              request.status === 'declined' ? <XCircle size={12} /> :
                                request.status === 'completed' ? <CheckCircle size={12} /> :
                                  <Clock size={12} />}
                            {(request.status === 'approved' || request.status === 'ongoing') ? 'OnGoing' : request.status}
                          </span>
                          <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md">
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-undp-blue transition-colors line-clamp-1">
                          {request.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          <span className="text-xs font-semibold text-undp-blue bg-blue-50 px-2.5 py-1 rounded-md">
                            {request.support_type}
                          </span>
                          {request.duration && (
                            <span className="text-xs text-gray-500 flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-md">
                              <Clock size={12} />
                              {request.duration}
                            </span>
                          )}
                        </div>

                        {/* Progress Section */}
                        {(request.status === 'approved' || request.status === 'ongoing') && request.progress !== undefined && (
                          <div className="mb-4">
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="font-semibold text-gray-700">Progress</span>
                              <span className="font-bold text-undp-blue">{request.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-undp-blue h-2 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${request.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {request.impact && (
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-3">
                            {request.impact}
                          </p>
                        )}

                        {/* Remarks / Updates List */}
                        {request.work_updates && request.work_updates.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-50">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Remarks / Updates</h4>
                            <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                              {request.work_updates.map((update, idx) => (
                                <div key={idx} className="bg-gray-50 p-2 rounded text-xs text-gray-700 border border-gray-100/50">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className={`font-semibold ${update.status_change === 'ongoing' ? 'text-blue-600' :
                                      update.status_change === 'completed' ? 'text-green-600' :
                                        update.status_change === 'declined' ? 'text-red-600' :
                                          'text-undp-blue'
                                      }`}>
                                      {update.status_change ? `Status: ${update.status_change}` : 'Update'}
                                    </span>
                                    <span className="text-gray-400 text-[10px]">{new Date(update.date).toLocaleDateString()}</span>
                                  </div>
                                  <p className="italic">"{update.message}"</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              } else {
                return (
                  <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200 shadow-sm animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                      {activeTab === 'ongoing' ? <Clock size={32} /> : <CheckCircle size={32} />}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {activeTab === 'ongoing' ? 'No Ongoing Requests' : 'No Completed History'}
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      {activeTab === 'ongoing'
                        ? 'There are no active or pending support requests at the moment.'
                        : 'No past or completed support requests found for this project.'}
                    </p>
                  </div>
                );
              }
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
