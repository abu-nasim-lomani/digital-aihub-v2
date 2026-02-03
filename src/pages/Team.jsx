import { useEffect, useState } from 'react';
import { teamAPI } from '../utils/api';
import { Mail, Linkedin, Users } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Team = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const response = await teamAPI.getAll();
      const data = Array.isArray(response) ? response : (response.data || []);
      setTeam(data);
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 pb-24 relative overflow-hidden">
      {/* Original Header Preserved */}
      <div className="bg-[#003359] text-white pt-20 pb-32 relative overflow-hidden -mb-16">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#002845_25%,transparent_25%,transparent_75%,#002845_75%,#002845),linear-gradient(45deg,#002845_25%,transparent_25%,transparent_75%,#002845_75%,#002845)] bg-[length:20px_20px] opacity-[0.05]"></div>
        <div className="section-container relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold tracking-widest uppercase mb-4">
            Meet the Experts
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight">
            Our Team
          </h1>
          <p className="text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto">
            Dedicated professionals driving digital transformation and innovation across Bangladesh
          </p>
        </div>
      </div>

      <div className="section-container relative z-10 px-4 md:px-8">
        {/* Team Grid */}
        {team.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No team members found</h3>
            <p className="text-gray-500">Check back soon</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {team.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06)] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                      {member.section || 'Team'}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100 pb-4 mb-4">
                    {member.designation}
                  </p>
                </div>

                {/* Footer: Social Actions */}
                <div className="flex gap-3 pt-2">
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
                      title="Email"
                    >
                      <Mail size={18} />
                    </a>
                  )}
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-gray-400 hover:text-[#0077b5] hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
                      title="LinkedIn"
                    >
                      <Linkedin size={18} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Team;
