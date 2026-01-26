import { useEffect, useState } from 'react';
import { teamAPI } from '../utils/api';
import { Mail, Linkedin, Twitter, Award, Users, Target } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Team = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState('all');

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const response = await teamAPI.getAll();
      setTeam(response.data);
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  };

  const sections = ['all', 'team', 'advisory'];

  const filteredTeam = team.filter(member => {
    if (selectedSection === 'all') return true;
    return member.section === selectedSection;
  });

  const getDefaultImage = (name) => {
    // Generate avatar based on name
    const initial = name?.charAt(0).toUpperCase() || 'A';
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
        {/* Section Filter */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {sections.map(section => (
            <button
              key={section}
              onClick={() => setSelectedSection(section)}
              className={`px-8 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all capitalize ${selectedSection === section
                  ? 'bg-white text-undp-blue shadow-lg border-b-2 border-undp-blue'
                  : 'text-gray-500 hover:bg-gray-100'
                }`}
            >
              {section === 'all' ? 'All Members' : section === 'team' ? 'Core Team' : 'Advisory Board'}
            </button>
          ))}
        </div>

        {/* Team Grid */}
        {filteredTeam.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No team members found</h3>
            <p className="text-gray-500">Check back soon</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredTeam.map((member) => (
              <div key={member.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                {/* Photo */}
                <div className="relative h-72 overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100">
                  <img
                    src={member.photoUrl || getDefaultImage(member.name)}
                    alt={member.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Social Links Overlay */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-lg"
                      >
                        <Mail size={18} />
                      </a>
                    )}
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-lg"
                      >
                        <Linkedin size={18} />
                      </a>
                    )}
                    {member.twitter && (
                      <a
                        href={member.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-lg"
                      >
                        <Twitter size={18} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {member.name}
                  </h3>

                  {member.designation && (
                    <p className="text-sm font-semibold text-blue-600 mb-3">
                      {member.designation}
                    </p>
                  )}

                  {member.bio && (
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                      {member.bio}
                    </p>
                  )}

                  {/* Section Badge */}
                  {member.section && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${member.section === 'team'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-purple-50 text-purple-700'
                        }`}>
                        {member.section === 'team' ? 'Core Team' : 'Advisory'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-blue-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{team.filter(m => m.section === 'team').length}+</h3>
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Core Team Members</p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
            <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="text-purple-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{team.filter(m => m.section === 'advisory').length}+</h3>
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Advisory Board</p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
            <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="text-green-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">100%</h3>
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Dedicated to Excellence</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-br from-[#003359] to-[#004d7a] rounded-3xl p-12 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2Mi1oMnYtMmgtMnptMC00djJoMnYtMmgtMnptMC00djJoMnYtMmgtMnptMC00djJoMnYtMmgtMnptMC00djJoMnYtMmgtMnptMC00djJoMnYtMmgtMnptMC00djJoMnYtMmgtMnptMC00djJoMnYtMmgtMnptMC00djJoMnYtMmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

          <div className="relative z-10">
            <Users size={48} className="mx-auto mb-4 text-blue-200" />
            <h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Be part of Bangladesh's digital transformation journey. We're always looking for talented individuals
            </p>
            <button className="bg-white text-[#003359] px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105">
              View Open Positions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
