import { useState, useEffect } from 'react';
import { supportRequestsAPI } from '../../utils/api';
import { Briefcase, X, CheckCircle, ChevronRight, Loader2, ArrowRight } from 'lucide-react';

const SupportRequestForm = ({ isOpen, onClose, projects = [], currentUser, onSuccess }) => {
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        projectId: '',
        supportType: '',
        documentUrl: '',
        duration: '',
        impact: '',

    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Reset form when opened
            setFormData(prev => ({
                ...prev,
                title: '',
                projectId: '',
                supportType: '',
                duration: '',
                impact: '',
            }));
            setSubmitSuccess(false);
            setError('');
        }
    }, [isOpen, currentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const submissionData = {
                ...formData,
                projectId: formData.projectId || null,
                status: 'pending'
            };



            await supportRequestsAPI.create(submissionData);

            setSubmitSuccess(true);
            if (onSuccess) onSuccess();

            setTimeout(() => {
                setSubmitSuccess(false);
                onClose();
            }, 3000);

        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#003359]/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300 relative border border-gray-100 flex flex-col">

                {/* Modal Header */}
                <div className="sticky top-0 bg-white/95 backdrop-blur z-10 px-8 py-6 border-b border-gray-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Briefcase size={24} className="text-[#003359]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Request Support</h2>
                            <p className="text-sm text-gray-500">Submit your support requirement details</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all duration-300"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-8 flex-1 overflow-y-auto">
                    {submitSuccess && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 text-green-700 animate-in fade-in slide-in-from-top-4">
                            <div className="bg-green-100 p-2 rounded-full"><CheckCircle size={20} /></div>
                            <div>
                                <h4 className="font-bold">Success!</h4>
                                <p className="text-sm">Your request has been submitted successfully.</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium animate-in fade-in">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Title Input */}
                        <div className="space-y-2 group">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider group-focus-within:text-[#003359] transition-colors">Request Title *</label>
                            <div className="relative">
                                <input
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full pl-4 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#003359]/20 focus:border-[#003359] transition-all text-sm font-medium outline-none"
                                    placeholder="E.g. Technical assistance for migrating legacy systems"
                                />
                            </div>
                        </div>

                        {!currentUser && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 group">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider group-focus-within:text-[#003359] transition-colors">Your Name *</label>
                                    <input
                                        required
                                        value={formData.guestName}
                                        onChange={e => setFormData({ ...formData, guestName: e.target.value })}
                                        className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#003359]/20 focus:border-[#003359] transition-all text-sm font-medium outline-none"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider group-focus-within:text-[#003359] transition-colors">Email Address *</label>
                                    <input
                                        required
                                        type="email"
                                        value={formData.guestEmail}
                                        onChange={e => setFormData({ ...formData, guestEmail: e.target.value })}
                                        className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#003359]/20 focus:border-[#003359] transition-all text-sm font-medium outline-none"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Project Select */}
                            <div className="space-y-2 group">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider group-focus-within:text-[#003359] transition-colors">Related Project</label>
                                <div className="relative">
                                    <select
                                        value={formData.projectId}
                                        onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                                        className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#003359]/20 focus:border-[#003359] transition-all text-sm font-medium outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Project (Optional)</option>
                                        {projects
                                            .filter(p => !currentUser || currentUser.isAdmin || currentUser.assignedProjectIds?.includes(p.id))
                                            .map(p => (
                                                <option key={p.id} value={p.id}>{p.title}</option>
                                            ))}
                                    </select>
                                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            {/* Support Type Select */}
                            <div className="space-y-2 group">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider group-focus-within:text-[#003359] transition-colors">Support Type *</label>
                                <div className="relative">
                                    <select
                                        required
                                        value={formData.supportType}
                                        onChange={e => setFormData({ ...formData, supportType: e.target.value })}
                                        className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#003359]/20 focus:border-[#003359] transition-all text-sm font-medium outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Type...</option>
                                        <option value="Consultancy">Consultancy</option>
                                        <option value="Technical">Technical Support</option>
                                        <option value="Training">Training & Capacity</option>
                                        <option value="Funding">Funding Support</option>
                                    </select>
                                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            {/* Duration Input */}
                            <div className="space-y-2 group md:col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider group-focus-within:text-[#003359] transition-colors">Expected Timeline</label>
                                <input
                                    value={formData.duration}
                                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                    className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#003359]/20 focus:border-[#003359] transition-all text-sm font-medium outline-none"
                                    placeholder="E.g. 3 Months, Q1 2024"
                                />
                            </div>
                        </div>

                        {/* Description Textarea */}
                        <div className="space-y-2 group">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider group-focus-within:text-[#003359] transition-colors">Needs & Impact *</label>
                            <textarea
                                required
                                rows="4"
                                value={formData.impact}
                                onChange={e => setFormData({ ...formData, impact: e.target.value })}
                                className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#003359]/20 focus:border-[#003359] transition-all text-sm font-medium outline-none resize-none leading-relaxed"
                                placeholder="Describe your requirements, expected outcomes, and potential impact..."
                            />
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-50">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-[#003359] hover:bg-[#002845] text-white px-8 py-3 rounded-xl shadow-lg shadow-blue-900/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
                                <span className="font-bold">{submitting ? 'Submitting...' : 'Submit Request'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SupportRequestForm;
