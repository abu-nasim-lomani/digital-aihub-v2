import { useState, useEffect } from 'react';
import { Briefcase, X, CheckCircle, Loader } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { projectAssignmentAPI } from '../utils/api';
import api from '../utils/api';

const AssignProjectModal = ({ user, onClose, onSuccess }) => {
    const [projects, setProjects] = useState([]);
    const [assignedProjects, setAssignedProjects] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user.id]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch all projects
            const projectsResponse = await api.get('/projects');
            setProjects(projectsResponse.data || []);

            // Fetch user's assigned projects
            const assignedResponse = await projectAssignmentAPI.getUserProjects(user.id);
            const assigned = new Set(
                (assignedResponse.data.projects || []).map(p => p.id)
            );
            setAssignedProjects(assigned);
        } catch (err) {
            console.error('Fetch data error:', err);
            setError('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleProject = async (projectId) => {
        try {
            setSubmitting(true);
            setError('');

            const isAssigned = assignedProjects.has(projectId);

            if (isAssigned) {
                // Unassign
                await projectAssignmentAPI.unassign(user.id, projectId);
                setAssignedProjects(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(projectId);
                    return newSet;
                });
            } else {
                // Assign
                await projectAssignmentAPI.assign(user.id, projectId);
                setAssignedProjects(prev => new Set([...prev, projectId]));
            }
        } catch (err) {
            console.error('Toggle project error:', err);
            setError(err.response?.data?.error || 'Failed to update assignment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSave = () => {
        onSuccess();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Briefcase size={24} className="text-blue-600" />
                        Assign Projects - {user.fullName || user.name}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <div className="text-sm text-gray-600 mb-4">
                    <p>Select projects to assign to this user. Users can only create support requests for assigned projects.</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto space-y-2 mb-6">
                            {projects.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No projects available
                                </div>
                            ) : (
                                projects.map(project => {
                                    const isAssigned = assignedProjects.has(project.id);

                                    return (
                                        <div
                                            key={project.id}
                                            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${isAssigned
                                                ? 'border-blue-300 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            onClick={() => !submitting && handleToggleProject(project.id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5">
                                                    {isAssigned ? (
                                                        <CheckCircle size={20} className="text-blue-600" />
                                                    ) : (
                                                        <div className="w-5 h-5 rounded border-2 border-gray-300"></div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900">
                                                        {project.title}
                                                    </h3>
                                                    {project.description && (
                                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                            {project.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className={`text-xs px-2 py-1 rounded ${project.status === 'published'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-100 text-gray-600'
                                                            }`}>
                                                            {project.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                {submitting && (
                                                    <Loader size={18} className="animate-spin text-blue-600" />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="flex gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 btn-primary px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={18} />
                                Done
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AssignProjectModal;
