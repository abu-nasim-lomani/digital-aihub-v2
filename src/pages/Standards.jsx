import { useEffect, useState } from 'react';
import { supabase } from '../supabase/config';
import { fetchCollection } from '../utils/supabaseHelpers';
import { useAuth } from '../contexts/AuthContext';
import { useRequireAuth } from '../utils/requireAuth';
import {
  BookOpen, Plus, X, CheckCircle, Upload, FileText, File,
  Eye, Search, Filter, Shield, Database, Cpu, Globe, ArrowRight,
  Download, ChevronRight
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Standards = () => {
  const { currentUser } = useAuth();
  const { requireAuth } = useRequireAuth();
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Admin Form State
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fileUrl: '',
    category: 'DPI',
  });

  // Categories Configuration
  const categories = [
    { id: 'All', label: 'All Resources', icon: Globe },
    { id: 'DPI', label: 'DPI Standards', icon: BookOpen },
    { id: 'AI Policy', label: 'AI Policy', icon: Cpu },
    { id: 'Data', label: 'Data Governance', icon: Database },
    { id: 'Security', label: 'Cyber Security', icon: Shield },
  ];

  useEffect(() => {
    const fetchStandards = async () => {
      try {
        const data = await fetchCollection('standards', { status: 'published' });

        // Demo Data if empty
        const initialData = data.length > 0 ? data : [
          {
            id: '1',
            title: 'National Digital Architecture Framework',
            description: 'Comprehensive guidelines for designing scalable and interoperable digital government platforms.',
            category: 'DPI',
            fileUrl: '#',
            type: 'pdf',
            size: '2.4 MB',
            date: '2025-10-15'
          },
          {
            id: '2',
            title: 'AI Ethics Guidelines v2.0',
            description: 'Principles and operational standards for responsible AI deployment in public services.',
            category: 'AI Policy',
            fileUrl: '#',
            type: 'pdf',
            size: '1.8 MB',
            date: '2025-09-22'
          },
          {
            id: '3',
            title: 'Data Privacy & Protection Act',
            description: 'Legal framework and compliance checklist for handling citizen data securely.',
            category: 'Data',
            fileUrl: '#',
            type: 'doc',
            size: '850 KB',
            date: '2025-08-10'
          },
          {
            id: '4',
            title: 'Cybersecurity Incident Response Plan',
            description: 'Standard operating procedures for managing and mitigating cyber threats.',
            category: 'Security',
            fileUrl: '#',
            type: 'pdf',
            size: '3.1 MB',
            date: '2025-11-05'
          },
          {
            id: '5',
            title: 'Interoperability Standards for e-Services',
            description: 'Technical specifications for API integration across government ministries.',
            category: 'DPI',
            fileUrl: '#',
            type: 'pdf',
            size: '1.2 MB',
            date: '2025-07-30'
          }
        ];

        // Normalize data
        setStandards(initialData.map(item => ({
          ...item,
          type: item.fileUrl?.endsWith('.doc') || item.fileUrl?.endsWith('.docx') ? 'doc' : 'pdf'
        })));

      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStandards();
  }, []);

  // Filter Logic
  const filteredStandards = standards.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handlers
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const filePath = `standards/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      await supabase.storage.from('files').upload(filePath, file);
      const { data } = supabase.storage.from('files').getPublicUrl(filePath);
      setFormData({ ...formData, fileUrl: data.publicUrl });
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await supabase.from('standards').insert({
        ...formData,
        status: 'published', // Auto-publish for demo
        created_at: new Date().toISOString(),
        created_by: currentUser?.email
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowForm(false);
        // Ideally refresh list here
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">

      {/* Header */}
      <div className="bg-[#003359] text-white pt-24 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="section-container relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold tracking-widest uppercase mb-4">
              Digital Policy Hub
            </span>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Standards & Guidelines</h1>
            <p className="text-blue-100/90 text-lg leading-relaxed">
              The central repository for national digital standards, policy frameworks, and technical guidelines.
            </p>
          </div>
        </div>
      </div>

      <div className="section-container -mt-20 pb-20 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Navigation */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
            {/* Search (Mobile/Desktop) */}
            <div className="bg-white p-2 rounded-xl shadow-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden p-2">
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeCategory === cat.id
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    <cat.icon size={18} className={activeCategory === cat.id ? 'text-blue-600' : 'text-gray-400'} />
                    {cat.label}
                    {activeCategory === cat.id && <ChevronRight size={16} className="ml-auto opacity-50" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Admin Action */}
            {currentUser?.isAdmin && (
              <button
                onClick={() => setShowForm(true)}
                className="w-full btn-primary py-3 rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                <span>Submit Standard</span>
              </button>
            )}
          </div>

          {/* Main Content Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LoadingSpinner />
              </div>
            ) : filteredStandards.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900">No documents found</h3>
                <p className="text-gray-500">Try selecting a different category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {filteredStandards.map((doc) => (
                  <div key={doc.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 group flex flex-col relative overflow-hidden">
                    {/* Decorative Top Border */}
                    <div className={`absolute top-0 left-0 w-full h-1 ${doc.type === 'pdf' ? 'bg-red-500' : 'bg-blue-500'}`}></div>

                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl ${doc.type === 'pdf' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                        <FileText size={24} />
                      </div>
                      <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        {doc.category}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug group-hover:text-blue-700 transition-colors">
                      {doc.title}
                    </h3>
                    <p className="text-gray-500 text-xs mb-6 line-clamp-2 leading-relaxed">
                      {doc.description}
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                        <span>{doc.size || 'PDF'}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span>{doc.date || '2025'}</span>
                      </div>
                      <div className="flex gap-2">
                        {doc.fileUrl && (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"
                            title="View Document"
                          >
                            <Eye size={18} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submission Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-900">Upload New Standard</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={20} /></button>
            </div>

            <div className="p-6">
              {submitSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Upload Successful!</h4>
                  <p className="text-gray-500">Your document has been added to the library.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                    <input
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. National Cyber Security Policy"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                    <select
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                    >
                      {categories.slice(1).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                    <textarea
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm h-24 resize-none"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief abstract..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Document File</label>
                    <label className={`flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all ${uploading ? 'opacity-50' : ''}`}>
                      <Upload size={18} className="text-gray-400" />
                      <span className="text-sm text-gray-500">{formData.fileUrl ? 'File Selected' : 'Choose PDF/DOC'}</span>
                      <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx" disabled={uploading} />
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !formData.fileUrl}
                    className="w-full btn-primary py-3 rounded-xl shadow-lg mt-4 flex items-center justify-center gap-2"
                  >
                    {submitting ? <LoadingSpinner size="sm" color="white" /> : <span>Publish Document</span>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Standards;
