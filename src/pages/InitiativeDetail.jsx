import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase/config';
import { ArrowLeft, ExternalLink, FileText, Calendar, User, Tag, CheckCircle, Share2, Download, ChevronRight } from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';

const InitiativeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initiative, setInitiative] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitiative = async () => {
      try {
        const { data, error } = await supabase
          .from('initiatives')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          const mappedData = {
            ...data,
            imageUrl: data.image_url || data.imageUrl,
            documentUrl: data.document_url || data.documentUrl,
            documentName: data.document_name || data.documentName,
          };
          setInitiative(mappedData);
        }
      } catch (error) {
        console.error('Error fetching initiative:', error);
        setInitiative(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInitiative();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="section-container max-w-5xl py-10">
          <SkeletonLoader type="text" count={1} className="h-12 w-3/4 mb-6" />
          <SkeletonLoader type="card" count={1} className="h-80 w-full rounded-2xl mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-4">
              <SkeletonLoader type="text" count={6} />
            </div>
            <div className="space-y-4">
              <SkeletonLoader type="card" count={1} className="h-40" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!initiative) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="text-red-500 h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Initiative Not Found</h1>
          <p className="text-sm text-gray-500 mb-6">The project you are looking for might have been removed or is temporarily unavailable.</p>
          <button onClick={() => navigate('/initiatives')} className="btn-primary w-full justify-center">
            Back to Initiatives
          </button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(initiative.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-white">

      {/* Breadcrumb / Top Nav */}
      <div className="bg-gray-50 border-b border-gray-100 pt-24 pb-6">
        <div className="section-container max-w-6xl">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
            <Link to="/" className="hover:text-undp-blue transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to="/initiatives" className="hover:text-undp-blue transition-colors">Initiatives</Link>
            <ChevronRight size={12} />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{initiative.title}</span>
          </div>

          {/* Header Content */}
          <div className="max-w-4xl">
            {initiative.type && (
              <span className="inline-block px-3 py-1 bg-blue-100 text-undp-blue text-xs font-bold tracking-wider uppercase rounded-full mb-3">
                {initiative.type}
              </span>
            )}
            {/* Reduced Font Size Here */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-4">
              {initiative.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-gray-500 text-xs md:text-sm border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-undp-blue" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} className="text-undp-blue" />
                <span className="capitalize">{initiative.created_by?.split('@')[0] || 'UNDP Admin'}</span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-undp-blue" title="Share">
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container max-w-6xl py-8">

        {/* Featured Image - Reduced Height */}
        {initiative.imageUrl && (
          <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-xl mb-10 group">
            <img
              src={initiative.imageUrl}
              alt={initiative.title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
          </div>
        )}

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Main Content - Reduced Font Sizes */}
          <div className="lg:col-span-8 space-y-10">
            <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed text-sm md:text-base">
              <p className="text-lg text-gray-800 font-medium leading-relaxed drop-cap">
                {initiative.description}
              </p>
              {/* Placeholder for more extended content if we had it */}
              <p>
                This initiative represents a significant step forward in our mission. By leveraging cutting-edge technology and fostering cross-sector collaboration, we aim to deliver sustainable, scalable solutions that address critical challenges. The outcomes of this project will serve as a blueprint for future endeavors, ensuring that our impact resonates far beyond the immediate scope.
              </p>
            </div>

            {/* Results Section */}
            {initiative.result && (
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600" />
                  Key Results
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">{initiative.result}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">

            {/* Impact Card */}
            {initiative.impact && (
              <div className="bg-undp-blue text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/3 -translate-y-1/3">
                  <Tag size={150} />
                </div>
                <h3 className="text-sm font-bold text-blue-100 uppercase tracking-widest mb-2">Impact</h3>
                <div className="text-2xl font-bold mb-3 leading-tight relative z-10">
                  {initiative.impact}
                </div>
                <div className="h-1 w-12 bg-white/30 rounded-full"></div>
              </div>
            )}

            {/* Documents Card */}
            {initiative.documentUrl && (
              <div className="border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow bg-white">
                <h3 className="text-base font-bold text-gray-900 mb-3">Resources</h3>
                <a
                  href={initiative.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-undp-blue/30 hover:bg-blue-50/30 transition-all"
                >
                  <div className="bg-white p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                    <FileText className="text-red-500" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {initiative.documentName || 'Project Report.pdf'}
                    </p>
                    <p className="text-[10px] text-gray-500">Click to view</p>
                  </div>
                  <Download size={16} className="text-gray-400 group-hover:text-undp-blue" />
                </a>
              </div>
            )}

            {/* Contact/CTA */}
            <div className="bg-gray-900 rounded-2xl p-6 text-center text-white">
              <h3 className="font-bold text-lg mb-2">Have questions?</h3>
              <p className="text-gray-400 text-xs mb-4">Reach out to our team for more information.</p>
              <button className="w-full py-2.5 px-4 bg-white text-gray-900 text-sm font-bold rounded-xl hover:bg-gray-100 transition-colors">
                Contact Us
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default InitiativeDetail;
