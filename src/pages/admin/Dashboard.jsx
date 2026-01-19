
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

import { supabase } from '../../supabase/config';
import {
  FileText, Lightbulb, BookOpen, Calendar,
  Users, Award, HelpCircle, Activity,
  ArrowUpRight, Clock, CheckCircle, TrendingUp
} from 'lucide-react';

import SkeletonLoader from '../../components/SkeletonLoader';


const Dashboard = () => {
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    projects: 0,
    initiatives: 0,
    learningModules: 0,
    events: 0,
    standards: 0,
    team: 0,
    supportRequests: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Counts
        const collections = ['projects', 'initiatives', 'learningModules', 'events', 'standards', 'team', 'support_requests'];
        const statsData = {};

        // Parallel fetch for speed
        await Promise.all(collections.map(async (col) => {
          const { count, error } = await supabase.from(col).select('*', { count: 'exact', head: true });
          if (!error) statsData[col] = count || 0;
        }));

        setStats({
          projects: statsData.projects || 0,
          initiatives: statsData.initiatives || 0,
          learningModules: statsData.learningModules || 0,
          events: statsData.events || 0,
          standards: statsData.standards || 0,
          team: statsData.team || 0,
          supportRequests: statsData.support_requests || 0,
        });

        // 2. Fetch Recent System Activity (e.g. latest 5 Initiatives)
        const { data: activityData } = await supabase
          .from('initiatives')
          .select('id, title, created_at, status, type')
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentActivity(activityData || []);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { label: 'Total Projects', count: stats.projects, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', link: '/admin/projects' },
    { label: 'Initiatives', count: stats.initiatives, icon: Lightbulb, color: 'text-amber-600', bg: 'bg-amber-50', link: '/admin/initiatives' },
    { label: 'Learning Modules', count: stats.learningModules, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/admin/learning' },
    { label: 'Events & News', count: stats.events, icon: Calendar, color: 'text-violet-600', bg: 'bg-violet-50', link: '/admin/events' },
    { label: 'Standards', count: stats.standards, icon: Award, color: 'text-rose-600', bg: 'bg-rose-50', link: '/admin/standards' },
    { label: 'Team Members', count: stats.team, icon: Users, color: 'text-cyan-600', bg: 'bg-cyan-50', link: '/admin/team' },
    { label: 'Support Requests', count: stats.supportRequests, icon: HelpCircle, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/admin/support-requests' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}


      {/* Main Content */}
      <div className="flex-1 p-8 lg:p-12 overflow-y-auto w-full">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, {currentUser?.email?.split('@')[0] || 'Admin'}. Here's what's happening.</p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 shadow-sm">
            <Calendar size={16} />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {loading ? (
            <SkeletonLoader count={4} type="card" />
          ) : (
            statCards.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Link
                  key={idx}
                  to={stat.link}
                  className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p - 3 rounded - xl ${stat.bg} ${stat.color} `}>
                      <Icon size={22} className="stroke-[2.5px]" />
                    </div>
                    <span className={`flex items - center text - xs font - bold ${stat.color} bg - white px - 2 py - 1 rounded - full shadow - sm`}>
                      <TrendingUp size={12} className="mr-1" /> +12%
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.count}</h3>
                  <p className="text-sm text-gray-500 font-medium group-hover:text-gray-900 transition-colors">{stat.label}</p>
                </Link>
              );
            })
          )}
        </div>

        {/* Main Content Split: Activity Log & Quick Stats */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* Recent Activity Feed */}
          <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Activity size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Recent Initiatives</h2>
              </div>
              <Link to="/admin/initiatives" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />)}
                </div>
              ) : recentActivity.length > 0 ? (
                recentActivity.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group cursor-default">
                    <div className="p-3 bg-gray-100 rounded-xl text-gray-500 group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-sm transition-all">
                      <Lightbulb size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 truncate">{item.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span className="bg-gray-200 px-2 py-0.5 rounded text-gray-700 font-medium">{item.type || 'General'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div>
                      <span className={`px - 3 py - 1 text - xs font - bold rounded - full border ${item.status === 'published'
                        ? 'bg-green-50 text-green-700 border-green-100'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                        } `}>
                        {item.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <p>No recent activity found.</p>
                </div>
              )}
            </div>
          </div>

          {/* System Status / Quick View */}
          <div className="bg-[#001f3f] rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-400" /> System Status
              </h2>

              <div className="space-y-6">
                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/5">
                  <div className="flex justify-between text-sm mb-2 opacity-80">
                    <span>Storage Usage</span>
                    <span>45%</span>
                  </div>
                  <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                    <div className="h-full w-[45%] bg-blue-400 rounded-full"></div>
                  </div>
                </div>

                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/5">
                  <div className="flex justify-between text-sm mb-2 opacity-80">
                    <span>Database Health</span>
                    <span className="text-green-400 font-bold">Good</span>
                  </div>
                  <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                    <div className="h-full w-[98%] bg-green-400 rounded-full"></div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 mt-6">
                  <p className="text-sm opacity-60 mb-4">Need help? Contact support.</p>
                  <Link to="/admin/support-requests" className="w-full block text-center py-3 bg-white text-[#001f3f] font-bold rounded-xl hover:bg-blue-50 transition-colors">
                    View Support Tickets
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
