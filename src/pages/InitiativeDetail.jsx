import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { initiativesAPI } from '../utils/api';
import { ArrowLeft, Calendar, FileText, ExternalLink } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const InitiativeDetail = () => {
  const { id } = useParams();
  const [initiative, setInitiative] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitiative();
  }, [id]);

  const fetchInitiative = async () => {
    try {
      setLoading(true);
      const response = await initiativesAPI.getById(id);
      setInitiative(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!initiative) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Initiative Not Found</h2>
          <Link to="/initiatives" className="text-blue-600 hover:underline">
            ← Back to Initiatives
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-undp-blue text-white py-8">
        <div className="section-container">
          <Link to="/initiatives" className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-4">
            <ArrowLeft size={20} />
            Back to Initiatives
          </Link>
          <h1 className="text-3xl font-bold">{initiative.title}</h1>
        </div>
      </div>

      <div className="section-container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            {initiative.imageUrl && (
              <img src={initiative.imageUrl} alt={initiative.title} className="w-full h-64 object-cover rounded-lg mb-6" />
            )}

            {initiative.description && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed">{initiative.description}</p>
              </div>
            )}

            {initiative.impact && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Impact</h2>
                <p className="text-gray-700 leading-relaxed">{initiative.impact}</p>
              </div>
            )}

            {initiative.result && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Result</h2>
                <p className="text-gray-700 leading-relaxed">{initiative.result}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {initiative.type && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">Type</h3>
                  <p className="text-gray-900">{initiative.type}</p>
                </div>
              )}

              {initiative.createdAt && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">Created</h3>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Calendar size={16} />
                    {new Date(initiative.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {initiative.documentUrl && (
              <div className="pt-6 border-t border-gray-200">
                <a
                  href={initiative.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  <FileText size={20} />
                  View Document
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
