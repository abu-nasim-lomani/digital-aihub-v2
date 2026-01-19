import { useEffect, useState } from 'react';
import { supabase } from '../supabase/config';
import { fetchCollection } from '../utils/supabaseHelpers';
import { clearCache, getCachedData } from '../utils/cache';
import { useAuth } from '../contexts/AuthContext';
import { useRequireAuth } from '../utils/requireAuth';
import { ArrowRight, ExternalLink, Upload, Image as ImageIcon, Plus, X, CheckCircle, FileText, Calendar, Filter, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import SkeletonLoader from '../components/SkeletonLoader';

const Initiatives = () => {
  const { currentUser } = useAuth();
  const { requireAuth } = useRequireAuth();
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    documentUrl: '',
    documentName: '',
    type: '',
    result: '',
    impact: '',
  });

  // Category Tabs State
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    // Check cache synchronously first for instant display
    const cacheKey = `initiatives_${JSON.stringify({ status: 'published' })}_all`;
    const cached = getCachedData(cacheKey, true);

    if (cached) {
      const mappedCached = cached.map(init => ({
        ...init,
        imageUrl: init.image_url || init.imageUrl,
        documentUrl: init.document_url || init.documentUrl,
        documentName: init.document_name || init.documentName,
      }));
      setInitiatives(mappedCached);
      setLoading(false);
    }

    // Fetch fresh data
    const fetchInitiatives = async () => {
      try {
        const data = await fetchCollection('initiatives', { status: 'published' });
        const mappedData = data.map(init => ({
          ...init,
          imageUrl: init.image_url || init.imageUrl,
          documentUrl: init.document_url || init.documentUrl,
          documentName: init.document_name || init.documentName,
        }));
        setInitiatives(mappedData);
      } catch (error) {
        console.error('Error fetching initiatives:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitiatives();
  }, []);

  // Fixed categories as requested + dynamic ones
  const fixedCategories = ['All', 'AI', 'Tech', 'Governance'];
  const dynamicCategories = [...new Set(initiatives.map(i => i.type).filter(Boolean))];
  // Merge and ensure uniqueness, keeping fixed ones first
  const categories = [...new Set([...fixedCategories, ...dynamicCategories])];

  const handleFileUpload = async (file) => {
    if (!file) return null;
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size exceeds 10MB limit.');
      return null;
    }

    setUploading(true);
    try {
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';
      const folder = isImage ? 'initiatives/images' : 'initiatives/documents';
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `${folder}/${fileName}`;

      const { data, error } = await supabase.storage.from('files').upload(filePath, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;

      const { data: urlData } = supabase.storage.from('files').getPublicUrl(filePath);
      return { url: urlData.publicUrl, type: isImage ? 'image' : isPDF ? 'pdf' : 'document', fileName: file.name };
    } catch (error) {
      console.error('Upload Error:', error);
      alert('Upload failed. Check console for details.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!requireAuth('upload files')) { e.target.value = ''; return; }

    e.target.value = '';
    const result = await handleFileUpload(file);
    if (result) {
      if (result.type === 'image') setFormData({ ...formData, imageUrl: result.url });
      else setFormData({ ...formData, documentUrl: result.url, documentName: result.fileName });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requireAuth('submit an initiative')) return;

    setSubmitting(true);
    try {
      const insertData = {
        title: formData.title,
        description: formData.description,
        image_url: formData.imageUrl || null,
        document_url: formData.documentUrl || null,
        document_name: formData.documentName || null,
        type: formData.type || null,
        result: formData.result || null,
        impact: formData.impact || null,
        status: 'pending',
        created_at: new Date().toISOString(),
        created_by: currentUser?.email || 'anonymous',
      };

      const { error } = await supabase.from('initiatives').insert(insertData);
      if (error) throw error;

      clearCache('initiatives');
      setSubmitSuccess(true);
      setFormData({ title: '', description: '', imageUrl: '', documentUrl: '', documentName: '', type: '', result: '', impact: '' });
      setTimeout(() => { setSubmitSuccess(false); setShowForm(false); }, 3000);
    } catch (error) {
      console.error('Submission Error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter and Sort initiatives
  const sortedInitiatives = [...initiatives]
    .filter(item => selectedCategory === 'All' || item.type === selectedCategory)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div className="min-h-screen bg-gray-50/30">

      {/* Compact Premium Header - UNDP Blue */}
      <div className="bg-undp-blue text-white py-12 shadow-lg">
        <div className="section-container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
            Our Initiatives
          </h2>
          <div className="h-1.5 w-20 bg-white/30 mx-auto rounded-full mb-4"></div>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
            Driving digital transformation through sustainable, high-impact projects.
          </p>
        </div>
      </div>

      <div className="section-container py-8">

        {/* Centered Category Tabs with Smooth Animation */}
        <div className="relative mb-10">
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 no-scrollbar mask-fade-right mx-auto max-w-4xl px-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`relative px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${selectedCategory === category
                  ? 'bg-undp-blue text-white shadow-lg shadow-blue-500/30 scale-105 z-10'
                  : 'bg-white text-gray-500 border border-gray-100 hover:border-undp-blue/30 hover:text-undp-blue hover:bg-white hover:shadow-md'
                  }`}
              >
                {category}
                {/* Animated Active Indicator */}
                {selectedCategory === category && (
                  <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-undp-blue rounded-full opacity-0 animate-pulse"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Admin Action Button (Floating for Admin only) */}
        {currentUser?.isAdmin && (
          <div className="flex justify-center md:justify-end mb-8">
            <button
              onClick={() => requireAuth('submit a new initiative') && setShowForm(true)}
              className="btn-primary inline-flex items-center space-x-2 py-2 px-5 text-sm shadow-md transition-transform hover:-translate-y-0.5"
            >
              <Plus size={18} />
              <span>New Initiative</span>
            </button>
          </div>
        )}

        {/* PREMIUM Submit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300 relative border border-gray-100">

              {/* Header */}
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-8 py-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">New Initiative</h2>
                  <p className="text-sm text-gray-500 mt-1">Submit a new project for review</p>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 rounded-full bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors duration-200"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-8">
                {submitSuccess && (
                  <div className="mb-8 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-4 text-green-700 animate-in slide-in-from-top-2">
                    <div className="bg-green-100 p-2 rounded-full shadow-sm text-green-600"><CheckCircle size={20} /></div>
                    <div>
                      <h4 className="font-bold text-sm">Successfully Submitted!</h4>
                      <p className="text-xs opacity-90">Your initiative is now pending approval.</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Title & Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Title *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
                        placeholder="Enter project title"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Type / Category *</label>
                      <input
                        type="text"
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
                        placeholder="e.g. AI, Governance"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      required
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm leading-relaxed"
                      placeholder="Describe the initiative, its goals, and methodology..."
                    />
                  </div>

                  {/* Uploads */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Image Upload */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cover Image</label>
                      <div className="relative group">
                        <label className={`flex flex-col items-center justify-center gap-3 h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                          <div className="p-2 bg-gray-100 rounded-full group-hover:bg-white group-hover:shadow-sm transition-all">
                            <ImageIcon size={20} className="text-gray-400 group-hover:text-blue-500" />
                          </div>
                          <span className="text-xs text-gray-500 font-medium">{formData.imageUrl ? 'Change Image' : 'Upload Image'}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
                        </label>
                        {formData.imageUrl && (
                          <div className="absolute inset-0 bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                            <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); setFormData({ ...formData, imageUrl: '' }); }}
                              className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Doc Upload */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Document (PDF)</label>
                      <label className={`flex flex-col items-center justify-center gap-3 h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="p-2 bg-gray-100 rounded-full group-hover:bg-white group-hover:shadow-sm transition-all">
                          <Upload size={20} className="text-gray-400 group-hover:text-blue-500" />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">Upload Report/PDF</span>
                        <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} disabled={uploading} />
                      </label>
                      {formData.documentUrl && (
                        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl mt-2 animate-in fade-in">
                          <div className="bg-white p-2 rounded-lg text-blue-500 shadow-sm"><FileText size={16} /></div>
                          <span className="text-xs font-medium text-blue-900 truncate flex-1">{formData.documentName || 'Document attached'}</span>
                          <button type="button" onClick={() => setFormData({ ...formData, documentUrl: '', documentName: '' })} className="text-blue-400 hover:text-red-500">
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Impact */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Key Impact & Results</label>
                    <div className="relative">
                      <textarea
                        value={formData.impact}
                        onChange={e => setFormData({ ...formData, impact: e.target.value })}
                        required
                        rows={2}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                        placeholder="e.g. Impacted 5,000+ farmers..."
                      />
                      <CheckCircle size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-end gap-4 pt-6 mt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || uploading}
                      className="btn-primary px-8 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 text-sm font-bold flex items-center gap-2 group"
                    >
                      {submitting || uploading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                      <span>{submitting ? 'Submitting...' : 'Create Initiative'}</span>
                    </button>
                  </div>

                </form>
              </div>
            </div>
          </div>
        )}

        {/* Unified Grid Layout - Professional News Style */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonLoader type="card" count={3} />
          </div>
        ) : sortedInitiatives.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {sortedInitiatives.map((initiative) => (
              <div
                key={initiative.id}
                className="group flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Card Image - 16:9 Aspect Ratio with Fallback */}
                <div className="relative aspect-video overflow-hidden bg-gray-100 border-b border-gray-100">
                  {initiative.imageUrl ? (
                    <img
                      src={initiative.imageUrl}
                      alt={initiative.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
                      <div className="p-4 bg-white rounded-full shadow-sm">
                        <ImageIcon className="text-gray-300 w-8 h-8" />
                      </div>
                    </div>
                  )}
                  {/* Overlay Gradient on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Floating Date Badge (Top Left) */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-bold text-gray-600 shadow-sm flex items-center gap-1">
                    <Calendar size={12} className="text-undp-blue" />
                    {new Date(initiative.created_at).getFullYear()}
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex flex-col flex-1 p-6">

                  {/* Meta Row: Type Badge */}
                  {initiative.type && (
                    <div className="mb-3">
                      <span className="inline-block px-2.5 py-1 bg-blue-50 text-undp-blue text-[10px] uppercase tracking-wider font-bold rounded-md">
                        {initiative.type}
                      </span>
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-undp-blue transition-colors leading-snug line-clamp-2">
                    {initiative.title}
                  </h3>

                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {initiative.description}
                  </p>

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
                    {initiative.impact && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-green-700 max-w-[65%]">
                        <CheckCircle size={14} className="shrink-0 text-green-600" />
                        <span className="truncate" title={initiative.impact}>{initiative.impact}</span>
                      </div>
                    )}

                    <Link
                      to={`/initiatives/${initiative.id}`}
                      className="group/link inline-flex items-center gap-1.5 text-sm font-bold text-undp-blue hover:text-undp-dark-blue transition-colors ml-auto"
                    >
                      <span>Read More</span>
                      <ArrowRight size={16} className="transform group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <Filter className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No initiatives found</h3>
            <p className="mt-1 text-sm text-gray-500">Try selecting a different category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Initiatives;
