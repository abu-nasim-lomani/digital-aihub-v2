import { useEffect, useState } from 'react';
import { learningAPI } from '../utils/api';
import { BookOpen, FileText, Download, Eye, Search, Filter, ArrowRight, File, Award, Calendar, Video, Users } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Learning = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await learningAPI.getAll();
      // Filter published only for public view (if API doesn't already)
      // Our previous seeding script set status to 'published'
      // API might return mapped array or object. Based on 'api.js' it likely returns axios response.
      // Usually api.js returns response.data or just data. Let's assume response.data based on typical axios.
      // Wait, api.js 'getAll' often returns the data directly if interceptors handle it, or response.
      // Let's assume response.data or response is the array.
      // Safest is to check both or assume standard pattern in this codebase.
      // Checking usage in ManageInitiatives: names = await initiativesAPI.getAll(). 
      // So it returns the array directly.

      const modules = Array.isArray(response) ? response : (response.data || []);
      const published = modules.filter(m => m.status === 'published');
      setData(published);
    } catch (error) {
      console.error('Error fetching learning modules:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  // Use real data
  const modules = data;

  const getFileIcon = (type) => {
    const t = type?.toLowerCase();
    if (t === 'pdf') return <FileText size={32} className="text-red-500" />;
    if (t === 'ppt' || t === 'pptx') return <File size={32} className="text-orange-500" />;
    return <File size={32} className="text-gray-400" />;
  };

  const getCardColor = (type) => {
    const t = type?.toLowerCase();
    if (t === 'pdf') return 'bg-red-50 border-red-100';
    if (t === 'ppt' || t === 'pptx') return 'bg-orange-50 border-orange-100';
    return 'bg-gray-50 border-gray-100';
  };

  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    // Remove /api if present in base URL to get root
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api').replace('/api', '');
    return `${baseUrl}${url}`;
  };

  const handleDownload = async (doc) => {
    try {
      const fileUrl = getFullUrl(doc.fileUrl);
      if (!fileUrl) return;

      // Optimistic update
      const updatedModules = modules.map(m =>
        m.id === doc.id ? { ...m, downloads: (m.downloads || 0) + 1 } : m
      );
      setData(updatedModules);

      // Call API
      await learningAPI.incrementDownload(doc.id);

      // Force download using blob
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Extract filename from path or title
      const filename = doc.fileUrl.split('/').pop() || `${doc.title}.${doc.type}`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: Open in new tab
      const fileUrl = getFullUrl(doc.fileUrl);
      if (fileUrl) window.open(fileUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hero Section (Original Design) */}
      <div className="bg-gradient-to-br from-[#003359] via-[#004d7a] to-[#003359] text-white pt-20 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>

        <div className="section-container relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Award size={16} className="text-yellow-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-100">Empowering Digital Leaders</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight">
              Learning & Capacity Building
            </h1>

            <p className="text-xl text-blue-100 leading-relaxed max-w-2xl">
              Comprehensive training programs and resources to enhance digital transformation capabilities
            </p>
          </div>
        </div>

        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Statistics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Number of Events', value: '4', icon: Calendar },
            { label: 'Online Events', value: '0', icon: Video },
            { label: 'Number of Trainees', value: '250+', icon: Users },
            { label: 'Number of Modules', value: '3', icon: BookOpen }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((doc) => (
            <div key={doc.id} className="group bg-white rounded-2xl border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">

              {/* Card Header (File Preview Look) */}
              <div className={`h-32 ${getCardColor(doc.type)} p-6 flex flex-col justify-between relative overflow-hidden group-hover:bg-opacity-80 transition-colors`}>
                <div className="absolute top-4 right-4 opacity-10 transform rotate-12 group-hover:scale-110 transition-transform">
                  {getFileIcon(doc.type)}
                </div>

                <div className="flex justify-between items-start z-10">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    {getFileIcon(doc.type)}
                  </div>
                  <span className="px-2 py-1 bg-white/60 backdrop-blur rounded text-xs font-bold text-gray-600 uppercase">
                    {doc.type ? doc.type.toUpperCase() : 'DOC'}
                  </span>
                </div>
                <div className="z-10 text-xs font-medium text-gray-500">
                  {doc.pages || '?'} Pages • {doc.fileSize || 'Unknown Size'}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-auto">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-blue-600 mb-2 block">{doc.category}</span>
                    <span className="text-xs text-gray-400">{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                    {doc.title}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                    {doc.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Download size={14} />
                    <span>{doc.downloads}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => doc.fileUrl && window.open(getFullUrl(doc.fileUrl), '_blank')}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Preview"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors"
                    >
                      <span>Download</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {modules.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <Search className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No documents found</h3>
            <p className="text-gray-500">Check back soon for new resources</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Learning;
