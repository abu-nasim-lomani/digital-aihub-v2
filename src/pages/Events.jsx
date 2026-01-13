import { useEffect, useState } from 'react';
import { supabase } from '../supabase/config';
import { fetchCollection } from '../utils/supabaseHelpers';
import { clearCache, getCachedData } from '../utils/cache';
import { useAuth } from '../contexts/AuthContext';
import { useRequireAuth } from '../utils/requireAuth';
import { Calendar, Clock, MapPin, Image as ImageIcon, Video, Plus, X, CheckCircle, FileText, Download, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import SkeletonLoader from '../components/SkeletonLoader';

const Events = () => {
  const { currentUser } = useAuth();
  const { requireAuth } = useRequireAuth();
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [archivedEvents, setArchivedEvents] = useState([]);
  const [eventView, setEventView] = useState('upcoming'); // 'upcoming', 'archived'
  const [expandedYears, setExpandedYears] = useState([]); // Track expanded years in tree view
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showArchiveForm, setShowArchiveForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [archiveSubmitting, setArchiveSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [archiveUploading, setArchiveUploading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [archiveSubmitSuccess, setArchiveSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    outcome: '',
    date: '',
    type: 'upcoming',
    location: '',
    videoUrls: [],
    galleryImages: [],
    documents: [],
  });
  const [archiveFormData, setArchiveFormData] = useState({
    title: '',
    description: '',
    outcome: '',
    date: '',
    type: 'archive',
    location: '',
    videoUrls: [],
    galleryImages: [],
    documents: [],
  });

  // Demo Archive Events
  const demoArchiveEvents = [
    // 2025 Events
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
    // 2024 Events
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
    // 2023 Events
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

  useEffect(() => {
    // Check cache synchronously first for instant display
    const cacheKey = `events_${JSON.stringify({})}_all`;
    const cached = getCachedData(cacheKey, true);
    
    if (cached) {
      // Merge demo events with cached data
      const allEvents = [...demoArchiveEvents, ...cached];
      const sortedData = allEvents.sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
        return dateB - dateA;
      });
      
      setEvents(sortedData);
      
      const now = new Date();
      const upcoming = sortedData.filter(event => {
        // Upcoming events: type must be 'upcoming'
        if (event.type !== 'upcoming') return false;
        // Include both published and pending events
        if (event.status && event.status !== 'published' && event.status !== 'pending') return false;
        // If date exists, it should be in the future (or today)
        if (event.date) {
          const eventDate = event.date?.toDate ? event.date.toDate() : new Date(event.date);
          // Set time to start of day for fair comparison
          const eventDateStart = new Date(eventDate);
          eventDateStart.setHours(0, 0, 0, 0);
          const nowStart = new Date(now);
          nowStart.setHours(0, 0, 0, 0);
          return eventDateStart >= nowStart;
        }
        // If no date, include it in upcoming
        return true;
      });
      const archived = sortedData.filter(event => {
        // Archived events: type must be 'archive'
        if (event.type === 'archive') return true;
        // If type is 'upcoming', don't include in archived
        if (event.type === 'upcoming') return false;
        // For other types or no type, check if date is in the past
        if (event.date) {
          const eventDate = event.date?.toDate ? event.date.toDate() : new Date(event.date);
          return eventDate < now;
        }
        // If no date and no type, don't include in archived
        return false;
      });
      
      setUpcomingEvents(upcoming);
      setArchivedEvents(archived);
      setLoading(false);
    }
    
    const fetchEvents = async () => {
      try {
        // Fetch all events (orderBy is now handled in fetchFreshData)
        const data = await fetchCollection('events', {});
        // Merge demo events with fetched data
        const allEvents = [...demoArchiveEvents, ...data];
        // Sort by date descending
        const sortedData = allEvents.sort((a, b) => {
          const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
          const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
          return dateB - dateA;
        });
        
        setEvents(sortedData);
        
        const now = new Date();
        const upcoming = sortedData.filter(event => {
          // Upcoming events: type must be 'upcoming'
          if (event.type !== 'upcoming') return false;
          // Include both published and pending events
          if (event.status && event.status !== 'published' && event.status !== 'pending') return false;
          // If date exists, it should be in the future (or today)
          if (event.date) {
            const eventDate = event.date?.toDate ? event.date.toDate() : new Date(event.date);
            // Set time to start of day for fair comparison
            const eventDateStart = new Date(eventDate);
            eventDateStart.setHours(0, 0, 0, 0);
            const nowStart = new Date(now);
            nowStart.setHours(0, 0, 0, 0);
            return eventDateStart >= nowStart;
          }
          // If no date, include it in upcoming
          return true;
        });
        const archived = sortedData.filter(event => {
          // Archived events: type must be 'archive'
          if (event.type === 'archive') return true;
          // If type is 'upcoming', don't include in archived
          if (event.type === 'upcoming') return false;
          // For other types or no type, check if date is in the past
          if (event.date) {
            const eventDate = event.date?.toDate ? event.date.toDate() : new Date(event.date);
            return eventDate < now;
          }
          // If no date and no type, don't include in archived
          return false;
        });
        
        setUpcomingEvents(upcoming);
        setArchivedEvents(archived);
      } catch (error) {
        console.error('Error fetching events:', error);
        // Even if fetch fails, show demo events
        const sortedData = demoArchiveEvents.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB - dateA;
        });
        setEvents(sortedData);
        setArchivedEvents(sortedData);
        setUpcomingEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Extract year from event date and group archived events by year
  const getYearFromDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = dateString?.toDate ? dateString.toDate() : new Date(dateString);
      return date.getFullYear();
    } catch (error) {
      return null;
    }
  };

  // Group archived events by year
  const archivedEventsByYear = archivedEvents.reduce((acc, event) => {
    const year = getYearFromDate(event.date);
    if (year) {
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(event);
    }
    return acc;
  }, {});

  // Always include these years: 2026, 2025, 2024, 2023
  const requiredYears = [2026, 2025, 2024, 2023];
  
  // Get years from archived events
  const yearsFromArchivedEvents = Object.keys(archivedEventsByYear)
    .map(Number)
    .sort((a, b) => b - a); // Descending order
  
  // Combine required years with years from archived events, remove duplicates, and sort descending
  const availableYears = [...new Set([...requiredYears, ...yearsFromArchivedEvents])]
    .sort((a, b) => b - a);

  // Toggle year expansion in tree view
  const toggleYear = (year) => {
    setExpandedYears(prev => 
      prev.includes(year) 
        ? prev.filter(y => y !== year)
        : [...prev, year]
    );
  };

  // Expand/Collapse all years
  const expandAllYears = () => {
    setExpandedYears(availableYears);
  };

  const collapseAllYears = () => {
    setExpandedYears([]);
  };

  // Expand first year by default when archived events are loaded
  useEffect(() => {
    if (eventView === 'archived' && availableYears.length > 0 && expandedYears.length === 0 && !loading) {
      setExpandedYears([availableYears[0]]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventView, archivedEvents.length, loading]);

  const formatDate = (date) => {
    if (!date) return 'Date TBA';
    const d = date?.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getDaysUntil = (date) => {
    if (!date) return null;
    const d = date?.toDate ? date.toDate() : new Date(date);
    const now = new Date();
    const diffTime = d - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleImageUpload = async (e, isArchive = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (isArchive) {
      setArchiveUploading(true);
    } else {
      setUploading(true);
    }
    try {
      const urls = [];
      for (const file of Array.from(files)) {
        const filePath = `events/images/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('files')
          .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('files')
          .getPublicUrl(filePath);
        urls.push(urlData.publicUrl);
      }
      if (isArchive) {
        setArchiveFormData({ ...archiveFormData, galleryImages: [...archiveFormData.galleryImages, ...urls] });
      } else {
        setFormData({ ...formData, galleryImages: [...formData.galleryImages, ...urls] });
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error uploading images. Please try again.');
    } finally {
      if (isArchive) {
        setArchiveUploading(false);
      } else {
        setUploading(false);
      }
    }
  };

  const handleDocumentUpload = async (e, isArchive = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    if (!requireAuth('upload documents')) {
      e.target.value = '';
      return;
    }
    
    if (isArchive) {
      setArchiveUploading(true);
    } else {
      setUploading(true);
    }
    try {
      const documentData = [];
      for (const file of Array.from(files)) {
        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          alert(`File "${file.name}" exceeds 10MB limit. Please choose a smaller file.`);
          continue;
        }
        
        const filePath = `events/documents/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('files')
          .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('files')
          .getPublicUrl(filePath);
        
        documentData.push({
          url: urlData.publicUrl,
          name: file.name,
          size: file.size,
        });
      }
      
      if (isArchive) {
        setArchiveFormData({ 
          ...archiveFormData, 
          documents: [...archiveFormData.documents, ...documentData] 
        });
      } else {
        setFormData({ 
          ...formData, 
          documents: [...formData.documents, ...documentData] 
        });
      }
    } catch (error) {
      console.error('Error uploading documents:', error);
      alert('Error uploading documents. Please try again.');
    } finally {
      if (isArchive) {
        setArchiveUploading(false);
      } else {
        setUploading(false);
      }
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!requireAuth('submit an event')) {
      return;
    }
    
    // Validate required fields
    if (!formData.title || formData.title.trim() === '') {
      alert('Please enter a title for the event.');
      return;
    }
    
    setSubmitting(true);
    try {
      // Map camelCase form data to snake_case database columns
      const insertData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        outcome: formData.outcome?.trim() || null,
        date: formData.date ? new Date(formData.date).toISOString() : null,
        location: formData.location?.trim() || null,
        type: formData.type || 'upcoming',
        video_urls: formData.videoUrls ? formData.videoUrls.filter(url => url.trim() !== '') : [],
        gallery_images: formData.galleryImages || [],
        documents: formData.documents || [],
        status: 'pending',
        created_at: new Date().toISOString(),
        created_by: currentUser?.email || 'anonymous',
      };

      console.log('Submitting event:', insertData);

      const { data, error } = await supabase
        .from('events')
        .insert(insertData)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        console.error('Supabase error:', error);
        throw error;
      }

      clearCache('events');

      setSubmitSuccess(true);
      setFormData({
        title: '',
        description: '',
        outcome: '',
        date: '',
        type: 'upcoming',
        location: '',
        videoUrls: [],
        galleryImages: [],
        documents: [],
      });

      // Refresh events list after successful submission
      setTimeout(async () => {
        try {
          const data = await fetchCollection('events', {});
          const sortedData = data.sort((a, b) => {
            const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date || 0);
            const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date || 0);
            return dateB - dateA;
          });
          
          setEvents(sortedData);
          
          const now = new Date();
          const upcoming = sortedData.filter(event => {
            // Upcoming events: type must be 'upcoming' and status should be 'published' or 'pending'
            if (event.type !== 'upcoming') return false;
            if (event.status && event.status !== 'published' && event.status !== 'pending') return false;
            // If date exists, it should be in the future (or today)
            if (event.date) {
              const eventDate = event.date?.toDate ? event.date.toDate() : new Date(event.date);
              // Set time to start of day for fair comparison
              const eventDateStart = new Date(eventDate.setHours(0, 0, 0, 0));
              const nowStart = new Date(now.setHours(0, 0, 0, 0));
              return eventDateStart >= nowStart;
            }
            // If no date, include it in upcoming
            return true;
          });
          const archived = sortedData.filter(event => {
            // Archived events: type must be 'archive'
            if (event.type === 'archive') return true;
            // If type is 'upcoming', don't include in archived
            if (event.type === 'upcoming') return false;
            // For other types or no type, check if date is in the past
            if (event.date) {
              const eventDate = event.date?.toDate ? event.date.toDate() : new Date(event.date);
              const eventDateStart = new Date(eventDate.setHours(0, 0, 0, 0));
              const nowStart = new Date(now.setHours(0, 0, 0, 0));
              return eventDateStart < nowStart;
            }
            return false;
          });
          
          setUpcomingEvents(upcoming);
          setArchivedEvents(archived);
        } catch (error) {
          console.error('Error refreshing events:', error);
        }
      }, 500);

      setTimeout(() => {
        setSubmitSuccess(false);
        setShowForm(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting event:', error);
      const errorMessage = error.message || 'Please try again.';
      alert(`Error submitting event: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchiveSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!archiveFormData.title || archiveFormData.title.trim() === '') {
      alert('Please enter a title for the archive event.');
      return;
    }
    
    setArchiveSubmitting(true);
    try {
      // Map camelCase form data to snake_case database columns
      const insertData = {
        title: archiveFormData.title.trim(),
        description: archiveFormData.description?.trim() || null,
        outcome: archiveFormData.outcome?.trim() || null,
        date: archiveFormData.date ? new Date(archiveFormData.date).toISOString() : null,
        location: archiveFormData.location?.trim() || null,
        type: archiveFormData.type || 'archive',
        video_urls: archiveFormData.videoUrls ? archiveFormData.videoUrls.filter(url => url.trim() !== '') : [],
        gallery_images: archiveFormData.galleryImages || [],
        documents: archiveFormData.documents || [],
        status: 'pending',
        created_at: new Date().toISOString(),
        created_by: currentUser?.email || 'anonymous',
      };

      console.log('Submitting archive event:', insertData);

      const { data, error } = await supabase
        .from('events')
        .insert(insertData)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      clearCache('events');

      setArchiveSubmitSuccess(true);
      setArchiveFormData({
        title: '',
        description: '',
        outcome: '',
        date: '',
        type: 'archive',
        location: '',
        videoUrls: [],
        galleryImages: [],
        documents: [],
      });

      setTimeout(() => {
        setArchiveSubmitSuccess(false);
        setShowArchiveForm(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting archive event:', error);
      const errorMessage = error.message || 'Please try again.';
      alert(`Error submitting archive event: ${errorMessage}`);
    } finally {
      setArchiveSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-undp-blue text-white py-6">
        <div className="section-container text-center">
          <Calendar className="mx-auto mb-2" size={32} />
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Events & Archive</h1>
          <p className="text-base max-w-3xl mx-auto">
            Stay updated with our upcoming events and explore our event archive
          </p>
        </div>
      </div>

      {/* Add Event Buttons - Admin Only */}
      {currentUser?.isAdmin && (
        <section className="section-container py-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => {
                if (requireAuth('add archive events')) {
                  setShowArchiveForm(true);
                  setShowForm(false); // Close other form if open
                }
              }}
              className={`btn-primary inline-flex items-center justify-center space-x-2 w-full sm:w-auto py-2.5 min-h-[44px] ${
                showArchiveForm ? 'bg-undp-dark-blue' : ''
              }`}
            >
              <Plus size={20} />
              <span>Add Archive Events</span>
            </button>
            <button
              onClick={() => {
                if (requireAuth('add a new event')) {
                  setShowForm(true);
                  setShowArchiveForm(false); // Close other form if open
                }
              }}
              className={`btn-primary inline-flex items-center justify-center space-x-2 w-full sm:w-auto py-2.5 min-h-[44px] ${
                showForm ? 'bg-undp-dark-blue' : ''
              }`}
            >
              <Plus size={20} />
              <span>Add New Events</span>
            </button>
          </div>
        </section>
      )}

      {/* Event Forms Section - Admin Only */}
      {currentUser?.isAdmin && (showForm || showArchiveForm) && (
        <section className="section-container py-8">
          {/* Submission Form for Archive Events */}
          {showArchiveForm && (
            <div className="max-w-3xl mx-auto card mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-undp-blue">Add Archive Events</h2>
                <button
                  onClick={() => {
                    setShowArchiveForm(false);
                    setArchiveFormData({
                      title: '',
                      description: '',
                      outcome: '',
                      date: '',
                      type: 'archive',
                      location: '',
                      videoUrls: [],
                      galleryImages: [],
                      documents: [],
                    });
                    setArchiveSubmitSuccess(false);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              {archiveSubmitSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 text-green-700">
                  <CheckCircle size={20} />
                  <span>Archive event submitted successfully! Awaiting admin approval.</span>
                </div>
              )}

              <form onSubmit={handleArchiveSubmit} className="space-y-4">
                <div>
                  <label htmlFor="archive-title" className="block text-sm font-semibold text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="archive-title"
                    type="text"
                    value={archiveFormData.title}
                    onChange={(e) => setArchiveFormData({ ...archiveFormData, title: e.target.value })}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base min-h-[44px]"
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <label htmlFor="archive-description" className="block text-sm font-semibold text-gray-700 mb-2">
                    Short Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="archive-description"
                    value={archiveFormData.description}
                    onChange={(e) => setArchiveFormData({ ...archiveFormData, description: e.target.value })}
                    required
                    rows="3"
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base min-h-[44px]"
                    placeholder="Enter short description..."
                  ></textarea>
                </div>

                <div>
                  <label htmlFor="archive-outcome" className="block text-sm font-semibold text-gray-700 mb-2">
                    Outcome <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="archive-outcome"
                    value={archiveFormData.outcome}
                    onChange={(e) => setArchiveFormData({ ...archiveFormData, outcome: e.target.value })}
                    required
                    rows="4"
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base min-h-[44px]"
                    placeholder="Describe the event outcome..."
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="archive-date" className="block text-sm font-semibold text-gray-700 mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="archive-date"
                      type="date"
                      value={archiveFormData.date}
                      onChange={(e) => setArchiveFormData({ ...archiveFormData, date: e.target.value })}
                      required
                      className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label htmlFor="archive-location" className="block text-sm font-semibold text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      id="archive-location"
                      type="text"
                      value={archiveFormData.location}
                      onChange={(e) => setArchiveFormData({ ...archiveFormData, location: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base min-h-[44px]"
                      placeholder="Enter location"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Videos (Multiple URLs)
                  </label>
                  <div className="space-y-2">
                    {archiveFormData.videoUrls.map((url, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => {
                            const newUrls = [...archiveFormData.videoUrls];
                            newUrls[index] = e.target.value;
                            setArchiveFormData({ ...archiveFormData, videoUrls: newUrls });
                          }}
                          className="flex-1 px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base min-h-[44px]"
                          placeholder="Enter video URL"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setArchiveFormData({
                              ...archiveFormData,
                              videoUrls: archiveFormData.videoUrls.filter((_, i) => i !== index),
                            });
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setArchiveFormData({ ...archiveFormData, videoUrls: [...archiveFormData.videoUrls, ''] })}
                      className="btn-secondary text-sm py-2 px-4 inline-flex items-center space-x-2"
                    >
                      <Plus size={16} />
                      <span>Add Video URL</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Images (Multiple Upload)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e, true)}
                    className="hidden"
                    id="archive-image-upload"
                  />
                  <label
                    htmlFor="archive-image-upload"
                    className="btn-secondary cursor-pointer inline-flex items-center space-x-2"
                  >
                    <ImageIcon size={18} />
                    <span>{archiveUploading ? 'Uploading...' : 'Upload Images'}</span>
                  </label>
                  {archiveFormData.galleryImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-4">
                      {archiveFormData.galleryImages.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-24 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setArchiveFormData({
                                ...archiveFormData,
                                galleryImages: archiveFormData.galleryImages.filter((_, i) => i !== index),
                              });
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Documents (PDF, Word, Excel, etc.)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    onChange={(e) => handleDocumentUpload(e, true)}
                    id="archive-document-upload"
                    className="hidden"
                  />
                  <label
                    htmlFor="archive-document-upload"
                    className="btn-secondary cursor-pointer inline-flex items-center space-x-2"
                  >
                    <FileText size={18} />
                    <span>{archiveUploading ? 'Uploading...' : 'Upload Documents'}</span>
                  </label>
                  {archiveFormData.documents.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {archiveFormData.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <FileText size={18} className="text-undp-blue flex-shrink-0" />
                            <span className="text-sm text-gray-700 truncate">{doc.name}</span>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              ({(doc.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setArchiveFormData({
                                ...archiveFormData,
                                documents: archiveFormData.documents.filter((_, i) => i !== index),
                              });
                            }}
                            className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowArchiveForm(false);
                      setArchiveFormData({
                        title: '',
                        description: '',
                        outcome: '',
                        date: '',
                        type: 'archive',
                        location: '',
                        videoUrls: [],
                        galleryImages: [],
                        documents: [],
                      });
                      setArchiveSubmitSuccess(false);
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={archiveSubmitting}>
                    {archiveSubmitting ? (
                      <span className="inline-flex items-center space-x-2">
                        <LoadingSpinner size="sm" />
                        <span>Submitting...</span>
                      </span>
                    ) : (
                      'Submit Archive Event'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Submission Form for New Events */}
          {showForm && (
            <div className="max-w-3xl mx-auto card mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-undp-blue">Add New Events</h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      title: '',
                      description: '',
                      outcome: '',
                      date: '',
                      type: 'upcoming',
                      location: '',
                      videoUrls: [],
                      galleryImages: [],
                      documents: [],
                    });
                    setSubmitSuccess(false);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              {submitSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 text-green-700">
                  <CheckCircle size={20} />
                  <span>Event submitted successfully! Awaiting admin approval.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title-new" className="block text-sm font-semibold text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title-new"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base min-h-[44px]"
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <label htmlFor="description-new" className="block text-sm font-semibold text-gray-700 mb-2">
                    Short Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description-new"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows="3"
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base min-h-[44px]"
                    placeholder="Enter short description..."
                  ></textarea>
                </div>

                <div>
                  <label htmlFor="outcome-new" className="block text-sm font-semibold text-gray-700 mb-2">
                    Outcome <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="outcome-new"
                    value={formData.outcome}
                    onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                    required
                    rows="4"
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base min-h-[44px]"
                    placeholder="Describe the event outcome..."
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date-new" className="block text-sm font-semibold text-gray-700 mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="date-new"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label htmlFor="location-new" className="block text-sm font-semibold text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      id="location-new"
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base min-h-[44px]"
                      placeholder="Enter location"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Videos (Multiple URLs)
                  </label>
                  <div className="space-y-2">
                    {formData.videoUrls.map((url, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => {
                            const newUrls = [...formData.videoUrls];
                            newUrls[index] = e.target.value;
                            setFormData({ ...formData, videoUrls: newUrls });
                          }}
                          className="flex-1 px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base min-h-[44px]"
                          placeholder="Enter video URL"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              videoUrls: formData.videoUrls.filter((_, i) => i !== index),
                            });
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, videoUrls: [...formData.videoUrls, ''] })}
                      className="btn-secondary text-sm py-2 px-4 inline-flex items-center space-x-2"
                    >
                      <Plus size={16} />
                      <span>Add Video URL</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Images (Multiple Upload)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e, false)}
                    className="hidden"
                    id="image-upload-new"
                  />
                  <label
                    htmlFor="image-upload-new"
                    className="btn-secondary cursor-pointer inline-flex items-center space-x-2"
                  >
                    <ImageIcon size={18} />
                    <span>{uploading ? 'Uploading...' : 'Upload Images'}</span>
                  </label>
                  {formData.galleryImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-4">
                      {formData.galleryImages.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-24 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                galleryImages: formData.galleryImages.filter((_, i) => i !== index),
                              });
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Documents (PDF, Word, Excel, etc.)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    onChange={(e) => handleDocumentUpload(e, false)}
                    id="document-upload-new"
                    className="hidden"
                  />
                  <label
                    htmlFor="document-upload-new"
                    className="btn-secondary cursor-pointer inline-flex items-center space-x-2"
                  >
                    <FileText size={18} />
                    <span>{uploading ? 'Uploading...' : 'Upload Documents'}</span>
                  </label>
                  {formData.documents.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <FileText size={18} className="text-undp-blue flex-shrink-0" />
                            <span className="text-sm text-gray-700 truncate">{doc.name}</span>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              ({(doc.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                documents: formData.documents.filter((_, i) => i !== index),
                              });
                            }}
                            className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({
                        title: '',
                        description: '',
                        outcome: '',
                        date: '',
                        type: 'upcoming',
                        location: '',
                        videoUrls: [],
                        galleryImages: [],
                        documents: [],
                      });
                      setSubmitSuccess(false);
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? (
                      <span className="inline-flex items-center space-x-2">
                        <LoadingSpinner size="sm" />
                        <span>Submitting...</span>
                      </span>
                    ) : (
                      'Submit Event'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      )}

      {/* Filter Buttons */}
      <section className="section-container py-8">
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <button
            type="button"
            onClick={() => {
              setEventView('upcoming');
            }}
            className={`px-6 py-3 rounded-full font-semibold transition-colors ${
              eventView === 'upcoming'
                ? 'bg-undp-blue text-white'
                : 'bg-undp-light-grey text-gray-700 hover:bg-gray-200'
            }`}
          >
            View Upcoming Events
          </button>
          <button
            type="button"
            onClick={() => {
              setEventView('archived');
            }}
            className={`px-6 py-3 rounded-full font-semibold transition-colors ${
              eventView === 'archived'
                ? 'bg-undp-blue text-white'
                : 'bg-undp-light-grey text-gray-700 hover:bg-gray-200'
            }`}
          >
            View Archived Events
          </button>
        </div>
      </section>

      {/* Upcoming Events */}
      {eventView === 'upcoming' && (upcomingEvents.length > 0 || loading) && (
        <section className="section-container py-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-undp-blue mb-6 sm:mb-8">Upcoming Event{upcomingEvents.length > 1 ? 's' : ''}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {loading && upcomingEvents.length === 0 ? (
              <SkeletonLoader type="card" count={3} />
            ) : upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => {
                const daysUntil = getDaysUntil(event.date);
                return (
                  <div key={event.id} className="card border-l-4 border-undp-blue">
                    {daysUntil !== null && daysUntil > 0 && (
                      <div className="mb-4">
                        <div className="bg-undp-blue text-white px-4 py-2 rounded-lg text-center">
                          <div className="text-2xl font-bold">{daysUntil}</div>
                          <div className="text-sm">Days Until Event</div>
                        </div>
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-undp-blue mb-2">{event.title}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar size={16} className="mr-2" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center text-gray-600">
                          <MapPin size={16} className="mr-2" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>
                    <Link
                      to={`/events/${event.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary w-full inline-flex items-center justify-center space-x-2"
                    >
                      <span>View Details</span>
                      <ExternalLink size={16} />
                    </Link>
                  </div>
                );
              })
            ) : null}
          </div>
        </section>
      )}

      {/* Archive Section */}
      <section className="bg-undp-light-grey py-12">
        <div className="section-container">

          {/* Archived Events List - Tree Format */}
          {eventView === 'archived' && (
            <>
              <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-undp-blue mb-4 sm:mb-0">Archived Events</h2>
                {availableYears.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={expandAllYears}
                      className="text-sm px-4 py-2 bg-undp-light-grey text-undp-blue rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Expand All
                    </button>
                    <button
                      onClick={collapseAllYears}
                      className="text-sm px-4 py-2 bg-undp-light-grey text-undp-blue rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Collapse All
                    </button>
                  </div>
                )}
              </div>
              
              {loading && archivedEvents.length === 0 ? (
                <SkeletonLoader type="card" count={6} />
              ) : availableYears.length > 0 ? (
                <div className="max-w-4xl mx-auto space-y-2">
                  {availableYears.map((year) => {
                    const yearEvents = archivedEventsByYear[year] || [];
                    const isExpanded = expandedYears.includes(year);
                    
                    return (
                      <div key={year} className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* Year Header - Clickable */}
                        <button
                          onClick={() => toggleYear(year)}
                          className="w-full px-6 py-4 flex items-center justify-between hover:bg-undp-light-grey transition-colors text-left"
                        >
                          <div className="flex items-center space-x-3">
                            {isExpanded ? (
                              <ChevronDown className="text-undp-blue" size={20} />
                            ) : (
                              <ChevronRight className="text-undp-blue" size={20} />
                            )}
                            <h3 className="text-xl font-bold text-undp-blue">
                              {year}
                            </h3>
                            <span className="text-sm text-gray-500 bg-undp-light-grey px-3 py-1 rounded-full">
                              {yearEvents.length} event{yearEvents.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </button>

                        {/* Year Events - Expandable */}
                        {isExpanded && (
                          <div className="border-t border-gray-200">
                            {yearEvents.length > 0 ? (
                              <div className="divide-y divide-gray-100">
                                {yearEvents.map((event, index) => (
                                  <div
                                    key={event.id}
                                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                                  >
                                    <div className="flex items-start space-x-4">
                                      {/* Event Number */}
                                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-undp-blue text-white flex items-center justify-center font-semibold text-sm">
                                        {index + 1}
                                      </div>
                                      
                                      {/* Event Content */}
                                      <div className="flex-1 min-w-0">
                                        <h4 className="text-lg font-semibold text-undp-blue mb-1">{event.title}</h4>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                                          <div className="flex items-center">
                                            <Calendar size={14} className="mr-1" />
                                            <span>{formatDate(event.date)}</span>
                                          </div>
                                          {event.location && (
                                            <div className="flex items-center">
                                              <MapPin size={14} className="mr-1" />
                                              <span>{event.location}</span>
                                            </div>
                                          )}
                                        </div>
                                        {event.description && (
                                          <p className="text-gray-600 text-sm line-clamp-2 mb-2">{event.description}</p>
                                        )}
                                        <Link
                                          to={`/events/${event.id}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="text-undp-blue hover:text-undp-dark-blue text-sm font-medium inline-flex items-center space-x-1 mt-2"
                                        >
                                          <span>View Details</span>
                                          <ExternalLink size={14} />
                                        </Link>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="px-6 py-4 text-center text-gray-500">
                                No events for {year}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No archived events found.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

    </div>
  );
};

export default Events;
