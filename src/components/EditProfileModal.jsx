import { useState } from 'react';
import { Edit, Mail, User, Lock, X, CheckCircle, Shield } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { userAPI } from '../utils/api';

const EditProfileModal = ({ user, onClose, onSuccess, isAdminEditing = false }) => {
    const [formData, setFormData] = useState({
        fullName: user.fullName || user.name || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (formData.newPassword && formData.newPassword.length < 6) {
            setError('New password must be at least 6 characters');
            return;
        }

        // Only require current password if NOT admin editing
        if (!isAdminEditing && formData.newPassword && !formData.currentPassword) {
            setError('Current password is required to change password');
            return;
        }

        try {
            setLoading(true);

            // Prepare update data
            const updateData = {
                fullName: formData.fullName
            };

            // Add password fields
            if (formData.newPassword) {
                if (isAdminEditing) {
                    // Admin doesn't need current password
                    updateData.newPassword = formData.newPassword;
                } else {
                    // Regular user needs current password
                    updateData.currentPassword = formData.currentPassword;
                    updateData.newPassword = formData.newPassword;
                }
            }

            // Call appropriate API based on mode
            let response;
            if (isAdminEditing) {
                response = await userAPI.updateUser(user.id, updateData);
            } else {
                response = await userAPI.updateProfile(updateData);

                // Update localStorage with new user data (only for own profile)
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                const updatedUser = {
                    ...currentUser,
                    fullName: response.data.user.fullName
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }

            alert(isAdminEditing ? 'User updated successfully!' : 'Profile updated successfully!');
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Update error:', err);
            setError(err.response?.data?.error || 'Failed to update');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        {isAdminEditing ? (
                            <>
                                <Shield size={24} className="text-purple-600" />
                                Edit User (Admin)
                            </>
                        ) : (
                            <>
                                <Edit size={24} className="text-blue-600" />
                                Edit Profile
                            </>
                        )}
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

                {isAdminEditing && (
                    <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg text-purple-700 text-sm">
                        <Shield size={16} className="inline mr-2" />
                        You are editing as admin. Current password is not required.
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                placeholder="Your name"
                                required
                            />
                        </div>
                    </div>

                    {/* Email (Read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email <span className="text-gray-400 text-xs">(cannot be changed)</span>
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="email"
                                value={user.email}
                                disabled
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 pt-4">
                        <p className="text-sm font-medium text-gray-700 mb-3">
                            Change Password <span className="text-gray-400 font-normal">(optional)</span>
                        </p>
                    </div>

                    {/* Current Password - Only show if NOT admin editing */}
                    {!isAdminEditing && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Current Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                    placeholder="Enter current password"
                                />
                            </div>
                        </div>
                    )}

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="password"
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                placeholder="Min. 6 characters"
                                minLength={6}
                            />
                        </div>
                    </div>

                    {/* Confirm New Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                placeholder="Repeat new password"
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 btn-primary px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <LoadingSpinner size="sm" color="white" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={18} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
