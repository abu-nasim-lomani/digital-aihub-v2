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

  const getDefaultImage = (name) => {
    // Generate avatar based on name
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=400&background=003359&color=fff&bold=true`;
  };

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
      <div className="bg-[#003359] text-white pt-20 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#002845_25%,transparent_25%,transparent_75%,#002845_75%,#002845),linear-gradient(45deg,#002845_25%,transparent_25%,transparent_75%,#002845_75%,#002845)] bg-[length:20px_20px] opacity-[0.05]"></div>

        <div className="section-container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
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
      </div>

      <div className="section-container py-12">
        {/* Team Grid */}
        {team.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No team members found</h3>
            <p className="text-gray-500">Check back soon</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {team.map((member) => (
              <div key={member.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                {/* Photo */}
                <div className="relative h-72 overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100">
                  <img
                    src={member.photoUrl || getDefaultImage(member.name)}
                    alt={member.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#003359] via-transparent to-transparent opacity-60"></div>

                  {/* Overlay Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-blue-300 text-xs font-bold tracking-widest uppercase mb-1">{member.section}</p>
                    <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                    <p className="text-sm text-gray-200 opacity-90">{member.designation}</p>

                    {/* Social Links shown on hover */}
                    <div className="flex gap-4 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="text-white hover:text-blue-300 transition-colors">
                          <Mail size={18} />
                        </a>
                      )}
                      {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-300 transition-colors">
                          <Linkedin size={18} />
                        </a>
                      )}
                    </div>
                  </div>
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
