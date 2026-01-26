import { useEffect, useState } from 'react';
import { standardsAPI } from '../utils/api';
import { FileText, Download, ExternalLink, Shield, CheckCircle, BookOpen, Award } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Standards = () => {
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchStandards();
  }, []);

  const fetchStandards = async () => {
    try {
      const response = await standardsAPI.getAll();
      setStandards(response.data);
    } catch (error) {
      console.error('Error fetching standards:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'DPI', 'LGI'];

  const filteredStandards = standards.filter(standard => {
    if (selectedCategory === 'All') return true;
    return standard.category === selectedCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#003359] text-white pt-20 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#002845_25%,transparent_25%,transparent_75%,#002845_75%,#002845),linear-gradient(45deg,#002845_25%,transparent_25%,transparent_75%,#002845_75%,#002845)] bg-[length:20px_20px] opacity-[0.05]"></div>

        <div className="section-container relative z-10">
          <div className="max-w-4xl">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold tracking-widest uppercase mb-4">
              Guidelines & Frameworks
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight">
              Standards & Best Practices
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed max-w-2xl">
              Access comprehensive guidelines, frameworks, and best practices for digital transformation
            </p>
          </div>
        </div>
      </div>

      <div className="section-container py-12">
        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-10 pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === category
                  ? 'bg-white text-undp-blue shadow-md border-b-2 border-undp-blue'
                  : 'text-gray-500 hover:bg-gray-100'
                }`}
            >
              {category === 'All' ? 'All Standards' : category}
            </button>
          ))}
        </div>

        {/* Standards Grid */}
        {filteredStandards.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No standards found</h3>
            <p className="text-gray-500">Check back soon for new guidelines</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStandards.map((standard) => (
              <div key={standard.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
                {/* Header with Icon */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                      <FileText className="text-blue-600" size={28} />
                    </div>
                    {standard.category && (
                      <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                        {standard.category}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors">
                    {standard.title}
                  </h3>
                </div>

                {/* Content */}
                <div className="p-6">
                  {standard.description && (
                    <p className="text-gray-600 text-sm mb-6 line-clamp-4 leading-relaxed">
                      {standard.description}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="space-y-2 mb-6">
                    {standard.version && (
                      <div className="flex items-center gap-2 text-sm">
                        <Shield size={16} className="text-gray-400" />
                        <span className="text-gray-600">Version: <strong className="text-gray-900">{standard.version}</strong></span>
                      </div>
                    )}
                    {standard.publishedDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="text-gray-600">Published: <strong className="text-gray-900">{new Date(standard.publishedDate).toLocaleDateString()}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Download Button */}
                  {standard.fileUrl ? (
                    <a
                      href={standard.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 group-hover:shadow-xl"
                    >
                      <Download size={18} />
                      Download PDF
                    </a>
                  ) : (
                    <button className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 text-gray-400 rounded-xl font-bold cursor-not-allowed">
                      <Download size={18} />
                      Not Available
                    </button>
                  )}

                  {/* Additional Link */}
                  {standard.externalUrl && (
                    <a
                      href={standard.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2 mt-2 text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors"
                    >
                      View Online <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="text-blue-600" size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Comprehensive Guidelines</h3>
            <p className="text-sm text-gray-600">Detailed documentation covering all aspects of digital transformation</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center">
            <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-green-600" size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Industry Standards</h3>
            <p className="text-sm text-gray-600">Aligned with international best practices and frameworks</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center">
            <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="text-purple-600" size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Regular Updates</h3>
            <p className="text-sm text-gray-600">Continuously updated to reflect latest developments</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-br from-[#003359] to-[#004d7a] rounded-3xl p-12 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2Mi1oMnYtMmgtMnptMC00djJoMnYtMmgtMnptMC00djJoMnYtMmgtMnptMC00djJoMnYtMmgtMnptMC00djJoMnYtMmgtMnptMC00djJoMnYtMmgtMnptMC00djJoMnYtMmgtMnptMC00djJoMnYtMmgtMnptMC00djJoMnYtMmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

          <div className="relative z-10">
            <FileText size={48} className="mx-auto mb-4 text-blue-200" />
            <h2 className="text-3xl font-bold mb-4">Need Custom Guidelines?</h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Contact us for tailored standards and best practices specific to your organization
            </p>
            <button className="bg-white text-[#003359] px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105">
              Request Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Standards;
