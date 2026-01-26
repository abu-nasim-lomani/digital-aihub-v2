import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI, supportRequestsAPI } from '../utils/api';
import {
  Plus, X, CheckCircle, Upload, ChevronRight, ExternalLink,
  ArrowRight, Search, Filter, LayoutGrid, List, Briefcase,
  TrendingUp, Users, DollarSign, Clock, FileText, Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import SkeletonLoader from '../components/SkeletonLoader';
import Modal from '../components/Modal';

// Helper for deterministic project images
const getProjectImage = (title) => {
  if (!title) return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800';
  const t = title.toLowerCase();
  if (t.includes('infra') || t.includes('network')) return 'https://images.unsplash.com/photo-1558494949-ef2a278812bc?auto=format&fit=crop&q=80&w=800';
  if (t.includes('ai') || t.includes('data')) return 'https://images.unsplash.com/photo-1518932945647-7a1c969f8be2?auto=format&fit=crop&q=80&w=800';
  if (t.includes('gov') || t.includes('policy')) return 'https://images.unsplash.com/photo-1541872703-74c59669c478?auto=format&fit=crop&q=80&w=800';
  if (t.includes('health')) return 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800';
  if (t.includes('edu') || t.includes('school')) return 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800';
  return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800';
};

const Projects = () => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [supportData, setSupportData] = useState({
    title: '',
    projectId: '',
    supportType: '',
    documentUrl: '',
    duration: '',
    impact: '',
    guestName: '',
    guestEmail: ''
  });

  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [supportStats, setSupportStats] = useState({ total: 0, completed: 0 });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      const supportResponse = await supportRequestsAPI.getAll();

      const supportData = supportResponse.data || [];

      const processed = response.data.map(p => {
        const pRequests = supportData.filter(r => r.projectId === p.id);
        const ongoing = pRequests.filter(r => r.status !== 'resolved').length;
        const completed = pRequests.filter(r => r.status === 'resolved').length;

        return {
          ...p,
          imageUrl: p.imageUrl || getProjectImage(p.title),
          ongoingSupport: ongoing,
          completedSupport: completed
        };
      });

      setProjects(processed);

      const total = supportData.length;
      const completed = supportData.filter(s => s.status === 'resolved').length;
      setSupportStats({ total, completed });
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Ongoing Project', value: projects.filter(p => p.status === 'published').length, icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Total Project', value: projects.length, icon: Users, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Total Support Request', value: supportStats.total, icon: FileText, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Partners', value: '18', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Total Complete Support Request', value: supportStats.completed, icon: CheckCircle, color: 'text-teal-500', bg: 'bg-teal-50' },
  ];

  const filteredProjects = projects.filter(p => {
    if (filterStatus === 'All') return true;
    if (filterStatus === 'Active') return p.status === 'published';
    if (filterStatus === 'Completed') return p.status === 'completed';
    if (filterStatus === 'Pipeline') return p.status === 'pending';
    return true;
  });

  const handleRequestSupport = (project) => {
    // Public access allowed
    setSupportData(prev => ({ ...prev, projectId: project.id }));
    setShowSupportForm(true);
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const submissionData = {
        ...supportData,
        projectId: supportData.projectId || null,
        status: 'pending'
      };

      if (currentUser) {
        submissionData.createdBy = currentUser.email; // Backend expects userId from token, but here we might just need to rely on the token. 
        // Actually the backend middleware adds the user info from token to req.user. 
        // The API call uses withCredentials/headers so token is sent. 
        // We don't strictly need to send createdBy in body if backend extracts it.
        // But let's check backend logic again. 
        // Backend: `data.createdBy = req.user.userId;` if req.user exists.
      } else {
        // Guest validation
        if (!supportData.guestName || !supportData.guestEmail) {
          setModalConfig({ isOpen: true, title: 'Validation Error', message: 'Name and Email are required for guests.', type: 'error' });
          setSubmitting(false);
          return;
        }
      }

      await supportRequestsAPI.create(submissionData);

      setSubmitSuccess(true);
      setSubmitSuccess(true);
      setSupportData({ title: '', projectId: '', supportType: '', documentUrl: '', duration: '', impact: '', guestName: '', guestEmail: '' });
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowSupportForm(false);
      }, 3000);

      fetchProjects(); // Refresh to show updated counts
    } catch (err) {
      setModalConfig({ isOpen: true, title: 'Error', message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Modal {...modalConfig} onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} />

      {/* Premium Header */}
      <div className="bg-[#003359] text-white pt-20 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#002845_25%,transparent_25%,transparent_75%,#002845_75%,#002845),linear-gradient(45deg,#002845_25%,transparent_25%,transparent_75%,#002845_75%,#002845)] bg-[length:20px_20px] opacity-[0.05]"></div>
        <div className="section-container relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold tracking-widest uppercase mb-4">
                Portfolio & Support
              </span>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Projects & Supports</h1>
              <p className="text-blue-100 text-lg max-w-xl leading-relaxed">
                Explore our portfolio of digital transformation projects and support initiatives
              </p>
            </div>

            <button
              onClick={() => setShowSupportForm(true)}
              className="bg-white text-[#003359] hover:bg-blue-50 font-bold py-3.5 px-8 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300 transform hover:scale-105 flex items-center gap-3 animate-in slide-in-from-right-8"
            >
              <Plus size={22} className="stroke-[3px]" />
              <span className="text-base tracking-wide uppercase">Request Support</span>
            </button>
          </div>
        </div>
      </div>

      <div className="section-container -mt-16 pb-20 relative z-20">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-3.5 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-between group hover:-translate-y-1 transition-transform">
              <div>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">{stat.label}</p>
                <h3 className="text-xl font-bold text-gray-900">{stat.value}</h3>
              </div>
              <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} />
              </div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-8 pb-2">
          {['All', 'Active', 'Completed', 'Pipeline'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${filterStatus === status
                ? 'bg-white text-undp-blue shadow-md border-b-2 border-undp-blue'
                : 'text-gray-500 hover:bg-gray-100'
                }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonLoader type="card" count={3} />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No projects found</h3>
            <p className="text-gray-500">We are currently updating our portfolio.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur rounded-lg text-[10px] font-bold uppercase tracking-wider text-gray-700 shadow-sm">
                    {project.status || 'Ongoing'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-blue-600 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-1">
                    {project.description || project.impact}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 mb-4">
                    <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded text-blue-600 bg-blue-50">
                      <Clock size={14} /> Ongoing: {project.ongoingSupport || 0}
                    </span>
                    <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded text-green-600 bg-green-50">
                      <CheckCircle size={14} /> Complete: {project.completedSupport || 0}
                    </span>
                  </div>

                  {/* Action */}
                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Link to={`/projects/${project.id}`} className="text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1">
                        Details <ChevronRight size={14} />
                      </Link>
                      {project.documentUrl && (
                        <a href={project.documentUrl} target="_blank" className="text-gray-400 hover:text-blue-600 transition-colors" title="View Document">
                          <FileText size={16} />
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => handleRequestSupport(project)}
                      className="bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 text-xs font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-1.5"
                    >
                      <Plus size={14} /> Request Support
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Support Request Modal - Premium Style */}
      {showSupportForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#003359]/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300 relative border border-gray-100 flex flex-col">

            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur z-10 px-8 py-6 border-b border-gray-100 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Briefcase size={24} className="text-[#003359]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Request Support</h2>
                  <p className="text-sm text-gray-500">Submit your support requirement details</p>
                </div>
              </div>
              <button
                onClick={() => setShowSupportForm(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all duration-300"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 flex-1 overflow-y-auto">
              {submitSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 text-green-700 animate-in fade-in slide-in-from-top-4">
                  <div className="bg-green-100 p-2 rounded-full"><CheckCircle size={20} /></div>
                  <div>
                    <h4 className="font-bold">Success!</h4>
                    <p className="text-sm">Your request has been submitted successfully.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSupportSubmit} className="space-y-6">

                {/* Title Input */}
                <div className="space-y-2 group">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider group-focus-within:text-[#003359] transition-colors">Request Title *</label>
                  <div className="relative">
                    <input
                      required
                      value={supportData.title}
                      onChange={e => setSupportData({ ...supportData, title: e.target.value })}
                      className="w-full pl-4 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#003359]/20 focus:border-[#003359] transition-all text-sm font-medium outline-none"
                      placeholder="E.g. Technical assistance for migrating legacy systems"
                    />
                  </div>
                </div>

                {!currentUser && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 group">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider group-focus-within:text-[#003359] transition-colors">Your Name *</label>
                      <input
                        required
                        value={supportData.guestName}
                        onChange={e => setSupportData({ ...supportData, guestName: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#003359]/20 focus:border-[#003359] transition-all text-sm font-medium outline-none"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="space-y-2 group">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider group-focus-within:text-[#003359] transition-colors">Email Address *</label>
                      <input
                        required
                        type="email"
                        value={supportData.guestEmail}
                        onChange={e => setSupportData({ ...supportData, guestEmail: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#003359]/20 focus:border-[#003359] transition-all text-sm font-medium outline-none"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Project Select */}
                  <div className="space-y-2 group">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider group-focus-within:text-[#003359] transition-colors">Related Project</label>
                    <div className="relative">
                      <select
                        value={supportData.projectId}
                        onChange={(e) => setSupportData({ ...supportData, projectId: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#003359]/20 focus:border-[#003359] transition-all text-sm font-medium outline-none appearance-none cursor-pointer"
                      >
                        <option value="">Select Project (Optional)</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" size={16} />
                    </div>
                  </div>

                  {/* Support Type Select */}
                  <div className="space-y-2 group">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider group-focus-within:text-[#003359] transition-colors">Support Type *</label>
                    <div className="relative">
                      <select
                        required
                        value={supportData.supportType}
                        onChange={e => setSupportData({ ...supportData, supportType: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#003359]/20 focus:border-[#003359] transition-all text-sm font-medium outline-none appearance-none cursor-pointer"
                      >
                        <option value="">Select Type...</option>
                        <option value="Consultancy">Consultancy</option>
                        <option value="Technical">Technical Support</option>
                        <option value="Training">Training & Capacity</option>
                        <option value="Funding">Funding Support</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" size={16} />
                    </div>
                  </div>

                  {/* Duration Input */}
                  <div className="space-y-2 group md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider group-focus-within:text-[#003359] transition-colors">Expected Timeline</label>
                    <input
                      value={supportData.duration}
                      onChange={e => setSupportData({ ...supportData, duration: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#003359]/20 focus:border-[#003359] transition-all text-sm font-medium outline-none"
                      placeholder="E.g. 3 Months, Q1 2024"
                    />
                  </div>
                </div>

                {/* Description Textarea */}
                <div className="space-y-2 group">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider group-focus-within:text-[#003359] transition-colors">Needs & Impact *</label>
                  <textarea
                    required
                    rows="4"
                    value={supportData.impact}
                    onChange={e => setSupportData({ ...supportData, impact: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#003359]/20 focus:border-[#003359] transition-all text-sm font-medium outline-none resize-none leading-relaxed"
                    placeholder="Describe your requirements, expected outcomes, and potential impact..."
                  />
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-50">
                  <button
                    type="button"
                    onClick={() => setShowSupportForm(false)}
                    className="px-6 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#003359] hover:bg-[#002845] text-white px-8 py-3 rounded-xl shadow-lg shadow-blue-900/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
                    <span className="font-bold">{submitting ? 'Submitting...' : 'Submit Request'}</span>
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

export default Projects;
