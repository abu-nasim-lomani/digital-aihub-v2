import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectsAPI, supportRequestsAPI } from '../utils/api';
import { ArrowLeft, Calendar, FileText, ExternalLink, Briefcase, User, CheckCircle, Clock } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [supportRequests, setSupportRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        // Fetch project and support requests in parallel
        const [projectRes, supportRes] = await Promise.all([
          projectsAPI.getById(id),
          supportRequestsAPI.getAll()
        ]);

        setProject(projectRes.data);

        // Filter support requests for this project
        const projectRequests = (supportRes.data || []).filter(
          req => req.projectId === id
        );
        setSupportRequests(projectRequests);

      } catch (error) {
        console.error('Error fetching project data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h2>
          <Link to="/projects" className="text-blue-600 hover:underline">
            ← Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#003359] text-white py-12">
        <div className="section-container">
          <Link to="/projects" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 transition-colors font-semibold">
            <ArrowLeft size={20} />
            Back to Projects
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{project.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-blue-100">
            {project.status && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${project.status === 'published' ? 'bg-green-500/20 text-green-200 border border-green-500/30' :
                project.status === 'pending' ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/30' :
                  'bg-gray-500/20 text-gray-200 border border-gray-500/30'
                }`}>
                {project.status === 'published' ? 'Active' : project.status}
              </span>
            )}
            {project.createdAt && (
              <span className="flex items-center gap-2 opacity-80">
                <Calendar size={16} />
                Started: {new Date(project.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="section-container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Project Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              {/* Description */}
              {project.description && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="text-[#003359]" size={24} />
                    Project Overview
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg">{project.description}</p>
                </div>
              )}

              {/* Impact */}
              {project.impact && (
                <div className="mb-8 p-6 bg-blue-50/50 rounded-xl border border-blue-100">
                  <h2 className="text-xl font-bold text-[#003359] mb-3">Expected Impact</h2>
                  <p className="text-gray-700 leading-relaxed">{project.impact}</p>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                {project.supportType && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Support Type</h3>
                    <p className="text-gray-900 font-medium">{project.supportType}</p>
                  </div>
                )}

                {project.duration && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Duration</h3>
                    <p className="text-gray-900 font-medium">{project.duration}</p>
                  </div>
                )}
              </div>

              {/* Document Link */}
              {project.documentUrl && (
                <div className="pt-6 mt-6 border-t border-gray-100">
                  <a
                    href={project.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#003359] text-white rounded-xl hover:bg-[#002845] font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <FileText size={20} />
                    View Documentation
                    <ExternalLink size={16} />
                  </a>
                </div>
              )}
            </div>

            {/* Support Requests List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Briefcase className="text-[#003359]" size={28} />
                  Support Requests
                </h2>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-bold rounded-full">
                  {supportRequests.length} Requests
                </span>
              </div>

              {supportRequests.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No support requests found for this project</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {supportRequests.map((req) => (
                    <div key={req.id} className="group p-5 bg-gray-50 hover:bg-white border border-gray-200 hover:border-blue-200 rounded-xl transition-all hover:shadow-md">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${req.status === 'resolved' ? 'bg-green-100 text-green-700 border-green-200' :
                              req.status === 'viewed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                'bg-yellow-100 text-yellow-700 border-yellow-200'
                              }`}>
                              {req.status || 'Pending'}
                            </span>
                            <span className="text-xs font-semibold text-gray-400">
                              {new Date(req.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#003359] transition-colors">
                            {req.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 shadow-sm">
                            {req.supportType}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{req.impact}</p>

                      <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-200 pt-3">
                        <div className="flex items-center gap-1.5">
                          <User size={14} />
                          <span className="font-medium truncate max-w-[150px]">
                            {req.guestName ? `${req.guestName} (Guest)` : (req.creator?.fullName || req.creator?.email || 'Anonymous')}
                          </span>
                        </div>
                        {req.duration && (
                          <div className="flex items-center gap-1.5">
                            <Clock size={14} />
                            <span>{req.duration}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-[#003359] to-[#004d7a] rounded-2xl p-6 text-white shadow-lg">
              <h3 className="text-xl font-bold mb-4">Project Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-blue-200 text-sm">Status</span>
                  <span className="font-bold flex items-center gap-2">
                    {project.status === 'published' ? <CheckCircle size={16} className="text-green-400" /> : <Clock size={16} className="text-yellow-400" />}
                    {project.status}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-blue-200 text-sm">Total Requests</span>
                  <span className="font-bold text-2xl">{supportRequests.length}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-blue-200 text-sm">Resolved</span>
                  <span className="font-bold text-2xl text-green-300">
                    {supportRequests.filter(r => r.status === 'resolved').length}
                  </span>
                </div>
                <div className="pt-2">
                  <p className="text-xs text-blue-200 leading-relaxed opacity-80">
                    This summary provides real-time insights into support activities related to this project.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact / Help Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-500 mb-4">
                If you have questions about this project or need additional support, contact the project lead.
              </p>
              <button className="w-full py-2.5 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-50 transition-colors text-sm">
                Contact Project Lead
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
