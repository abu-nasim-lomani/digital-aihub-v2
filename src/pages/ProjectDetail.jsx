import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/config';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';
import { useRequireAuth } from '../utils/requireAuth';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requireAuth } = useRequireAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        // Fetch project by ID directly from Supabase
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .eq('status', 'published')
          .single();
        
        if (error) {
          console.error('Error fetching project:', error);
          setProject(null);
        } else if (data) {
          // Map snake_case to camelCase for display
          const mappedData = {
            ...data,
            supportType: data.support_type || data.supportType,
            documentUrl: data.document_url || data.documentUrl,
          };
          setProject(mappedData);
        } else {
          setProject(null);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProject();
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

  if (!project) {
    return (
      <div className="min-h-screen bg-white">
        <div className="section-container py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Project Not Found</h1>
            <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/projects')}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <ArrowLeft size={18} />
              <span>Back to Projects</span>
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
            onClick={() => navigate('/projects')}
            className="inline-flex items-center space-x-2 text-white hover:text-gray-200 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Projects</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-bold">{project.title}</h1>
        </div>
      </div>

      <div className="section-container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">Project Name</h2>
              <p className="text-gray-600 text-lg">{project.title}</p>
            </div>
            
            {project.supportType && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-3">Support Type</h2>
                <span className="inline-block bg-undp-blue text-white px-4 py-2 rounded-full text-sm font-medium">
                  {project.supportType}
                </span>
              </div>
            )}
            
            {project.duration && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-3">Project Duration</h2>
                <p className="text-gray-600">{project.duration}</p>
              </div>
            )}
            
            {project.impact && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-3">Impact</h2>
                <p className="text-gray-600 whitespace-pre-line leading-relaxed">{project.impact}</p>
              </div>
            )}
            
            {project.documentUrl && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-3">Project Details (Documents)</h2>
                <a
                  href={project.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (!requireAuth('download this document')) {
                      e.preventDefault();
                    }
                  }}
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <Download size={18} />
                  <span>Download Document</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
