import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventsAPI } from '../utils/api';
import { ArrowLeft, Calendar, MapPin, Video, Image as ImageIcon } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getById(id);
      setEvent(response.data);
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

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
          <Link to="/events" className="text-blue-600 hover:underline">
            ← Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-undp-blue text-white py-8">
        <div className="section-container">
          <Link to="/events" className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-4">
            <ArrowLeft size={20} />
            Back to Events
          </Link>
          <h1 className="text-3xl font-bold">{event.title}</h1>
        </div>
      </div>

      <div className="section-container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            {/* Event Info */}
            <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-gray-200">
              {event.date && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar size={20} className="text-blue-600" />
                  <span>{new Date(event.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              )}

              {event.location && (
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin size={20} className="text-blue-600" />
                  <span>{event.location}</span>
                </div>
              )}

              {event.type && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {event.type}
                </span>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed">{event.description}</p>
              </div>
            )}

            {/* Outcome */}
            {event.outcome && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Outcome</h2>
                <p className="text-gray-700 leading-relaxed">{event.outcome}</p>
              </div>
            )}

            {/* Media */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {event.videoUrls && event.videoUrls.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                    <Video size={16} />
                    Videos ({event.videoUrls.length})
                  </h3>
                  <div className="space-y-2">
                    {event.videoUrls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-600 hover:underline text-sm"
                      >
                        Video {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {event.galleryImages && event.galleryImages.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                    <ImageIcon size={16} />
                    Photos ({event.galleryImages.length})
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {event.galleryImages.slice(0, 4).map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Event ${idx + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
