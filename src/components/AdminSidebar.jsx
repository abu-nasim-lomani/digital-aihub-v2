import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Lightbulb,
    BookOpen,
    Calendar,
    Award,
    Users,
    HelpCircle,
    LogOut,
    Settings,
    Layout,
    ExternalLink,
    Handshake
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminSidebar = () => {
    const location = useLocation();
    const { logout } = useAuth();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
        { icon: FileText, label: 'Projects', path: '/admin/projects' },
        { icon: Lightbulb, label: 'Initiatives', path: '/admin/initiatives' },
        { icon: BookOpen, label: 'Learning Modules', path: '/admin/learning' },
        { icon: Calendar, label: 'Events & News', path: '/admin/events' },
        { icon: Award, label: 'Standards', path: '/admin/standards' },
        { icon: Handshake, label: 'Partners', path: '/admin/partners' },
        { icon: Users, label: 'Team Members', path: '/admin/team' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: HelpCircle, label: 'Support Requests', path: '/admin/support-requests' },
        { icon: Layout, label: 'Home Content', path: '/admin/home-content' },
        { icon: Settings, label: 'Visibility', path: '/admin/settings' },
    ];

    const handleLogout = async () => {
        try {
            await logout();
            window.location.href = '/';
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <aside className="hidden lg:flex flex-col w-72 bg-[#001f3f] text-white min-h-[calc(100vh-80px)] top-20 sticky rounded-r-3xl overflow-hidden shadow-2xl border-r border-[#003359]">
            {/* Header */}
            <div className="p-8 border-b border-white/10">
                <div className="flex items-center gap-3 text-blue-300 mb-1">
                    <Settings className="animate-spin-slow" size={20} />
                    <span className="text-xs font-bold uppercase tracking-widest">Admin Panel</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                    <h2 className="text-xl font-bold tracking-tight text-white">Console</h2>
                    <Link to="/" target="_blank" rel="noopener noreferrer" className="p-2 -mr-2 text-blue-300/50 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Open Frontend in New Tab">
                        <ExternalLink size={20} />
                    </Link>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mb-2">Manage</div>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${active
                                ? 'bg-blue-600 shadow-lg shadow-blue-900/50 text-white font-bold'
                                : 'text-blue-100/70 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Icon size={20} className={active ? 'text-white' : 'text-blue-300 group-hover:text-white'} />
                            <span>{item.label}</span>
                            {active && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                        </Link>
                    )
                })}
            </div>

            {/* User / Logout */}
            <div className="p-4 border-t border-white/10 bg-black/20">
                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all font-bold text-sm"
                >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
