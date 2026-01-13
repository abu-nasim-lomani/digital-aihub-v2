import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/config';
import { ArrowLeft, Calendar, MapPin, Video, FileText, Download, Image as ImageIcon } from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';

// Demo Archive Events (same as in Events.jsx)
const demoArchiveEvents = [
  {
    id: 'demo-archive-2025-1',
    title: 'Digital Transformation Summit 2025',
    description: 'A comprehensive summit bringing together digital transformation leaders, policymakers, and practitioners to discuss the future of digital public infrastructure and AI governance.',
    outcome: 'Successfully convened 200+ participants from 15 countries. Launched new DPI framework guidelines and established partnerships with 5 international organizations. Published comprehensive report on digital transformation best practices.',
    date: '2025-11-15',
    type: 'archive',
    location: 'Dhaka, Bangladesh',
    videoUrls: [],
    galleryImages: [],
    documents: [],
    status: 'published',
    created_at: '2025-11-15T10:00:00Z',
  },
  {
    id: 'demo-archive-2025-2',
    title: 'AI for Development Workshop Series',
    description: 'Multi-day workshop series focused on practical applications of AI in development contexts, including hands-on training sessions and case study presentations.',
    outcome: 'Trained 150+ development practitioners in AI fundamentals and applications. Developed 10 case studies showcasing successful AI implementations. Created comprehensive training materials now used across UNDP offices.',
    date: '2025-08-20',
    type: 'archive',
    location: 'Virtual & Dhaka',
    videoUrls: [],
    galleryImages: [],
    documents: [],
    status: 'published',
    created_at: '2025-08-20T09:00:00Z',
  },
  {
    id: 'demo-archive-2025-3',
    title: 'Digital Public Infrastructure Launch',
    description: 'Official launch event for the new Digital Public Infrastructure initiative, showcasing key components and implementation roadmap.',
    outcome: 'Successfully launched DPI initiative with support from government and private sector partners. Secured commitments from 3 major technology providers. Established governance framework and implementation timeline.',
    date: '2025-05-10',
    type: 'archive',
    location: 'UNDP Office, Dhaka',
    videoUrls: [],
    galleryImages: [],
    documents: [],
    status: 'published',
    created_at: '2025-05-10T14:00:00Z',
  },
  {
    id: 'demo-archive-2024-1',
    title: 'UNDP Digital Innovation Conference 2024',
    description: 'Annual conference highlighting digital innovation projects, capacity building initiatives, and strategic partnerships in the development sector.',
    outcome: 'Showcased 25+ innovative digital projects. Facilitated networking between 300+ participants. Signed 8 new partnership agreements. Published innovation report with key learnings and recommendations.',
    date: '2024-12-05',
    type: 'archive',
    location: 'Dhaka, Bangladesh',
    videoUrls: [],
    galleryImages: [],
    documents: [],
    status: 'published',
    created_at: '2024-12-05T10:00:00Z',
  },
  {
    id: 'demo-archive-2024-2',
    title: 'Capacity Building Program: Digital Governance',
    description: 'Intensive training program for government officials on digital governance principles, e-governance systems, and citizen-centric service delivery.',
    outcome: 'Trained 80+ government officials from 12 ministries. Developed digital governance toolkit now used across government departments. Established peer learning network for continued knowledge sharing.',
    date: '2024-09-18',
    type: 'archive',
    location: 'Bangladesh Public Administration Training Centre',
    videoUrls: [],
    galleryImages: [],
    documents: [],
    status: 'published',
    created_at: '2024-09-18T08:00:00Z',
  },
  {
    id: 'demo-archive-2024-3',
    title: 'AI Ethics and Responsible Innovation Forum',
    description: 'Forum discussing ethical considerations in AI deployment, bias mitigation strategies, and frameworks for responsible AI in development contexts.',
    outcome: 'Developed AI ethics framework for UNDP Bangladesh. Created guidelines for responsible AI implementation. Established ethics review board. Published white paper on AI ethics in development.',
    date: '2024-07-22',
    type: 'archive',
    location: 'Virtual',
    videoUrls: [],
    galleryImages: [],
    documents: [],
    status: 'published',
    created_at: '2024-07-22T13:00:00Z',
  },
  {
    id: 'demo-archive-2024-4',
    title: 'Digital Inclusion Workshop',
    description: 'Workshop focused on ensuring digital solutions are accessible and inclusive, addressing barriers faced by marginalized communities.',
    outcome: 'Identified key barriers to digital inclusion. Developed inclusive design guidelines. Created accessibility checklist for digital projects. Trained 60+ practitioners in inclusive design principles.',
    date: '2024-04-15',
    type: 'archive',
    location: 'Dhaka, Bangladesh',
    videoUrls: [],
    galleryImages: [],
    documents: [],
    status: 'published',
    created_at: '2024-04-15T10:00:00Z',
  },
  {
    id: 'demo-archive-2023-1',
    title: 'UNDP Digital Hub Inauguration',
    description: 'Official inauguration ceremony of the UNDP Digital & AI Hub, marking a new chapter in digital transformation initiatives.',
    outcome: 'Successfully launched Digital & AI Hub with support from key stakeholders. Announced initial portfolio of 10 digital transformation projects. Established partnerships with academic institutions and tech companies.',
    date: '2023-11-20',
    type: 'archive',
    location: 'UNDP Office, Dhaka',
    videoUrls: [],
    galleryImages: [],
    documents: [],
    status: 'published',
    created_at: '2023-11-20T15:00:00Z',
  },
  {
    id: 'demo-archive-2023-2',
    title: 'E-Governance Best Practices Exchange',
    description: 'Regional exchange program sharing e-governance best practices and lessons learned from successful digital transformation initiatives.',
    outcome: 'Facilitated knowledge exchange between 5 countries. Documented 15 best practices. Created regional e-governance network. Published comparative analysis report.',
    date: '2023-09-10',
    type: 'archive',
    location: 'Dhaka, Bangladesh',
    videoUrls: [],
    galleryImages: [],
    documents: [],
    status: 'published',
    created_at: '2023-09-10T09:00:00Z',
  },
  {
    id: 'demo-archive-2023-3',
    title: 'Data Analytics for Development Training',
    description: 'Comprehensive training program on using data analytics tools and techniques for program monitoring, evaluation, and decision-making.',
    outcome: 'Trained 100+ development professionals in data analytics. Established data analytics community of practice. Created resource library with tools and templates. Developed case studies showcasing impact.',
    date: '2023-06-25',
    type: 'archive',
    location: 'Virtual',
    videoUrls: [],
    galleryImages: [],
    documents: [],
    status: 'published',
    created_at: '2023-06-25T11:00:00Z',
  },
  {
    id: 'demo-archive-2023-4',
    title: 'Digital Transformation Strategy Workshop',
    description: 'Strategic planning workshop to develop digital transformation roadmaps for government agencies and development organizations.',
    outcome: 'Developed digital transformation strategies for 8 organizations. Created strategic planning toolkit. Established implementation support framework. Published guidebook on digital transformation planning.',
    date: '2023-03-12',
    type: 'archive',
    location: 'Dhaka, Bangladesh',
    videoUrls: [],
    galleryImages: [],
    documents: [],
    status: 'published',
    created_at: '2023-03-12T10:00:00Z',
  },
];

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // Check if it's a demo event first
        const demoEvent = demoArchiveEvents.find(e => e.id === id);
        if (demoEvent) {
          setEvent(demoEvent);
          setLoading(false);
          return;
        }

        // Fetch event by ID directly from Supabase
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          console.error('Error fetching event:', error);
          setEvent(null);
        } else if (data) {
          // Map snake_case to camelCase for display
          const mappedData = {
            ...data,
            videoUrls: data.video_urls || data.videoUrls || [],
            galleryImages: data.gallery_images || data.galleryImages || [],
            documents: data.documents || [],
          };
          setEvent(mappedData);
        } else {
          setEvent(null);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  const formatDate = (date) => {
    if (!date) return 'Date TBA';
    const d = date?.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="section-container py-12">
          <SkeletonLoader type="card" count={1} />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-white">
        <div className="section-container py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Event Not Found</h1>
            <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => {
                navigate('/');
                // Scroll to events section after navigation
                setTimeout(() => {
                  const element = document.getElementById('events');
                  if (element) {
                    const offset = 80;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - offset;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                  }
                }, 100);
              }}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <ArrowLeft size={18} />
              <span>Back to Events</span>
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
            onClick={() => {
              navigate('/');
              // Scroll to events section after navigation
              setTimeout(() => {
                const element = document.getElementById('events');
                if (element) {
                  const offset = 80;
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - offset;
                  window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
              }, 100);
            }}
            className="inline-flex items-center space-x-2 text-white hover:text-gray-200 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Events</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-bold">{event.title}</h1>
        </div>
      </div>

      <div className="section-container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {/* Event Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600">
                <Calendar size={20} className="mr-2 text-undp-blue" />
                <span>{formatDate(event.date)}</span>
              </div>
              {event.location && (
                <div className="flex items-center text-gray-600">
                  <MapPin size={20} className="mr-2 text-undp-blue" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2 text-lg">Description</h3>
                <p className="text-gray-600 whitespace-pre-line">{event.description}</p>
              </div>
            )}

            {/* Outcome */}
            {event.outcome && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2 text-lg">Outcome</h3>
                <p className="text-gray-600 whitespace-pre-line">{event.outcome}</p>
              </div>
            )}

            {/* Videos */}
            {(event.videoUrls?.length > 0 || event.videoUrl) && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-4 text-lg flex items-center">
                  <Video size={20} className="mr-2 text-undp-blue" />
                  Videos
                </h3>
                <div className="space-y-4">
                  {event.videoUrls?.map((videoUrl, index) => (
                    <div key={index} className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                      <a
                        href={videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary inline-flex items-center space-x-2"
                      >
                        <Video size={18} />
                        <span>Watch Video {index + 1}</span>
                      </a>
                    </div>
                  ))}
                  {event.videoUrl && !event.videoUrls && (
                    <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                      <a
                        href={event.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary inline-flex items-center space-x-2"
                      >
                        <Video size={18} />
                        <span>Watch Video</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Gallery Images */}
            {event.galleryImages && event.galleryImages.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-4 text-lg flex items-center">
                  <ImageIcon size={20} className="mr-2 text-undp-blue" />
                  Gallery
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {event.galleryImages.map((imageUrl, index) => (
                    <img
                      key={index}
                      src={imageUrl}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => window.open(imageUrl, '_blank')}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Documents */}
            {event.documents && event.documents.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-4 text-lg flex items-center">
                  <FileText size={20} className="mr-2 text-undp-blue" />
                  Documents
                </h3>
                <div className="space-y-2">
                  {event.documents.map((doc, index) => {
                    const docUrl = typeof doc === 'string' ? doc : doc.url || doc;
                    const docName = typeof doc === 'string' 
                      ? `Document ${index + 1}` 
                      : (doc.name || `Document ${index + 1}`);
                    const docSize = typeof doc === 'object' && doc.size ? doc.size : null;
                    
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="bg-undp-blue rounded-lg p-2 flex-shrink-0">
                            <FileText size={20} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {docName}
                            </p>
                            {docSize && (
                              <p className="text-xs text-gray-500 mt-1">
                                {(docSize / 1024).toFixed(1)} KB
                              </p>
                            )}
                          </div>
                        </div>
                        <a
                          href={docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary ml-4 flex items-center space-x-2 whitespace-nowrap flex-shrink-0"
                        >
                          <Download size={18} />
                          <span>Download</span>
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
