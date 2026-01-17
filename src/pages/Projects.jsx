import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/config';
import { fetchCollection } from '../utils/supabaseHelpers';
import { getCachedData } from '../utils/cache';
import { useAuth } from '../contexts/AuthContext';

import { Download, FileText, Plus, X, CheckCircle, Upload, ChevronDown, ChevronRight, ExternalLink, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import SkeletonLoader from '../components/SkeletonLoader';
import Modal from '../components/Modal';

const Projects = () => {
  const { currentUser } = useAuth();

  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [expandedYears, setExpandedYears] = useState([]); // Track expanded years in tree view
  const [loading, setLoading] = useState(true);

  const [showSupportRequestForm, setShowSupportRequestForm] = useState(false);

  const [submittingSupportRequest, setSubmittingSupportRequest] = useState(false);

  const [uploadingSupportRequest, setUploadingSupportRequest] = useState(false);

  const [supportRequestSuccess, setSupportRequestSuccess] = useState(false);

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    actionLabel: null,
    onAction: null
  });

  const showModal = ({ title, message, type = 'info', actionLabel = null, onAction = null }) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type,
      actionLabel,
      onAction
    });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const [supportRequestData, setSupportRequestData] = useState({
    title: '',
    projectId: '',
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
    } catch {
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

  // Dynamic years generation
  const currentYear = new Date().getFullYear();
  const minYear = 2023; // Project start year
  const requiredYears = Array.from(
    { length: currentYear - minYear + 1 },
    (_, i) => currentYear - i
  );

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

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      showModal({
        title: 'File Too Large',
        message: 'Please upload a file smaller than 10MB.',
        type: 'error'
      });
      return null;
    }

    try {
      const filePath = `projects/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading document:', error);
      showModal({
        title: 'Upload Failed',
        message: error.message || 'Please try again',
        type: 'error'
      });
      return null;
    }
  };



  const handleSupportRequestFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!currentUser) {
      showModal({
        title: 'Authentication Required',
        message: 'You need to be logged in to upload files.',
        type: 'warning'
      });
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
      showModal({
        title: 'Authentication Required',
        message: 'You need to be logged in to submit a support request. Would you like to login now?',
        type: 'info',
        actionLabel: 'Log In',
        onAction: () => {
          const currentPath = window.location.pathname;
          navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
          closeModal();
        }
      });
      return;
    }

    setSubmittingSupportRequest(true);

    try {
      const insertData = {
        title: supportRequestData.title,
        project_id: supportRequestData.projectId || null,
        support_type: supportRequestData.supportType || null,
        document_url: supportRequestData.documentUrl || null,
        duration: supportRequestData.duration || null,
        impact: supportRequestData.impact || null,
        status: 'pending',
        created_at: new Date().toISOString(),
        created_by: currentUser?.email || 'anonymous',
      };

      const { error } = await supabase
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
        projectId: '',
        supportType: '',
        documentUrl: '',
        duration: '',
        impact: '',
      });

      setShowSupportRequestForm(false);
      showModal({
        title: 'Request Submitted!',
        message: 'Your support request has been submitted successfully. An admin will review it shortly.',
        type: 'success'
      });

    } catch (error) {
      console.error('Error submitting support request:', error);
      showModal({
        title: 'Submission Failed',
        message: `Error: ${error.message || error.details || 'Unknown error occurred'}`,
        type: 'error'
      });
    } finally {
      setSubmittingSupportRequest(false);
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

      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        actionLabel={modalConfig.actionLabel}
        onAction={modalConfig.onAction}
      />

      <div className="section-container py-12">
        {/* Support Request Form - Visible to all users except admins */}
        <div className="mb-8">
          {!showSupportRequestForm ? (
            <div className="text-center">
              <button
                onClick={() => {
                  if (!currentUser) {
                    showModal({
                      title: 'Authentication Required',
                      message: 'You need to be logged in to submit a support request. Would you like to login now?',
                      type: 'info',
                      actionLabel: 'Log In',
                      onAction: () => {
                        const currentPath = window.location.pathname;
                        navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
                        closeModal();
                      }
                    });
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
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Submit Support Request</h2>
                  <p className="text-gray-500 mt-1">Tell us how we can help you with your project</p>
                </div>
                <button
                  onClick={() => {
                    setShowSupportRequestForm(false);
                    setSupportRequestData({
                      title: '',
                      projectId: '',
                      supportType: '',
                      documentUrl: '',
                      duration: '',
                      impact: '',
                    });
                    setSupportRequestSuccess(false);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                  aria-label="Close form"
                >
                  <X size={24} />
                </button>
              </div>

              {supportRequestSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3 text-green-700">
                  <CheckCircle size={24} />
                  <span className="font-medium">Support request submitted successfully! Awaiting admin approval.</span>
                </div>
              )}

              <form onSubmit={handleSupportRequestSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="supportRequestProject" className="text-sm font-semibold text-gray-700 block">Related Project (Optional)</label>
                  <select
                    id="supportRequestProject"
                    value={supportRequestData.projectId}
                    onChange={(e) => setSupportRequestData({ ...supportRequestData, projectId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-undp-blue/20 focus:border-undp-blue outline-none transition-all appearance-none"
                  >
                    <option value="">Select a Project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="supportRequestTitle" className="text-sm font-semibold text-gray-700 block">Request Title <span className="text-red-500">*</span></label>
                    <input
                      id="supportRequestTitle"
                      type="text"
                      value={supportRequestData.title}
                      onChange={(e) => setSupportRequestData({ ...supportRequestData, title: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-undp-blue/20 focus:border-undp-blue outline-none transition-all"
                      placeholder="e.g. Technical Consultation for AI"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="supportRequestType" className="text-sm font-semibold text-gray-700 block">Support Type <span className="text-red-500">*</span></label>
                    <select
                      id="supportRequestType"
                      value={supportRequestData.supportType}
                      onChange={(e) => setSupportRequestData({ ...supportRequestData, supportType: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-undp-blue/20 focus:border-undp-blue outline-none transition-all appearance-none"
                    >
                      <option value="">Select Type</option>
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
                </div>

                <div className="space-y-2">
                  <label htmlFor="supportRequestImpact" className="text-sm font-semibold text-gray-700 block">Description & Impact <span className="text-red-500">*</span></label>
                  <textarea
                    id="supportRequestImpact"
                    value={supportRequestData.impact}
                    onChange={(e) => setSupportRequestData({ ...supportRequestData, impact: e.target.value })}
                    required
                    rows="4"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-undp-blue/20 focus:border-undp-blue outline-none transition-all"
                    placeholder="Describe your needs and expected outcomes..."
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="supportRequestDuration" className="text-sm font-semibold text-gray-700 block">Duration</label>
                    <input
                      id="supportRequestDuration"
                      type="text"
                      value={supportRequestData.duration}
                      onChange={(e) => setSupportRequestData({ ...supportRequestData, duration: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-undp-blue/20 focus:border-undp-blue outline-none transition-all"
                      placeholder="e.g. 3 months"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="supportRequestDocument" className="text-sm font-semibold text-gray-700 block">Attachment (Optional)</label>
                    <div className="relative group">
                      <input
                        id="supportRequestDocument"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleSupportRequestFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full px-4 py-3 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-gray-500 flex items-center gap-3 group-hover:bg-gray-100 transition-all group-hover:border-undp-blue/50">
                        <div className="bg-white p-1.5 rounded-md shadow-sm border border-gray-100 text-undp-blue">
                          <Upload size={16} />
                        </div>
                        <span className="truncate text-sm font-medium">{supportRequestData.documentUrl ? 'File Selected' : 'Click to upload (PDF, DOC)'}</span>
                      </div>
                    </div>
                    {supportRequestData.documentUrl && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-green-600 bg-green-50 w-fit px-3 py-1 rounded-full border border-green-100">
                        <CheckCircle size={14} />
                        <span>Document ready</span>
                        <button type="button" onClick={() => setSupportRequestData({ ...supportRequestData, documentUrl: '' })} className="ml-2 text-red-500 hover:text-red-700 font-bold">×</button>
                      </div>
                    )}
                    {uploadingSupportRequest && <p className="text-xs text-blue-600 mt-1 animate-pulse">Uploading...</p>}
                  </div>
                </div>

                <div className="flex justify-end pt-6 gap-3 border-t border-gray-100 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSupportRequestForm(false);
                      setSupportRequestData({
                        title: '',
                        projectId: '',
                        supportType: '',
                        documentUrl: '',
                        duration: '',
                        impact: '',
                      });
                      setSupportRequestSuccess(false);
                    }}
                    className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors focus:ring-2 focus:ring-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingSupportRequest || uploadingSupportRequest}
                    className="px-8 py-2.5 bg-undp-blue text-white rounded-lg hover:bg-blue-800 font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus:ring-2 focus:ring-offset-2 focus:ring-undp-blue"
                  >
                    {submittingSupportRequest ? (
                      <>
                        <LoadingSpinner size="sm" color="white" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Request</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>




        {/* Expand/Collapse All */}
        <div className="flex justify-end mb-4 space-x-4">
          <button
            onClick={expandAllYears}
            className="text-sm text-undp-blue hover:text-blue-800 font-semibold"
          >
            Expand All
          </button>
          <button
            onClick={collapseAllYears}
            className="text-sm text-undp-blue hover:text-blue-800 font-semibold"
          >
            Collapse All
          </button>
        </div>

        {/* Projects List Tree View */}
        {loading ? (
          <div className="space-y-4">
            <SkeletonLoader type="list-item" />
            <SkeletonLoader type="list-item" />
            <SkeletonLoader type="list-item" />
          </div>
        ) : (
          <div className="space-y-4">
            {availableYears.length > 0 ? (
              availableYears.map((year) => {
                const yearProjects = projectsByYear[year] || [];
                const isExpanded = expandedYears.includes(year);

                return (

                  <div key={year} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div
                      onClick={() => toggleYear(year)}
                      className="flex items-center justify-between px-6 py-5 bg-white cursor-pointer hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                          <ChevronRight className="text-gray-400 group-hover:text-undp-blue transition-colors" size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 group-hover:text-undp-blue transition-colors">{year}</h2>
                      </div>
                      <span className="bg-gray-100 text-gray-600 py-1.5 px-4 rounded-full text-sm font-semibold group-hover:bg-blue-50 group-hover:text-undp-blue transition-colors">
                        {yearProjects.length} Projects
                      </span>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-gray-100">
                        {yearProjects.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8 bg-gray-50/50">
                            {yearProjects.map((project) => (
                              <div key={project.id} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full group transform hover:-translate-y-1">
                                <div className="p-6 flex-grow">
                                  <span className="inline-block px-3 py-1 bg-blue-50 text-undp-blue text-xs font-semibold rounded-full mb-3 hidden">
                                    Project
                                  </span>

                                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-undp-blue transition-colors">
                                    {project.title}
                                  </h3>

                                  <div className="flex items-center text-sm text-gray-500 mb-4 bg-gray-50 px-3 py-1.5 rounded-lg w-fit hidden">
                                    <span className="font-semibold mr-2">Duration:</span> {project.duration || 'Ongoing'}
                                  </div>

                                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                                    {project.impact}
                                  </p>
                                </div>

                                <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between">
                                  {project.document_url ? (
                                    <a
                                      href={project.document_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-gray-600 hover:text-undp-blue text-sm font-semibold flex items-center space-x-2 transition-colors"
                                    >
                                      <div className="p-1.5 bg-gray-100 rounded-full group-hover:bg-blue-100 transition-colors">
                                        <Download size={14} />
                                      </div>
                                      <span>Download</span>
                                    </a>
                                  ) : (
                                    <span className="text-gray-400 text-sm flex items-center space-x-2 cursor-not-allowed opacity-60">
                                      <FileText size={16} />
                                      <span>No Doc</span>
                                    </span>
                                  )}

                                  <Link
                                    to={`/projects/${project.id}`}
                                    className="text-undp-blue hover:text-blue-800 text-sm font-bold flex items-center space-x-1 transition-colors group/link"
                                  >
                                    <span>Details</span>
                                    <ArrowRight size={16} className="transform group-hover/link:translate-x-1 transition-transform" />
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="px-6 py-12 text-center text-gray-500 bg-gray-50">
                            <p className="text-lg font-medium">No projects found for {year}</p>
                            <p className="text-sm">Check back later for updates.</p>
                          </div>
                        )}
                      </div>
                    )
                    }
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No projects found. Check back soon!</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div >
  );
};

export default Projects;
