import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/config';
import { ArrowLeft, ExternalLink, FileText } from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';

const InitiativeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initiative, setInitiative] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitiative = async () => {
      try {
        // Fetch initiative by ID directly from Supabase
        const { data, error } = await supabase
          .from('initiatives')
          .select('*')
          .eq('id', id)
          .eq('status', 'published')
          .single();
        
        if (error) {
          console.error('Error fetching initiative:', error);
          setInitiative(null);
        } else if (data) {
          // Map snake_case to camelCase for display
          const mappedData = {
            ...data,
            imageUrl: data.image_url || data.imageUrl,
            documentUrl: data.document_url || data.documentUrl,
            documentName: data.document_name || data.documentName,
          };
          setInitiative(mappedData);
        } else {
          setInitiative(null);
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
      <div className="min-h-screen bg-white">
        <div className="section-container py-12">
          <SkeletonLoader type="card" count={1} />
        </div>
      </div>
    );
  }

  if (!initiative) {
    return (
      <div className="min-h-screen bg-white">
        <div className="section-container py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Initiative Not Found</h1>
            <p className="text-gray-600 mb-6">The initiative you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/initiatives')}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <ArrowLeft size={18} />
              <span>Back to Initiatives</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-undp-blue text-white py-6">
        <div className="section-container">
          <button
            onClick={() => navigate('/initiatives')}
            className="inline-flex items-center space-x-2 text-white hover:text-gray-200 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Initiatives</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-bold">{initiative.title}</h1>
        </div>
      </div>

      <div className="section-container py-8">
        <div className="max-w-4xl mx-auto">
          {initiative.imageUrl && (
            <div className="mb-8">
              <img
                src={initiative.imageUrl}
                alt={initiative.title}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          <div className="space-y-6">
            {initiative.type && (
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-2">Type</h2>
                <span className="inline-block bg-undp-blue text-white px-4 py-2 rounded-full text-sm font-medium">
                  {initiative.type}
                </span>
              </div>
            )}

            {initiative.description && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-3">Description</h2>
                <p className="text-gray-600 whitespace-pre-line leading-relaxed">{initiative.description}</p>
              </div>
            )}

            {initiative.impact && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-3">Impact</h2>
                <p className="text-gray-600 whitespace-pre-line leading-relaxed">{initiative.impact}</p>
              </div>
            )}

            {initiative.result && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-3">Result</h2>
                <p className="text-gray-600 whitespace-pre-line leading-relaxed">{initiative.result}</p>
              </div>
            )}

            {initiative.documentUrl && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-3">Document</h2>
                <a
                  href={initiative.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <FileText size={18} />
                  <span>{initiative.documentName || 'View Document'}</span>
                  <ExternalLink size={16} />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InitiativeDetail;
