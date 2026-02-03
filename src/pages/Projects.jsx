import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { projectsAPI, supportRequestsAPI } from '../utils/api';
import {
  Plus, CheckCircle, ChevronRight, FileText,
  Briefcase, TrendingUp, Users, Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import SkeletonLoader from '../components/SkeletonLoader';
import Modal from '../components/Modal';
import SupportRequestForm from '../components/forms/SupportRequestForm';

// Helper for deterministic project images
const getProjectImage = (p) => {
  if (!p.imageUrl) {
    // Default fallbacks based on title
    if (!p.title) return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800';
    const t = p.title.toLowerCase();
    if (t.includes('infra') || t.includes('network')) return 'https://images.unsplash.com/photo-1558494949-ef2a278812bc?auto=format&fit=crop&q=80&w=800';
    if (t.includes('ai') || t.includes('data')) return 'https://images.unsplash.com/photo-1518932945647-7a1c969f8be2?auto=format&fit=crop&q=80&w=800';
    if (t.includes('gov') || t.includes('policy')) return 'https://images.unsplash.com/photo-1541872703-74c59669c478?auto=format&fit=crop&q=80&w=800';
    if (t.includes('health')) return 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800';
    if (t.includes('edu') || t.includes('school')) return 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800';
    return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800';
  }

  // If path starts with /uploads, prepend API URL
  if (p.imageUrl.startsWith('/uploads')) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    // Remove /api from base URL if present, as uploads are usually at root
    const baseUrl = apiBase.replace('/api', '');
    return `${baseUrl}${p.imageUrl}`;
  }

  return p.imageUrl;
};

const Projects = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  // Modal State
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
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
          ...p,
          imageUrl: getProjectImage(p),
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

  const handleRequestSupport = (project) => {
    if (!currentUser) {
      if (confirm("Please login to submit a support request.")) {
        navigate('/login');
      }
      return;
    }
    setSelectedProjectId(project?.id || null);
    setShowSupportForm(true);
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

            {currentUser && (currentUser.isAdmin || (currentUser.assignedProjectIds && currentUser.assignedProjectIds.length > 0)) && (
              <button
                onClick={() => handleRequestSupport(null)}
                className="bg-white text-[#003359] hover:bg-blue-50 font-bold py-3.5 px-8 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300 transform hover:scale-105 flex items-center gap-3 animate-in slide-in-from-right-8"
              >
                <Plus size={22} className="stroke-[3px]" />
                <span className="text-base tracking-wide uppercase">Request Support</span>
              </button>
            )}
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
                    {currentUser && (currentUser.isAdmin || currentUser.assignedProjectIds?.includes(project.id)) && (
                      <button
                        onClick={() => handleRequestSupport(project)}
                        className="bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 text-xs font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-1.5"
                      >
                        <Plus size={14} /> Request Support
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SupportRequestForm
        isOpen={showSupportForm}
        onClose={() => setShowSupportForm(false)}
        projects={projects}
        currentUser={currentUser}
        initialProjectId={selectedProjectId}
        onSuccess={fetchProjects}
      />
    </div>
  );
};

export default Projects;
