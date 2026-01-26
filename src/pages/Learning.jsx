import { useEffect, useState } from 'react';
import { learningAPI } from '../utils/api';
import { BookOpen, Video, FileText, Clock, Award, Star, Play, ExternalLink, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Learning = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await learningAPI.getAll();
      const published = response.data.filter(m => m.status === 'published');
      setModules(published);
    } catch (error) {
      console.error('Error fetching learning modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Digital Infrastructure', 'AI & Data', 'Policy & Governance', 'Capacity Building'];

  const filteredModules = modules.filter(module => {
    if (selectedCategory === 'All') return true;
    return module.category === selectedCategory;
  });

  // Helper to get thumbnail
  const getThumbnail = (module) => {
    if (module.thumbnailUrl) return module.thumbnailUrl;
    const title = module.moduleTitle?.toLowerCase() || '';
    if (title.includes('ai') || title.includes('data')) return 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800';
    if (title.includes('digital') || title.includes('infra')) return 'https://images.unsplash.com/photo-1558494949-ef2a278812bc?auto=format&fit=crop&q=80&w=800';
    if (title.includes('policy') || title.includes('gov')) return 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800';
    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800';
  };

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
      <div className="bg-gradient-to-br from-[#003359] via-[#004d7a] to-[#003359] text-white pt-20 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>

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

      <div className="section-container py-12">
        {/* Category Filter */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar mb-10 pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === category
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Udemy-Style Course Grid */}
        {filteredModules.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No modules found</h3>
            <p className="text-gray-500">Check back soon for new learning content</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredModules.map((module) => (
              <div key={module.id} className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 group cursor-pointer">
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={getThumbnail(module)}
                    alt={module.moduleTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Type Badge */}
                  <div className="absolute top-3 left-3">
                    {module.videoUrl ? (
                      <span className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                        <Video size={12} />
                        Video
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded">
                        <FileText size={12} />
                        Article
                      </span>
                    )}
                  </div>

                  {/* Play Overlay for Videos */}
                  {module.videoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                        <Play size={24} className="text-gray-900 ml-1" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Title */}
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {module.moduleTitle}
                  </h3>

                  {/* Description */}
                  {module.content && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {module.content}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    {module.duration && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {module.duration}
                      </span>
                    )}
                    {module.level && (
                      <span className="flex items-center gap-1">
                        <Award size={12} />
                        {module.level}
                      </span>
                    )}
                  </div>

                  {/* Instructor */}
                  {module.instructor && (
                    <p className="text-xs text-gray-500 mb-3">
                      By <span className="font-semibold text-gray-700">{module.instructor}</span>
                    </p>
                  )}

                  {/* Rating (if available) */}
                  {module.rating && (
                    <div className="flex items-center gap-1 mb-3">
                      <span className="text-sm font-bold text-gray-900">{module.rating}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < Math.floor(module.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      {module.reviewCount && (
                        <span className="text-xs text-gray-500">({module.reviewCount})</span>
                      )}
                    </div>
                  )}

                  {/* CTA */}
                  <div className="pt-3 border-t border-gray-100">
                    {module.videoUrl ? (
                      <a
                        href={module.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded transition-colors"
                      >
                        <Play size={16} />
                        Watch Now
                      </a>
                    ) : (
                      <button className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded transition-colors">
                        <BookOpen size={16} />
                        Read Article
                      </button>
                    )}
                  </div>

                  {/* Resources */}
                  {module.resources && module.resources.length > 0 && (
                    <div className="mt-2">
                      <button className="w-full py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 rounded transition-colors">
                        {module.resources.length} Resource{module.resources.length > 1 ? 's' : ''} Available
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-12 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2Mi1oMnYtMmgtMnptMC00djJoMnYtMmgtMnptMC00djJoMnYtMmgtMnptMC00djJoMnYtMmgtMnptMC00djJoMnYtMmgtMnptMC00djJoMnYtMmgtMnptMC00djJoMnYtMmgtMnptMC00djJoMnYtMmgtMnptMC00djJoMnYtMmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

          <div className="relative z-10">
            <Award size={48} className="mx-auto mb-4 text-yellow-300" />
            <h2 className="text-3xl font-bold mb-4">Ready to Enhance Your Digital Skills?</h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Join our comprehensive training programs and become a digital transformation leader
            </p>
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105">
              Explore All Programs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learning;
