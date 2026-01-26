import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI } from '../utils/api';
import { Calendar, MapPin, Users, Video, Image as ImageIcon, ChevronRight, Clock, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventsAPI.getAll();
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    if (filterType === 'all') return true;
    return event.type === filterType;
  });

  const getEventImage = (title) => {
    if (!title) return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800';
    const t = title.toLowerCase();
    if (t.includes('workshop') || t.includes('training')) return 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&q=80&w=800';
    if (t.includes('conference') || t.includes('summit')) return 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800';
    if (t.includes('seminar') || t.includes('webinar')) return 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&q=80&w=800';
    return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800';
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
      <div className="bg-[#003359] text-white pt-20 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#002845_25%,transparent_25%,transparent_75%,#002845_75%,#002845),linear-gradient(45deg,#002845_25%,transparent_25%,transparent_75%,#002845_75%,#002845)] bg-[length:20px_20px] opacity-[0.05]"></div>

        <div className="section-container relative z-10">
          <div className="max-w-4xl">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold tracking-widest uppercase mb-4">
              Knowledge Sharing
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight">
              Events & Archive
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed max-w-2xl">
              Explore our past and upcoming events, workshops, and knowledge-sharing sessions
            </p>
          </div>
        </div>
      </div>

      <div className="section-container py-12">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-10 pb-2">
          {['all', 'upcoming', 'archive'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all capitalize ${filterType === type
                  ? 'bg-white text-undp-blue shadow-md border-b-2 border-undp-blue'
                  : 'text-gray-500 hover:bg-gray-100'
                }`}
            >
              {type === 'all' ? 'All Events' : type}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No events found</h3>
            <p className="text-gray-500">Check back soon for upcoming events</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">
                {/* Image */}
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100">
                  <img
                    src={event.imageUrl || getEventImage(event.title)}
                    alt={event.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Type Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm ${event.type === 'upcoming'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-700 text-white'
                      }`}>
                      {event.type || 'Event'}
                    </span>
                  </div>

                  {/* Date Badge */}
                  {event.date && (
                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur px-3 py-2 rounded-lg shadow-lg">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-blue-600" />
                        <span className="text-xs font-bold text-gray-900">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                    {event.title}
                  </h3>

                  {event.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                      {event.description}
                    </p>
                  )}

                  {/* Location */}
                  {event.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <MapPin size={16} className="text-blue-600" />
                      <span>{event.location}</span>
                    </div>
                  )}

                  {/* Outcome */}
                  {event.outcome && (
                    <div className="bg-green-50 border border-green-100 p-3 rounded-lg mb-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">Outcome</p>
                          <p className="text-sm text-gray-700 line-clamp-2">{event.outcome}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Media Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    {event.videoUrls && event.videoUrls.length > 0 && (
                      <span className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded">
                        <Video size={14} />
                        {event.videoUrls.length} Videos
                      </span>
                    )}
                    {event.galleryImages && event.galleryImages.length > 0 && (
                      <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded">
                        <ImageIcon size={14} />
                        {event.galleryImages.length} Photos
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <Link
                      to={`/events/${event.id}`}
                      className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
                    >
                      View Details <ChevronRight size={16} />
                    </Link>

                    {event.participants && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Users size={14} />
                        {event.participants}
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

export default Events;
