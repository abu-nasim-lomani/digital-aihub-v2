import { useEffect, useState } from 'react';
import { supabase } from '../supabase/config';
import { fetchCollection } from '../utils/supabaseHelpers';
import { useAuth } from '../contexts/AuthContext';
import { useRequireAuth } from '../utils/requireAuth';
import {
  Calendar, Clock, MapPin, Search, Filter, ChevronRight,
  ArrowRight, CheckCircle, X, ExternalLink, Play, Image as ImageIcon,
  FileText, Download, Users, Trophy
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import SkeletonLoader from '../components/SkeletonLoader';
import Modal from '../components/Modal';

// Helper for event images
const getEventImage = (title) => {
  const t = (title || '').toLowerCase();
  if (t.includes('summit') || t.includes('conference')) return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800';
  if (t.includes('workshop') || t.includes('training')) return 'https://images.unsplash.com/photo-1544531320-72e7c38e3478?auto=format&fit=crop&q=80&w=800';
  if (t.includes('launch') || t.includes('ceremony')) return 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800';
  if (t.includes('ai') || t.includes('tech')) return 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800';
  return 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800';
};

const Events = () => {
  const { currentUser } = useAuth();
  const { requireAuth } = useRequireAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'archive'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await fetchCollection('events', {});
        // Process and split
        const processed = data
          .filter(e => e.title) // Safety
          .map(e => ({
            ...e,
            dateObj: e.date ? new Date(e.date) : new Date(),
            imageUrl: e.imageUrl || getEventImage(e.title)
          }))
          .sort((a, b) => b.dateObj - a.dateObj); // Descending

        setEvents(processed);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Filtering Logic
  const now = new Date();
  const filteredEvents = events.filter(e => {
    const isPast = e.dateObj < now;
    const matchesTab = activeTab === 'upcoming' ? !isPast : isPast;
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Date Formatter
  const formatDate = (date) => {
    return {
      day: date.getDate(),
      month: date.toLocaleString('default', { month: 'short' }),
      year: date.getFullYear(),
      full: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    };
  };

  return (
    <div className="min-h-screen bg-gray-50/50">

      {/* Premium Header */}
      <div className="bg-[#003359] text-white pt-24 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
        <div className="section-container relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold tracking-widest uppercase mb-4">
                Global Calendar
              </span>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Events & Summits</h1>
              <p className="text-blue-100/80 text-lg max-w-xl leading-relaxed">
                Join our global initiatives, workshops, and summits driving the digital future.
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="bg-white/10 p-1.5 rounded-xl backdrop-blur-md border border-white/10 flex">
              {['upcoming', 'archive'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold capitalize transition-all duration-300 ${activeTab === tab
                      ? 'bg-white text-[#003359] shadow-lg'
                      : 'text-blue-200 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="section-container -mt-20 pb-20 relative z-20">

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-2 mb-10 flex flex-col md:flex-row items-center gap-2 max-w-2xl mx-auto">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search events by title or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="space-y-4">
            <SkeletonLoader type="card" count={3} />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100">
            <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No events found</h3>
            <p className="text-gray-500">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className={`
            ${activeTab === 'upcoming'
              ? 'flex flex-col gap-6' // List for Upcoming
              : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' // Grid for Archive
            } animate-in fade-in slide-in-from-bottom-8 duration-700
          `}>
            {filteredEvents.map((event) => {
              const d = formatDate(event.dateObj);

              if (activeTab === 'upcoming') {
                /* Ticket Style Card (Upcoming) */
                return (
                  <div key={event.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 flex flex-col md:flex-row group">
                    {/* Date Badge (Left) */}
                    <div className="bg-blue-50 w-full md:w-48 p-6 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-blue-100 group-hover:bg-blue-600 transition-colors duration-300">
                      <span className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-1 group-hover:text-blue-200">{d.month}</span>
                      <span className="text-4xl font-extrabold text-blue-900 group-hover:text-white">{d.day}</span>
                      <span className="text-xs font-medium text-gray-400 mt-2 group-hover:text-blue-100">{d.year}</span>
                    </div>

                    {/* Content (Middle) */}
                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        <span className="flex items-center gap-1.5"><Clock size={14} /> {event.time || '10:00 AM'}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className="flex items-center gap-1.5"><MapPin size={14} /> {event.location || 'Virtual'}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2 max-w-2xl">
                        {event.description}
                      </p>
                    </div>

                    {/* Action (Right) */}
                    <div className="p-6 md:p-8 flex items-center justify-center border-t md:border-t-0 md:border-l border-gray-50">
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="btn-primary py-3 px-8 rounded-xl shadow-lg shadow-blue-500/20 w-full md:w-auto"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                );
              } else {
                /* Grid Card (Archive) */
                return (
                  <div key={event.id} onClick={() => setSelectedEvent(event)} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full">
                    <div className="relative h-48 overflow-hidden">
                      <img src={event.imageUrl} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" alt={event.title} />
                      <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur rounded-lg text-white text-xs font-bold">
                        {d.year}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="mb-2 text-xs font-bold text-blue-600 uppercase tracking-wider">{d.month} {d.day}</div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-snug">
                        {event.title}
                      </h3>
                      <div className="mt-auto flex items-center gap-2 text-xs font-medium text-gray-400">
                        <Trophy size={14} className="text-yellow-500" />
                        <span>Outcomes Available</span>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col relative">

            {/* Close Button */}
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            {/* Modal Hero */}
            <div className="relative h-64 shrink-0">
              <img src={selectedEvent.imageUrl} className="w-full h-full object-cover" alt="Event Cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              <div className="absolute bottom-6 left-8 right-8 text-white">
                <div className="flex items-center gap-3 mb-3 text-sm font-medium opacity-90">
                  <span className="px-2 py-1 bg-blue-600 rounded text-xs font-bold uppercase tracking-wider">
                    {activeTab === 'upcoming' ? 'Upcoming' : 'Archived'}
                  </span>
                  <span>{formatDate(selectedEvent.dateObj).full}</span>
                </div>
                <h2 className="text-3xl font-bold leading-tight mb-2">{selectedEvent.title}</h2>
                <div className="flex items-center gap-4 text-sm opacity-80">
                  <span className="flex items-center gap-1"><Clock size={14} /> {selectedEvent.time || '10:00 AM - 4:00 PM'}</span>
                  <span className="flex items-center gap-1"><MapPin size={14} /> {selectedEvent.location || 'Dhaka, Bangladesh'}</span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-2">About the Event</h3>
                <p>{selectedEvent.description}</p>

                {selectedEvent.outcome && (
                  <div className="mt-6 p-5 bg-blue-50 rounded-xl border border-blue-100">
                    <h4 className="flex items-center gap-2 font-bold text-blue-800 mb-2">
                      <CheckCircle size={18} /> Key Outcomes
                    </h4>
                    <p className="text-blue-700/80 mb-0">{selectedEvent.outcome}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-100">
                {activeTab === 'upcoming' ? (
                  <button className="flex-1 btn-primary py-3 rounded-xl shadow-lg flex items-center justify-center gap-2">
                    <span>Register Now</span>
                    <ArrowRight size={18} />
                  </button>
                ) : (
                  <>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                      <ImageIcon size={18} /> View Gallery
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                      <FileText size={18} /> Read Report
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Events;
