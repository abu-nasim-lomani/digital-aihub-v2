import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { initiativesAPI } from '../utils/api';
import { Lightbulb, Calendar, FileText, ExternalLink, ChevronRight, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Initiatives = () => {
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('All');

  useEffect(() => {
    fetchInitiatives();
  }, []);

  const fetchInitiatives = async () => {
    try {
      const response = await initiativesAPI.getAll();
      const published = response.data.filter(i => i.status === 'published');
      setInitiatives(published);
    } catch (error) {
      console.error('Error fetching initiatives:', error);
    } finally {
      setLoading(false);
    }
  };

  const types = ['All', 'Policy', 'Technology', 'Capacity Building', 'Innovation'];

  const filteredInitiatives = initiatives.filter(initiative => {
    if (selectedType === 'All') return true;
    return initiative.type === selectedType;
  });

  const getInitiativeImage = (title) => {
    if (!title) return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800';
    const t = title.toLowerCase();
    if (t.includes('ai') || t.includes('data')) return 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800';
    if (t.includes('digital') || t.includes('tech')) return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800';
    if (t.includes('policy') || t.includes('gov')) return 'https://images.unsplash.com/photo-1541872703-74c59669c478?auto=format&fit=crop&q=80&w=800';
    if (t.includes('innovation')) return 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800';
    return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800';
  };

  const stats = [
    { label: 'Ongoing Initiatives', value: initiatives.filter(i => i.status === 'published').length, icon: Lightbulb, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Total Initiatives', value: initiatives.length, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Active Programs', value: initiatives.filter(i => i.status === 'published').length, icon: CheckCircle, color: 'text-teal-500', bg: 'bg-teal-50' },
    { label: 'Partners', value: '15+', icon: FileText, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header - Same as Projects */}
      <div className="bg-[#003359] text-white pt-20 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#002845_25%,transparent_25%,transparent_75%,#002845_75%,#002845),linear-gradient(45deg,#002845_25%,transparent_25%,transparent_75%,#002845_75%,#002845)] bg-[length:20px_20px] opacity-[0.05]"></div>
        <div className="section-container relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold tracking-widest uppercase mb-4">
                Strategic Programs
              </span>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Digital Initiatives</h1>
              <p className="text-blue-100 text-lg max-w-xl leading-relaxed">
                Discover our strategic initiatives driving digital transformation and innovation
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container py-12 relative z-20">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-8 pb-2">
          {types.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedType === type
                ? 'bg-white text-undp-blue shadow-md border-b-2 border-undp-blue'
                : 'text-gray-500 hover:bg-gray-100'
                }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Initiatives Grid - Same style as Projects */}
        {filteredInitiatives.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <Lightbulb className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No initiatives found</h3>
            <p className="text-gray-500">We are currently updating our initiatives.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {filteredInitiatives.map((initiative) => (
              <div key={initiative.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={initiative.imageUrl || getInitiativeImage(initiative.title)}
                    alt={initiative.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur rounded-lg text-[10px] font-bold uppercase tracking-wider text-gray-700 shadow-sm">
                    {initiative.type || 'Initiative'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-blue-600 transition-colors">
                    {initiative.title}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-1">
                    {initiative.description}
                  </p>

                  {/* Meta - Impact & Result */}
                  <div className="space-y-2 mb-4">
                    {initiative.impact && (
                      <div className="flex items-start gap-2 text-xs">
                        <CheckCircle size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 line-clamp-2">
                          <strong className="text-gray-900">Impact:</strong> {initiative.impact}
                        </span>
                      </div>
                    )}
                    {initiative.result && (
                      <div className="flex items-start gap-2 text-xs">
                        <TrendingUp size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 line-clamp-2">
                          <strong className="text-gray-900">Result:</strong> {initiative.result}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Link to={`/initiatives/${initiative.id}`} className="text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1">
                        Details <ChevronRight size={14} />
                      </Link>
                      {initiative.documentUrl && (
                        <a href={initiative.documentUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors" title="View Document">
                          <FileText size={16} />
                        </a>
                      )}
                    </div>
                    {initiative.createdAt && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(initiative.createdAt).getFullYear()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Initiatives;
