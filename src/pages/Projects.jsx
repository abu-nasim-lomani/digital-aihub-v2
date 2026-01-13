import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/config';
import { fetchCollection } from '../utils/supabaseHelpers';
import { clearCache, getCachedData } from '../utils/cache';
import { useAuth } from '../contexts/AuthContext';
import { useRequireAuth } from '../utils/requireAuth';
import { Download, FileText, Plus, X, CheckCircle, Upload, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import SkeletonLoader from '../components/SkeletonLoader';

const Projects = () => {
  const { currentUser } = useAuth();
  const { requireAuth } = useRequireAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [expandedYears, setExpandedYears] = useState([]); // Track expanded years in tree view
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSupportRequestForm, setShowSupportRequestForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittingSupportRequest, setSubmittingSupportRequest] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingSupportRequest, setUploadingSupportRequest] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [supportRequestSuccess, setSupportRequestSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    supportType: '',
    documentUrl: '',
    duration: '',
    impact: '',
  });
  const [supportRequestData, setSupportRequestData] = useState({
    title: '',
    supportType: '',
    documentUrl: '',
    duration: '',
    impact: '',
  });

  const fetchProjects = async () => {
    try {
      const data = await fetchCollection('projects', { status: 'published' });
      // Map snake_case to camelCase for display
      const mappedData = data.map(proj => ({
        ...proj,
        supportType: proj.support_type || proj.supportType,
        documentUrl: proj.document_url || proj.documentUrl,
      }));
      setProjects(mappedData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check cache synchronously first for instant display
    const cacheKey = `projects_${JSON.stringify({ status: 'published' })}_all`;
    const cached = getCachedData(cacheKey, true);
    
    if (cached) {
      // Map snake_case to camelCase for display
      const mappedCached = cached.map(proj => ({
        ...proj,
        supportType: proj.support_type || proj.supportType,
        documentUrl: proj.document_url || proj.documentUrl,
      }));
      setProjects(mappedCached);
      setLoading(false);
    }
    
    fetchProjects();
  }, []);

  // Extract year from created_at and group projects by year
  const getYearFromDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.getFullYear();
    } catch (error) {
      return null;
    }
  };

  // Group projects by year
  const projectsByYear = projects.reduce((acc, proj) => {
    const year = getYearFromDate(proj.created_at);
    if (year) {
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(proj);
    }
    return acc;
  }, {});

  // Always include these years: 2026, 2025, 2024, 2023
  const requiredYears = [2026, 2025, 2024, 2023];
  
  // Get years from projects
  const yearsFromProjects = Object.keys(projectsByYear)
    .map(Number)
    .sort((a, b) => b - a); // Descending order
  
  // Combine required years with years from projects, remove duplicates, and sort descending
  const availableYears = [...new Set([...requiredYears, ...yearsFromProjects])]
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

  // Expand first year by default when projects are loaded
  useEffect(() => {
    if (availableYears.length > 0 && expandedYears.length === 0 && !loading) {
      setExpandedYears([availableYears[0]]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.length, loading]);

  const handleDocumentUpload = async (file) => {
    if (!file) return null;
    setUploading(true);
    try {
      const filePath = `projects/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading document:', error);
      alert(`Upload failed: ${error.message || 'Please try again'}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!requireAuth('upload files')) {
      e.target.value = '';
      return;
    }
    
    const url = await handleDocumentUpload(file);
    if (url) {
      setFormData({ ...formData, documentUrl: url });
    }
  };

  const handleSupportRequestFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!currentUser) {
      alert('Please log in to upload files.');
      e.target.value = '';
      return;
    }
    
    setUploadingSupportRequest(true);
    try {
      const url = await handleDocumentUpload(file);
      if (url) {
        setSupportRequestData({ ...supportRequestData, documentUrl: url });
      }
    } finally {
      setUploadingSupportRequest(false);
    }
  };

  const handleSupportRequestSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      const shouldProceed = window.confirm('You need to be logged in to submit a support request. Would you like to login now?');
      if (shouldProceed) {
        const currentPath = window.location.pathname;
        navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      }
      return;
    }
    
    setSubmittingSupportRequest(true);

    try {
      const insertData = {
        title: supportRequestData.title,
        support_type: supportRequestData.supportType || null,
        document_url: supportRequestData.documentUrl || null,
        duration: supportRequestData.duration || null,
        impact: supportRequestData.impact || null,
        status: 'pending',
        created_at: new Date().toISOString(),
        created_by: currentUser?.email || 'anonymous',
      };

      const { data, error } = await supabase
        .from('support_requests')
        .insert(insertData)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      setSupportRequestSuccess(true);
      setSupportRequestData({
        title: '',
        supportType: '',
        documentUrl: '',
        duration: '',
        impact: '',
      });

      setTimeout(() => {
        setSupportRequestSuccess(false);
        setShowSupportRequestForm(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting support request:', error);
      alert('Error submitting support request. Please try again.');
    } finally {
      setSubmittingSupportRequest(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!requireAuth('submit a project')) {
      return;
    }
    
    setSubmitting(true);

    try {
      // Map camelCase form data to snake_case database columns
      const insertData = {
        title: formData.title,
        support_type: formData.supportType || null,
        document_url: formData.documentUrl || null,
        duration: formData.duration || null,
        impact: formData.impact || null,
        status: 'pending', // Admin will need to approve
        created_at: new Date().toISOString(),
        created_by: currentUser?.email || 'anonymous',
      };

      const { data, error } = await supabase
        .from('projects')
        .insert(insertData)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Clear cache so new data is fetched
      clearCache('projects');

      setSubmitSuccess(true);
      setFormData({
        title: '',
        supportType: '',
        documentUrl: '',
        duration: '',
        impact: '',
      });

      setTimeout(() => {
        setSubmitSuccess(false);
        setShowForm(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting project:', error);
      alert('Error submitting project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-undp-blue text-white py-6">
        <div className="section-container text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Projects & Supports</h1>
          <p className="text-base max-w-3xl mx-auto">
            Explore our portfolio of digital transformation projects and support initiatives
          </p>
        </div>
      </div>

      <div className="section-container py-12">
        {/* Support Request Form - Visible to all users except admins */}
        {!currentUser?.isAdmin && (
          <div className="mb-8">
            {!showSupportRequestForm ? (
              <div className="text-center">
                <button
                  onClick={() => {
                    if (!currentUser) {
                      const shouldProceed = window.confirm('You need to be logged in to submit a support request. Would you like to login now?');
                      if (shouldProceed) {
                        const currentPath = window.location.pathname;
                        navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
                      }
                    } else {
                      setShowSupportRequestForm(true);
                    }
                  }}
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <Plus size={20} />
                  <span>Support Request</span>
                </button>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-undp-blue">Support Request</h2>
                  <button
                    onClick={() => {
                      setShowSupportRequestForm(false);
                      setSupportRequestData({
                        title: '',
                        supportType: '',
                        documentUrl: '',
                        duration: '',
                        impact: '',
                      });
                      setSupportRequestSuccess(false);
                    }}
                    className="text-gray-500 hover:text-gray-700 p-1"
                    aria-label="Close form"
                  >
                    <X size={24} />
                  </button>
                </div>

                {supportRequestSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 text-green-700">
                    <CheckCircle size={20} />
                    <span>Support request submitted successfully! Awaiting admin approval.</span>
                  </div>
                )}

                <form onSubmit={handleSupportRequestSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="supportRequestTitle" className="block text-sm font-semibold text-gray-700 mb-2">
                      Request Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="supportRequestTitle"
                      type="text"
                      value={supportRequestData.title}
                      onChange={(e) => setSupportRequestData({ ...supportRequestData, title: e.target.value })}
                      required
                      className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base min-h-[44px]"
                      placeholder="Enter support request title"
                    />
                  </div>

                  <div>
                    <label htmlFor="supportRequestType" className="block text-sm font-semibold text-gray-700 mb-2">
                      Support Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="supportRequestType"
                      value={supportRequestData.supportType}
                      onChange={(e) => setSupportRequestData({ ...supportRequestData, supportType: e.target.value })}
                      required
                      className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base min-h-[44px]"
                    >
                      <option value="">Select Support Type</option>
                      <option value="Architecture Development">Architecture Development</option>
                      <option value="Consultancy">Consultancy</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Capacity Building">Capacity Building</option>
                      <option value="Training">Training</option>
                      <option value="Research & Development">Research & Development</option>
                      <option value="Implementation">Implementation</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="supportRequestDuration" className="block text-sm font-semibold text-gray-700 mb-2">
                      Expected Duration <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="supportRequestDuration"
                      type="text"
                      value={supportRequestData.duration}
                      onChange={(e) => setSupportRequestData({ ...supportRequestData, duration: e.target.value })}
                      required
                      className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base min-h-[44px]"
                      placeholder="e.g., 6 months, 1 year, Q1 2024 - Q2 2024"
                    />
                  </div>

                  <div>
                    <label htmlFor="supportRequestImpact" className="block text-sm font-semibold text-gray-700 mb-2">
                      Description/Impact <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="supportRequestImpact"
                      value={supportRequestData.impact}
                      onChange={(e) => setSupportRequestData({ ...supportRequestData, impact: e.target.value })}
                      required
                      rows="4"
                      className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base min-h-[44px]"
                      placeholder="Describe your support request and expected impact..."
                    ></textarea>
                  </div>

                  <div>
                    <label htmlFor="supportRequestDocument" className="block text-sm font-semibold text-gray-700 mb-2">
                      Supporting Documents (Optional)
                    </label>
                    <input
                      id="supportRequestDocument"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleSupportRequestFileChange}
                      className="w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-undp-light-grey file:text-undp-blue
                        hover:file:bg-gray-200"
                    />
                    {uploadingSupportRequest && <p className="text-sm text-gray-500 mt-2">Uploading document...</p>}
                    {supportRequestData.documentUrl && (
                      <div className="mt-4 flex items-center space-x-2">
                        <FileText size={20} className="text-undp-blue" />
                        <span className="text-sm text-gray-700">Document uploaded successfully</span>
                        <button
                          type="button"
                          onClick={() => setSupportRequestData({ ...supportRequestData, documentUrl: '' })}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSupportRequestForm(false);
                        setSupportRequestData({
                          title: '',
                          supportType: '',
                          documentUrl: '',
                          duration: '',
                          impact: '',
                        });
                        setSupportRequestSuccess(false);
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingSupportRequest || uploadingSupportRequest}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {submittingSupportRequest ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>Submit Support Request</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Submit Project Form - Admin Only */}
        {currentUser?.isAdmin && (
          <div className="mb-8">
            {!showForm ? (
              <div className="text-center">
                <button
                  onClick={() => {
                    if (requireAuth('submit a new project')) {
                      setShowForm(true);
                    }
                  }}
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <Plus size={20} />
                  <span>Submit New Project</span>
                </button>
              </div>
            ) : (
            <div className="max-w-3xl mx-auto card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-undp-blue">Submit New Project</h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      title: '',
                      supportType: '',
                      documentUrl: '',
                      duration: '',
                      impact: '',
                    });
                    setSubmitSuccess(false);
                  }}
                  className="text-gray-500 hover:text-gray-700 p-1"
                  aria-label="Close form"
                >
                  <X size={24} />
                </button>
              </div>

              {submitSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 text-green-700">
                  <CheckCircle size={20} />
                  <span>Project submitted successfully! Awaiting admin approval.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base min-h-[44px]"
                    placeholder="Enter project name"
                  />
                </div>

                <div>
                  <label htmlFor="supportType" className="block text-sm font-semibold text-gray-700 mb-2">
                    Support Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="supportType"
                    value={formData.supportType}
                    onChange={(e) => setFormData({ ...formData, supportType: e.target.value })}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base min-h-[44px]"
                  >
                    <option value="">Select Support Type</option>
                    <option value="Architecture Development">Architecture Development</option>
                    <option value="Consultancy">Consultancy</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Capacity Building">Capacity Building</option>
                    <option value="Training">Training</option>
                    <option value="Research & Development">Research & Development</option>
                    <option value="Implementation">Implementation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-semibold text-gray-700 mb-2">
                    Project Duration <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="duration"
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base min-h-[44px]"
                    placeholder="e.g., 6 months, 1 year, Q1 2024 - Q2 2024"
                  />
                </div>

                <div>
                  <label htmlFor="impact" className="block text-sm font-semibold text-gray-700 mb-2">
                    Impact <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="impact"
                    value={formData.impact}
                    onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                    required
                    rows="4"
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-undp-blue focus:border-transparent text-base min-h-[44px]"
                    placeholder="Describe the impact and outcomes of this project..."
                  ></textarea>
                </div>

                <div>
                  <label htmlFor="document" className="block text-sm font-semibold text-gray-700 mb-2">
                    Project Details (Documents)
                  </label>
                  <input
                    id="document"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-undp-light-grey file:text-undp-blue
                      hover:file:bg-gray-200"
                  />
                  {uploading && <p className="text-sm text-gray-500 mt-2">Uploading document...</p>}
                  {formData.documentUrl && (
                    <div className="mt-4 flex items-center space-x-2">
                      <FileText size={20} className="text-undp-blue" />
                      <span className="text-sm text-gray-700">Document uploaded successfully</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, documentUrl: '' })}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({
                        title: '',
                        supportType: '',
                        documentUrl: '',
                        duration: '',
                        impact: '',
                      });
                      setSubmitSuccess(false);
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploading}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Project</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
          </div>
        )}

        {/* Projects Tree Format */}
        <div className="flex flex-col sm:flex-row items-center justify-end mb-6">
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

        {loading && projects.length === 0 ? (
          <SkeletonLoader type="card" count={6} />
        ) : availableYears.length > 0 ? (
          <div className="max-w-4xl mx-auto space-y-2">
            {availableYears.map((year) => {
              const yearProjects = projectsByYear[year] || [];
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
                        {yearProjects.length} project{yearProjects.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </button>

                  {/* Year Projects - Expandable */}
                  {isExpanded && (
                    <div className="border-t border-gray-200">
                      {yearProjects.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {yearProjects.map((project, index) => (
                            <div
                              key={project.id}
                              className="px-6 py-4 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-start space-x-4">
                                {/* Project Number */}
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-undp-blue text-white flex items-center justify-center font-semibold text-sm">
                                  {index + 1}
                                </div>
                                
                                {/* Project Content */}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-lg font-semibold text-undp-blue mb-1">{project.title}</h4>
                                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                                    {project.supportType && (
                                      <span className="inline-block bg-undp-blue text-white px-2 py-1 rounded-full text-xs">
                                        {project.supportType}
                                      </span>
                                    )}
                                    {project.duration && (
                                      <span className="text-gray-600">
                                        <strong>Duration:</strong> {project.duration}
                                      </span>
                                    )}
                                  </div>
                                  {project.impact && (
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">{project.impact}</p>
                                  )}
                                  <Link
                                    to={`/projects/${project.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
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
                          No projects for {year}
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
            <p className="text-gray-500 text-lg">No projects found. Check back soon!</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Projects;
