import { useEffect, useState } from 'react';
import { fetchCollection } from '../utils/supabaseHelpers';
import {
  BookOpen, Play, Download, X, Clock, Users, Star,
  ChevronRight, Search, Filter, GraduationCap, CheckCircle
} from 'lucide-react';
import { downloadAsPDF, markdownToHTML } from '../utils/downloadPDF';
import { resourceContents } from '../utils/resourceContent';
import LoadingSpinner from '../components/LoadingSpinner';
import SkeletonLoader from '../components/SkeletonLoader';

// Helper to get deterministic images based on keywords
const getCoverImage = (title) => {
  const t = title.toLowerCase();
  if (t.includes('ai') || t.includes('intelligence')) return 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800'; // AI abstract
  if (t.includes('data') || t.includes('analytics')) return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800'; // Data visualization
  if (t.includes('ethics') || t.includes('policy') || t.includes('governance')) return 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800'; // Meeting/Policy
  if (t.includes('vision') || t.includes('image')) return 'https://images.unsplash.com/photo-1561736778-92e52a7769ef?auto=format&fit=crop&q=80&w=800'; // Eye/Lens
  if (t.includes('nlp') || t.includes('language')) return 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=800'; // Text/Code
  return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'; // Generic Tech
};

const DownloadButton = ({ resource }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (e) => {
    e.stopPropagation();
    setDownloading(true);
    try {
      const content = resourceContents[resource] || `# ${resource}\n\nNo content available.`;
      const htmlContent = markdownToHTML(content);
      await downloadAsPDF(htmlContent, resource.replace('.md', '.pdf'));
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-undp-blue text-xs font-bold rounded-lg hover:bg-blue-100 transition-colors"
    >
      {downloading ? <LoadingSpinner size="sm" /> : <Download size={14} />}
      <span>{resource.replace('.md', '').replace(/_/g, ' ')}</span>
    </button>
  );
};

const Learning = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState(null);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const data = await fetchCollection('learningModules', {}, false);
        // Fallback data if DB is empty (same as before but cleaner)
        const initialModules = data.length > 0 ? data : [
          {
            id: '1',
            moduleTitle: 'Introduction to Artificial Intelligence',
            content: 'Explore the fundamentals of AI, including machine learning, deep learning, and neural networks.',
            videoUrl: '',
            resources: ['AI_Fundamentals.md', 'AI_Glossary.md'],
            curriculum: 'Module 1: What is AI?\nModule 2: Types of AI Systems\nModule 3: Machine Learning Basics',
            duration: '45 min',
            level: 'Beginner'
          },
          {
            id: '2',
            moduleTitle: 'AI for Development Practitioners',
            content: 'Learn how to leverage AI tools and technologies in development projects and impact assessment.',
            videoUrl: '',
            resources: ['AI_Handbook.md', 'Case_Studies.md'],
            curriculum: 'Module 1: AI in Development\nModule 2: Data Collection\nModule 3: Predictive Analytics',
            duration: '1h 20m',
            level: 'Intermediate'
          },
          {
            id: '3',
            moduleTitle: 'AI Ethics and Responsible AI',
            content: 'Explore ethical considerations, bias, fairness, transparency, and accountability in AI systems.',
            videoUrl: '',
            resources: ['AI_Ethics.md', 'Bias_Guide.md'],
            curriculum: 'Module 1: Understanding Bias\nModule 2: Fairness & Equity\nModule 3: Transparency',
            duration: '50 min',
            level: 'Advanced'
          },
          {
            id: '4',
            moduleTitle: 'Data Privacy & Security',
            content: 'Best practices for handling sensitive data in the age of AI and digital transformation.',
            videoUrl: '',
            resources: ['Privacy_Guide.md'],
            curriculum: 'Module 1: Data Protection Laws\nModule 2: Encryption Basics\nModule 3: Secure Sharing',
            duration: '35 min',
            level: 'Beginner'
          },
          {
            id: '5',
            moduleTitle: 'Digital Leadership Strategy',
            content: 'Strategic frameworks for leaders driving digital transformation in their organizations.',
            videoUrl: '',
            resources: ['Leadership_Framework.md'],
            curriculum: 'Module 1: Digital Mindset\nModule 2: Change Management\nModule 3: Innovation Culture',
            duration: '2h',
            level: 'Advanced'
          },
          {
            id: '6',
            moduleTitle: 'Natural Language Processing NLP',
            content: 'Understand how computers process human language and apply it to development data.',
            videoUrl: '',
            resources: ['NLP_Basics.md'],
            curriculum: 'Module 1: Text Analysis\nModule 2: Sentiment Analysis\nModule 3: Chatbots',
            duration: '1h',
            level: 'Intermediate'
          }
        ];

        // Add images and tags
        const processed = initialModules
          .filter(m => m.moduleTitle) // Filter out invalid entries
          .map(m => ({
            ...m,
            imageUrl: getCoverImage(m.moduleTitle),
            category: (m.moduleTitle || '').toLowerCase().includes('lead') ? 'Leadership'
              : (m.moduleTitle || '').toLowerCase().includes('ethic') ? 'Policy'
                : 'AI & Tech'
          }));

        setModules(processed);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  // Filter Logic
  const categories = ['All', 'AI & Tech', 'Policy', 'Leadership'];

  const filteredModules = modules.filter(m => {
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory || (selectedCategory === 'AI & Tech' && !['Leadership', 'Policy'].includes(m.category));
    const matchesSearch = m.moduleTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50/50">

      {/* Premium Header */}
      <div className="bg-[#003359] text-white pt-16 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="section-container relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold tracking-widest uppercase mb-4">
            Knowledge Hub
          </span>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Learning & Capacity Development</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
            Build your digital transformation skills through our comprehensive learning modules
          </p>
        </div>
      </div>

      <div className="section-container -mt-10 pb-20 relative z-20">

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-2 mb-10 flex flex-col md:flex-row items-center gap-2 max-w-4xl mx-auto">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
          <div className="flex items-center gap-1 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0 px-2 md:px-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat
                  ? 'bg-undp-blue text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-100'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <SkeletonLoader type="card" count={6} />
          </div>
        ) : filteredModules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {filteredModules.map((module) => (
              <div
                key={module.id}
                onClick={() => setSelectedModule(module)}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
              >
                {/* Card Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={module.imageUrl}
                    alt={module.moduleTitle}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded text-white text-[10px] font-bold border border-white/30 truncate max-w-[120px]">
                      {module.category || 'Course'}
                    </span>
                    {module.level && (
                      <span className="px-2 py-1 bg-black/40 backdrop-blur-md rounded text-white text-[10px] font-bold border border-white/10 flex items-center gap-1">
                        <GraduationCap size={10} /> {module.level}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 leading-snug group-hover:text-undp-blue transition-colors">
                    {module.moduleTitle}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
                    {module.content}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-xs text-gray-400 font-medium">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Clock size={14} /> {module.duration || '45m'}</span>
                      <span className="flex items-center gap-1"><Users size={14} /> 120+</span>
                    </div>
                    <span className="text-undp-blue group-hover:translate-x-1 transition-transform">
                      <ChevronRight size={18} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex p-4 rounded-full bg-gray-100 mb-4 text-gray-400"><Filter size={24} /></div>
            <h3 className="text-lg font-bold text-gray-900">No courses found</h3>
            <p className="text-gray-500">Try adjusting your filters.</p>
          </div>
        )}
      </div>

      {/* Course Detail Modal */}
      {selectedModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col md:flex-row">

            {/* Modal Sidebar / Image */}
            <div className="w-full md:w-1/3 bg-gray-900 relative">
              <img src={selectedModule.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90"></div>
              <div className="absolute bottom-0 left-0 p-8 text-white space-y-4">
                <div className="inline-block px-3 py-1 bg-blue-500 rounded-full text-xs font-bold">
                  {selectedModule.category || 'Course'}
                </div>
                <h2 className="text-2xl font-bold leading-tight">{selectedModule.moduleTitle}</h2>
                <div className="flex items-center gap-4 text-sm opacity-80">
                  <span className="flex items-center gap-1"><Clock size={14} /> {selectedModule.duration || '45m'}</span>
                  <span className="flex items-center gap-1"><Star size={14} className="text-yellow-400 fill-yellow-400" /> 4.8</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedModule(null)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-white">

              {/* Action Bar */}
              <div className="flex items-center gap-3 mb-8">
                <button className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-blue-500/20">
                  <Play size={18} fill="currentColor" />
                  <span>Start Learning</span>
                </button>
                <button className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600">
                  <Star size={20} />
                </button>
              </div>

              {/* Tabs / Sections */}
              <div className="space-y-8">

                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <BookOpen size={20} className="text-undp-blue" />
                    About this Course
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {selectedModule.content}
                    <br /><br />
                    This comprehensive module covers essential concepts and practical applications. Designed for professionals seeking to enhance their digital capabilities.
                  </p>
                </section>

                {selectedModule.curriculum && (
                  <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Curriculum</h3>
                    <div className="space-y-3">
                      {selectedModule.curriculum.split('\n').map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <div className="mt-0.5 min-w-[24px] h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </div>
                          <span className="text-sm text-gray-700 font-medium">{item.replace('Module ' + (i + 1) + ': ', '')}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {selectedModule.resources && selectedModule.resources.length > 0 && (
                  <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Resources</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedModule.resources.map((res, i) => (
                        <DownloadButton key={i} resource={res} />
                      ))}
                    </div>
                  </section>
                )}

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Learning;
