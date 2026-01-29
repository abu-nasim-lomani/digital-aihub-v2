import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supportRequestsAPI, projectsAPI } from '../../utils/api';
import { FileText, Clock, CheckCircle, XCircle, HelpCircle, Plus, LayoutDashboard, User, Activity, ArrowRight, Settings, Calendar, Briefcase, ChevronRight, X, BarChart2 } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Link } from 'react-router-dom';
import SupportRequestForm from '../../components/forms/SupportRequestForm';

const UserDashboard = () => {
  const { currentUser } = useAuth();
  const [supportRequests, setSupportRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    declined: 0,
  });

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestsRes, projectsRes] = await Promise.all([
        supportRequestsAPI.getAll(),
        projectsAPI.getAll()
      ]);

      const requestsData = requestsRes.data || [];
      const projectsData = projectsRes.data || [];

      setSupportRequests(requestsData);
      setProjects(projectsData);

      setStats({
        total: requestsData.length,
        pending: requestsData.filter(s => s.status === 'pending').length,
        approved: requestsData.filter(s => s.status === 'approved').length,
        declined: requestsData.filter(s => s.status === 'declined').length,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    approved: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Approved' },
    pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'In Review' },
    declined: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Declined' },
    unknown: { icon: HelpCircle, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Unknown' }
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.unknown;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const getProjectTitle = (id) => {
    const project = projects.find(p => p.id === id);
    return project ? project.title : 'General Support';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
      <LoadingSpinner size="lg" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-[#003359] to-[#004d7a] rounded-3xl p-8 text-white shadow-xl mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {currentUser?.email?.split('@')[0]}! 👋</h1>
              <p className="text-blue-100">Here's what's happening with your projects and requests today.</p>
            </div>
            <button
              onClick={() => setShowSupportForm(true)}
              className="bg-white text-[#003359] px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg flex items-center gap-2"
            >
              <Plus size={20} /> New Request
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Requests', value: stats.total, icon: FileText, color: 'blue' },
            { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'yellow' },
            { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'green' },
            { label: 'Attention Needed', value: stats.declined, icon: XCircle, color: 'red' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}>
                <stat.icon size={24} />
              </div>
              <div>
                <span className={`text-2xl font-bold text-gray-900 block leading-none mb-1`}>{stat.value}</span>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wide">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Requests List */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="text-blue-600" size={20} /> Recent Requests
                </h2>
                <button className="text-sm text-blue-600 font-semibold hover:text-blue-700">View All</button>
              </div>

              {supportRequests.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LayoutDashboard className="text-gray-400" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">No requests yet</h3>
                  <p className="text-gray-500 mb-6">Start your journey by submitting a new support request.</p>
                  <button onClick={() => setShowSupportForm(true)} className="text-blue-600 font-bold hover:underline">Create Request</button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {supportRequests.map((request) => (
                    <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                            {request.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><Briefcase size={14} /> {request.supportType}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Clock size={14} /> {request.duration}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(request.status)}
                          {request.status === 'approved' && (
                            <div className="mt-1 text-xs font-bold text-blue-600">
                              {request.progress ? request.progress + '%' : '0%'} Complete
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded">Submitted {new Date(request.createdAt).toLocaleDateString()}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="text-xs bg-white border border-gray-200 px-3 py-1 rounded-lg font-bold text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Profile & Quick Actions */}
          <div className="space-y-8">

            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {currentUser?.email?.[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{currentUser?.email?.split('@')[0]}</h3>
                  <p className="text-sm text-gray-500">{currentUser?.isAdmin ? 'Administrator' : 'Standard User'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600 flex items-center gap-2"><User size={16} /> User ID</span>
                  <span className="text-xs font-mono text-gray-500 bg-white px-2 py-1 rounded border">#{currentUser?.id?.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600 flex items-center gap-2"><Settings size={16} /> Settings</span>
                  <button className="text-xs text-blue-600 font-bold hover:underline">Manage</button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#003359] rounded-2xl shadow-lg p-6 text-white">
              <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button onClick={() => setShowSupportForm(true)} className="block w-full text-left p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-between group">
                  <span className="font-medium">Submit Proposal</span>
                  <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                </button>
                <Link to="/learning" className="block w-full text-left p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-between group">
                  <span className="font-medium">Browse Learning</span>
                  <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/team" className="block w-full text-left p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-between group">
                  <span className="font-medium">Contact Support</span>
                  <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>

      <SupportRequestForm
        isOpen={showSupportForm}
        onClose={() => setShowSupportForm(false)}
        projects={projects}
        currentUser={currentUser}
        onSuccess={fetchData}
      />

      {/* Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 flex flex-col">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-gray-50/95 backdrop-blur z-10">
              <h3 className="font-bold text-gray-900 text-lg">Request Details</h3>
              <button onClick={() => setSelectedRequest(null)} className="p-1 hover:bg-gray-200 rounded-full transition-colors"><X size={20} className="text-gray-500" /></button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Title</span>
                <h2 className="text-xl font-bold text-gray-900 mt-1">{selectedRequest.title}</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-xl">
                  <span className="text-xs font-bold text-blue-500 uppercase tracking-wide">Type</span>
                  <p className="font-semibold text-blue-900 flex items-center gap-2 mt-1"><Briefcase size={16} /> {selectedRequest.supportType}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-xl">
                  <span className="text-xs font-bold text-green-500 uppercase tracking-wide">Status</span>
                  <p className="font-semibold text-green-900 flex items-center gap-2 mt-1">
                    {getStatusBadge(selectedRequest.status)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              {selectedRequest.status === 'approved' && (
                <div className="bg-white border boundary-gray-200 p-4 rounded-xl shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                      <BarChart2 size={14} /> Progress
                    </span>
                    <span className="text-sm font-bold text-blue-600">{selectedRequest.progress || 0}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${selectedRequest.progress || 0}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Work History */}
              {selectedRequest.workUpdates && selectedRequest.workUpdates.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 block">Work Updates</span>
                  <div className="space-y-4">
                    {/* Reverse to show latest first if not already sorted, but assuming array push order meaning oldest first. Render in reverse for UI. */}
                    {[...selectedRequest.workUpdates].reverse().map((update, idx) => (
                      <div key={idx} className="relative pl-6 border-l-2 border-gray-100 pb-2 last:pb-0">
                        <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-blue-400 ring-4 ring-white"></div>
                        <p className="text-xs font-bold text-gray-400 mb-1">
                          {new Date(update.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {update.update}
                        </p>
                        {update.progress && (
                          <span className="text-[10px] font-bold text-blue-500 mt-1 block">Progress updated to {update.progress}%</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Related Project</span>
                <p className="text-gray-900 font-medium mt-1 p-2 bg-gray-50 rounded-lg border border-gray-100">
                  {getProjectTitle(selectedRequest.projectId)}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Description & Impact</span>
                <p className="text-gray-600 mt-1 text-sm leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {selectedRequest.impact || "No description provided."}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-400 font-medium pt-4 border-t border-gray-100">
                <span className="flex items-center gap-1"><Calendar size={14} /> Created: {new Date(selectedRequest.createdAt).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><Clock size={14} /> Duration: {selectedRequest.duration}</span>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserDashboard;
