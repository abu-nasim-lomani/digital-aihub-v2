import { useEffect, useState } from 'react';
import { projectsAPI, uploadFile, settingsAPI } from '../../utils/api';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Save,
  Briefcase,
  CheckCircle,
  Clock,
  Upload
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

import { ArrowUp, ArrowDown } from 'lucide-react';

const ManageProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Reorder State
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [projectOrder, setProjectOrder] = useState([]);
  const [savingOrder, setSavingOrder] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    status: 'pending'
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      alert('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showReorderModal) {
      fetchProjectOrder();
    }
  }, [showReorderModal]);

  const fetchProjectOrder = async () => {
    try {
      const res = await settingsAPI.get('project_order');
      if (res.data && Array.isArray(res.data.value)) {
        setProjectOrder(res.data.value);
      } else {
        // Default order: by ID or creation (derived from current projects list)
        setProjectOrder(projects.map(p => p.id));
      }
    } catch (error) {
      console.error('Error fetching project order:', error);
      // Fallback
      setProjectOrder(projects.map(p => p.id));
    }
  };

  const handleMoveProject = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === projectOrder.length - 1)
    ) return;

    const newOrder = [...projectOrder];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];
    setProjectOrder(newOrder);
  };

  const saveProjectOrder = async () => {
    try {
      setSavingOrder(true);
      await settingsAPI.update('project_order', projectOrder);
      alert('Project order saved successfully!');
      setShowReorderModal(false);
      // Ideally refresh main list if it respects order, but for now we just save
    } catch (error) {
      console.error('Failed to save order:', error);
      alert('Failed to save order');
    } finally {
      setSavingOrder(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let payload = { ...formData };

      if (imageFile) {
        try {
          const uploadRes = await uploadFile(imageFile, 'projects');
          payload.imageUrl = uploadRes.url;
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          alert('Failed to upload image. Please try again.');
          return;
        }
      }

      if (editingProject) {
        await projectsAPI.update(editingProject.id, payload);
        alert('Project updated successfully!');
      } else {
        await projectsAPI.create(payload);
        alert('Project created successfully!');
      }

      resetForm();
      fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      imageUrl: project.imageUrl || '',
      status: project.status || 'pending'
    });
    setPreviewUrl(project.imageUrl || '');
    setImageFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await projectsAPI.delete(id);
      alert('Project deleted successfully!');
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      status: 'pending'
    });
    setEditingProject(null);
    setPreviewUrl('');
    setImageFile(null);
    setShowModal(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const filteredProjects = projects.filter(project =>
    project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Briefcase className="text-blue-600" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Manage Projects</h1>
                <p className="text-sm text-gray-500">{projects.length} total projects</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Add Project
            </button>
            <button
              onClick={() => setShowReorderModal(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 ml-3"
            >
              <ArrowUp size={18} className="transform rotate-45" /> {/* Generic sort icon proxy */}
              Reorder
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No projects found
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{project.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 line-clamp-2 max-w-md">
                          {project.description || 'No description'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${project.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {project.status === 'published' ? (
                            <><CheckCircle size={12} className="mr-1" /> Published</>
                          ) : (
                            <><Clock size={12} className="mr-1" /> Pending</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(project)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={resetForm}></div>

            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingProject ? 'Edit Project' : 'Add New Project'}
                </h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={200}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter project title"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 3 characters, maximum 200</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    rows="4"
                    required
                    minLength={10}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe the project in detail"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 10 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Image
                  </label>

                  <div className="flex gap-4 items-start">
                    {/* Preview */}
                    <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 relative group">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center text-gray-400">
                          <Upload size={20} />
                          <span className="text-[10px] mt-1">Upload</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-lg file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                      />

                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-sm">Or</span>
                        <input
                          type="url"
                          value={formData.imageUrl}
                          onChange={(e) => {
                            setFormData({ ...formData, imageUrl: e.target.value });
                            if (!imageFile) setPreviewUrl(e.target.value);
                          }}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Paste image URL here..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="published">Published</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Pending projects won't be visible to public</p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      <Save size={18} />
                    )}
                    {submitting ? 'Saving...' : (editingProject ? 'Update Project' : 'Create Project')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reorder Modal */}
      {showReorderModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowReorderModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Reorder Projects</h2>
                <button onClick={() => setShowReorderModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm text-blue-700">
                Use arrows to change the display order on the public website.
              </div>

              <div className="max-h-[60vh] overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-100">
                {projectOrder.map((id, index) => {
                  const project = projects.find(p => p.id === id);
                  if (!project) return null; // Skip if project deleted but in order list
                  return (
                    <div key={id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                      <div className="font-medium text-gray-800 line-clamp-1">{project.title}</div>
                      <div className="flex items-center gap-1">
                        <button
                          disabled={index === 0}
                          onClick={() => handleMoveProject(index, 'up')}
                          className={`p-1 rounded ${index === 0 ? 'text-gray-200' : 'text-gray-500 hover:bg-gray-200'}`}
                        >
                          <ArrowUp size={18} />
                        </button>
                        <button
                          disabled={index === projectOrder.length - 1}
                          onClick={() => handleMoveProject(index, 'down')}
                          className={`p-1 rounded ${index === projectOrder.length - 1 ? 'text-gray-200' : 'text-gray-500 hover:bg-gray-200'}`}
                        >
                          <ArrowDown size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {/* Append any new projects not yet in order list */}
                {projects.filter(p => !projectOrder.includes(p.id)).map(project => (
                  <div key={project.id} className="p-3 flex items-center justify-between border-t border-yellow-100 bg-yellow-50">
                    <div className="font-medium text-gray-800 line-clamp-1">{project.title} <span className="text-xs text-yellow-600">(New)</span></div>
                    <div className="text-xs text-gray-400 italic">Save to add to order</div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowReorderModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={saveProjectOrder}
                  disabled={savingOrder}
                  className="btn-primary flex items-center gap-2"
                >
                  {savingOrder && <LoadingSpinner size="sm" color="white" />}
                  Save Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProjects;
