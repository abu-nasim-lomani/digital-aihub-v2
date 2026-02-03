import { useEffect, useState } from 'react';
import { userAPI } from '../../utils/api';
import { Users, UserPlus, Trash2, Shield, User as UserIcon, Search, Calendar, Mail, CheckCircle, Clock, Edit, Briefcase } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import EditProfileModal from '../../components/EditProfileModal';
import AssignProjectModal from '../../components/AssignProjectModal';

const ManageUsers = () => {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all'); // all, active, pending
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [assigningUser, setAssigningUser] = useState(null);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user'
    });
    const [submitting, setSubmitting] = useState(false);

    // Get current user from localStorage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [users, searchTerm, roleFilter, statusFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userAPI.list();
            setUsers(response.data.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = [...users];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Role filter
        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        // Status filter
        if (statusFilter === 'active') {
            filtered = filtered.filter(user => user.isActive);
        } else if (statusFilter === 'pending') {
            filtered = filtered.filter(user => !user.isActive);
        }

        setFilteredUsers(filtered);
    };

    const handleAddUser = async (e) => {
        e.preventDefault();

        // Validation
        if (!newUser.name || !newUser.email || !newUser.password) {
            alert('Please fill in all fields');
            return;
        }

        if (newUser.password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        try {
            setSubmitting(true);
            await userAPI.create(newUser);
            alert('User created successfully!');
            setShowAddModal(false);
            setNewUser({ name: '', email: '', password: '', role: 'user' });
            fetchUsers();
        } catch (error) {
            console.error('Error creating user:', error);
            alert(error.response?.data?.error || 'Failed to create user');
        } finally {
            setSubmitting(false);
        }
    };

    const handleApproveUser = async (userId, userName) => {
        if (!confirm(`Approve user "${userName}"?`)) {
            return;
        }

        try {
            await userAPI.approve(userId);
            alert('User approved successfully!');
            fetchUsers();
        } catch (error) {
            console.error('Error approving user:', error);
            alert(error.response?.data?.error || 'Failed to approve user');
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (userId === currentUser.id) {
            alert('You cannot delete your own account');
            return;
        }

        if (!confirm(`Are you sure you want to delete user "${userName}"?`)) {
            return;
        }

        try {
            await userAPI.delete(userId);
            alert('User deleted successfully!');
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert(error.response?.data?.error || 'Failed to delete user');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Count stats
    const stats = {
        total: users.length,
        active: users.filter(u => u.isActive).length,
        pending: users.filter(u => !u.isActive).length
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <Users size={28} />
                            </div>
                            User Management
                        </h1>
                        <p className="text-gray-500 mt-2 ml-14">
                            Manage system users and permissions
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg shadow-blue-500/30"
                    >
                        <UserPlus size={20} />
                        Add User
                    </button>
                </div>

                {/* Status Tabs */}
                <div className="flex gap-3 mb-6">
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === 'all'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        All Users ({stats.total})
                    </button>
                    <button
                        onClick={() => setStatusFilter('active')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === 'active'
                            ? 'bg-green-600 text-white shadow-lg'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Active ({stats.active})
                    </button>
                    <button
                        onClick={() => setStatusFilter('pending')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === 'pending'
                            ? 'bg-yellow-600 text-white shadow-lg'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Pending ({stats.pending})
                    </button>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">Admin Only</option>
                                <option value="user">Users Only</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                        Showing {filteredUsers.length} of {users.length} users
                    </div>
                </div>

                {/* User List */}
                <div className="space-y-4">
                    {filteredUsers.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                            <Users size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">No users found</p>
                        </div>
                    ) : (
                        filteredUsers.map((user) => {
                            const isCurrentUser = user.id === currentUser.id;
                            const isAdmin = user.role === 'admin';
                            const isPending = !user.isActive;

                            return (
                                <div
                                    key={user.id}
                                    className={`bg-white rounded-2xl shadow-sm border-2 p-6 transition-all hover:shadow-md ${isCurrentUser ? 'border-blue-300 ring-2 ring-blue-100' :
                                        isPending ? 'border-yellow-200 bg-yellow-50/30' : 'border-gray-100'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4 flex-1">
                                            {/* Avatar */}
                                            <div className={`p-3 rounded-full ${isPending ? 'bg-yellow-100 text-yellow-600' :
                                                isAdmin ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {isPending ? <Clock size={24} /> :
                                                    isAdmin ? <Shield size={24} /> : <UserIcon size={24} />}
                                            </div>

                                            {/* User Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <h3 className="text-lg font-bold text-gray-900">
                                                        {user.name}
                                                    </h3>
                                                    {isCurrentUser && (
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                                            You
                                                        </span>
                                                    )}
                                                    {isAdmin && (
                                                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                                                            Admin
                                                        </span>
                                                    )}
                                                    {isPending && (
                                                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                                                            Pending Approval
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                                                    <div className="flex items-center gap-1">
                                                        <Mail size={14} />
                                                        {user.email}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        Joined {formatDate(user.createdAt)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            {isPending && (
                                                <button
                                                    onClick={() => handleApproveUser(user.id, user.name)}
                                                    className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-all"
                                                    title="Approve user"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                            )}
                                            {!isPending && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setEditingUser(user);
                                                            setShowEditModal(true);
                                                        }}
                                                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
                                                        title="Edit profile"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setAssigningUser(user);
                                                            setShowAssignModal(true);
                                                        }}
                                                        className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-all"
                                                        title="Assign projects"
                                                    >
                                                        <Briefcase size={18} />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleDeleteUser(user.id, user.name)}
                                                disabled={isCurrentUser}
                                                className={`p-2 rounded-lg transition-all ${isCurrentUser
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                                                    }`}
                                                title={isCurrentUser ? 'Cannot delete yourself' : 'Delete user'}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <UserPlus size={24} className="text-blue-600" />
                            Add New User
                        </h2>

                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                    placeholder="Min. 6 characters"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role
                                </label>
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setNewUser({ name: '', email: '', password: '', role: 'user' });
                                    }}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 btn-primary px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <LoadingSpinner size="sm" color="white" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus size={18} />
                                            Create User
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {/* Edit Profile Modal */}
            {showEditModal && editingUser && (
                <EditProfileModal
                    user={editingUser}
                    isAdminEditing={true}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingUser(null);
                    }}
                    onSuccess={fetchUsers}
                />
            )}

            {/* Assign Projects Modal */}
            {showAssignModal && assigningUser && (
                <AssignProjectModal
                    user={assigningUser}
                    onClose={() => {
                        setShowAssignModal(false);
                        setAssigningUser(null);
                    }}
                    onSuccess={fetchUsers}
                />
            )}
        </div>
    );
};

export default ManageUsers;
