import { useEffect, useState } from 'react';
import {
  projectsAPI,
  initiativesAPI,
  eventsAPI,
  learningAPI,
  standardsAPI,
  teamAPI,
  supportRequestsAPI
} from '../../utils/api';
import {
  LayoutDashboard,
  Briefcase,
  Lightbulb,
  Calendar,
  BookOpen,
  FileText,
  Users,
  HelpCircle,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    projects: { total: 0, published: 0, pending: 0 },
    initiatives: { total: 0, published: 0, pending: 0 },
    events: { total: 0, upcoming: 0, archive: 0 },
    learning: { total: 0, published: 0 },
    standards: { total: 0, dpi: 0, lgi: 0 },
    team: { total: 0, core: 0, advisory: 0 },
    supportRequests: { total: 0, pending: 0, approved: 0, declined: 0 }
  });

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [
        projectsRes,
        initiativesRes,
        eventsRes,
        learningRes,
        standardsRes,
        teamRes,
        supportRes
      ] = await Promise.all([
        projectsAPI.getAll(),
        initiativesAPI.getAll(),
        eventsAPI.getAll(),
        learningAPI.getAll(),
        standardsAPI.getAll(),
        teamAPI.getAll(),
        supportRequestsAPI.getAll()
      ]);

      // Calculate stats
      const projects = projectsRes.data;
      const initiatives = initiativesRes.data;
      const events = eventsRes.data;
      const learning = learningRes.data;
      const standards = standardsRes.data;
      const team = teamRes.data;
      const support = supportRes.data;

      setStats({
        projects: {
          total: projects.length,
          published: projects.filter(p => p.status === 'published').length,
          pending: projects.filter(p => p.status === 'pending').length
        },
        initiatives: {
          total: initiatives.length,
          published: initiatives.filter(i => i.status === 'published').length,
          pending: initiatives.filter(i => i.status === 'pending').length
        },
        events: {
          total: events.length,
          upcoming: events.filter(e => e.type === 'upcoming').length,
          archive: events.filter(e => e.type === 'archive').length
        },
        learning: {
          total: learning.length,
          published: learning.filter(l => l.status === 'published').length
        },
        standards: {
          total: standards.length,
          dpi: standards.filter(s => s.category === 'DPI').length,
          lgi: standards.filter(s => s.category === 'LGI').length
        },
        team: {
          total: team.length,
          core: team.filter(t => t.section === 'team').length,
          advisory: team.filter(t => t.section === 'advisory').length
        },
        supportRequests: {
          total: support.length,
          pending: support.filter(s => s.status === 'pending').length,
          approved: support.filter(s => s.status === 'approved').length,
          declined: support.filter(s => s.status === 'declined').length
        }
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Projects',
      total: stats.projects.total,
      subtitle: `${stats.projects.published} Published`,
      icon: Briefcase,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Initiatives',
      total: stats.initiatives.total,
      subtitle: `${stats.initiatives.published} Published`,
      icon: Lightbulb,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Events',
      total: stats.events.total,
      subtitle: `${stats.events.upcoming} Upcoming`,
      icon: Calendar,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Learning Modules',
      total: stats.learning.total,
      subtitle: `${stats.learning.published} Published`,
      icon: BookOpen,
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      title: 'Standards',
      total: stats.standards.total,
      subtitle: `${stats.standards.dpi} DPI, ${stats.standards.lgi} LGI`,
      icon: FileText,
      color: 'teal',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600'
    },
    {
      title: 'Team Members',
      total: stats.team.total,
      subtitle: `${stats.team.core} Core, ${stats.team.advisory} Advisory`,
      icon: Users,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600'
    }
  ];

  const supportCards = [
    {
      title: 'Total Requests',
      value: stats.supportRequests.total,
      icon: HelpCircle,
      color: 'bg-gray-100 text-gray-700'
    },
    {
      title: 'Pending',
      value: stats.supportRequests.pending,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-700'
    },
    {
      title: 'Approved',
      value: stats.supportRequests.approved,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-700'
    },
    {
      title: 'Declined',
      value: stats.supportRequests.declined,
      icon: XCircle,
      color: 'bg-red-100 text-red-700'
    }
  ];

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
          <div className="flex items-center gap-3">
            <div className="bg-undp-blue p-2 rounded-lg">
              <LayoutDashboard className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Overview of all content and statistics</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.total}</h3>
                  <p className="text-xs text-gray-500">{stat.subtitle}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <stat.icon className={stat.textColor} size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Support Requests Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <HelpCircle size={20} />
            Support Requests Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {supportCards.map((card, idx) => (
              <div key={idx} className={`${card.color} rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">{card.title}</p>
                  <card.icon size={18} />
                </div>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <a href="/admin/manage-projects" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
              <Briefcase className="text-blue-600 mb-2" size={24} />
              <h3 className="font-semibold text-gray-900">Manage Projects</h3>
              <p className="text-sm text-gray-500">Add, edit, or delete projects</p>
            </a>
            <a href="/admin/manage-initiatives" className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all">
              <Lightbulb className="text-purple-600 mb-2" size={24} />
              <h3 className="font-semibold text-gray-900">Manage Initiatives</h3>
              <p className="text-sm text-gray-500">Update initiative content</p>
            </a>
            <a href="/admin/manage-support-requests" className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all">
              <HelpCircle className="text-green-600 mb-2" size={24} />
              <h3 className="font-semibold text-gray-900">Support Requests</h3>
              <p className="text-sm text-gray-500">Review pending requests</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
