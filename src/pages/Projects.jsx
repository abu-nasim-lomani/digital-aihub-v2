import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/config';
import { fetchCollection } from '../utils/supabaseHelpers';
import { clearCache, getCachedData } from '../utils/cache';
import { useAuth } from '../contexts/AuthContext';
import { useRequireAuth } from '../utils/requireAuth';
import { Download, FileText, Plus, X, CheckCircle, Upload } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import SkeletonLoader from '../components/SkeletonLoader';

const Projects = () => {
  const { currentUser } = useAuth();
  const { requireAuth } = useRequireAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
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

  // Filter projects by selected year
  const filteredProjects = selectedYear 
    ? (projectsByYear[selectedYear] || [])
    : [];

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

        {/* Year Selection Prompt */}
        {!selectedYear && availableYears.length > 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">Select a year to view projects</p>
            <div className="flex flex-wrap justify-center gap-4">
              {availableYears.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className="px-8 py-3 rounded-lg font-semibold bg-undp-blue text-white hover:bg-undp-dark-blue transition-colors text-lg"
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Projects List by Year */}
        {selectedYear && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-undp-blue">Projects for {selectedYear}</h2>
              <button
                onClick={() => setSelectedYear(null)}
                className="btn-secondary"
              >
                Clear Selection
              </button>
            </div>
            
            {loading && filteredProjects.length === 0 ? (
              <SkeletonLoader type="card" count={6} />
            ) : filteredProjects.length > 0 ? (
              <div className="space-y-4">
                {filteredProjects.map((project, index) => (
                  <div
                    key={project.id}
                    className="card group cursor-pointer hover:shadow-lg transition-shadow duration-200"
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Serial Number */}
                      <div className="flex-shrink-0 flex items-center justify-center md:items-start">
                        <div className="w-12 h-12 rounded-full bg-undp-blue text-white flex items-center justify-center font-bold text-lg">
                          {index + 1}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-undp-blue mb-2">{project.title}</h3>
                        <div className="mb-2">
                          <span className="inline-block bg-undp-blue text-white px-3 py-1 rounded-full text-sm">
                            {project.supportType}
                          </span>
                        </div>
                        {project.duration && (
                          <div className="text-gray-600 mb-2">
                            <strong>Duration:</strong> {project.duration}
                          </div>
                        )}
                        {project.impact && (
                          <p className="text-gray-600 mb-4">{project.impact}</p>
                        )}
                        
                        <a
                          href={`/projects/${project.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="btn-primary inline-flex items-center space-x-2 mt-4"
                        >
                          <FileText size={18} />
                          <span>View Details</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No projects found for {selectedYear}.</p>
              </div>
            )}
          </div>
        )}

        {/* Show message if no years available */}
        {!loading && availableYears.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No projects found. Check back soon!</p>
          </div>
        )}
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-undp-blue pr-2">{selectedProject.title}</h2>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl flex-shrink-0"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Project Name</h3>
                <p className="text-gray-800 text-lg">{selectedProject.title}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Support Type</h3>
                <span className="inline-block bg-undp-blue text-white px-3 py-1 rounded-full text-sm font-medium">
                  {selectedProject.supportType || selectedProject.support_type}
                </span>
              </div>
              
              {selectedProject.duration && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Project Duration</h3>
                  <p className="text-gray-600">{selectedProject.duration}</p>
                </div>
              )}
              
              {selectedProject.impact && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Impact</h3>
                  <p className="text-gray-600 whitespace-pre-line">{selectedProject.impact}</p>
                </div>
              )}
              
              {(selectedProject.documentUrl || selectedProject.document_url) && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Project Details (Documents)</h3>
                  <a
                    href={selectedProject.documentUrl || selectedProject.document_url}
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
      )}
    </div>
  );
};

export default Projects;
