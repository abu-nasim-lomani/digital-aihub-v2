import { useEffect, useState } from 'react';
import { fetchCollection } from '../utils/supabaseHelpers';
import { Mail, Linkedin, User, MessageSquare } from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';

const Team = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [advisoryMembers, setAdvisoryMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Demo Team Members
  const demoTeamMembers = [
    {
      id: 'team-1',
      name: 'Sheela Tasneem Haq',
      designation: 'Senior Governance Specialist',
      photoUrl: '',
    },
    {
      id: 'team-2',
      name: 'Dr. Forhad Zahid Shaikh',
      designation: 'E-Governance Specialist',
      photoUrl: '',
    },
    {
      id: 'team-3',
      name: 'Engr. Md. Hafijur Rahman',
      designation: 'Technology Analyst',
      photoUrl: '',
    },
    {
      id: 'team-4',
      name: 'A.K. Sabbir Mahbub',
      designation: 'Consultant',
      photoUrl: '',
    },
  ];

  // Demo Advisory Members
  const demoAdvisoryMembers = [
    {
      id: 'advisory-1',
      name: 'Prof. Maria Rodriguez',
      designation: 'Advisory Board Chair - Digital Governance',
      photoUrl: 'https://i.pravatar.cc/150?img=60',
    },
    {
      id: 'advisory-2',
      name: 'Dr. Ahmed Hassan',
      designation: 'Senior Advisor - Public Sector Innovation',
      photoUrl: 'https://i.pravatar.cc/150?img=51',
    },
    {
      id: 'advisory-3',
      name: 'Dr. Emily Watson',
      designation: 'Strategic Advisor - AI Ethics & Policy',
      photoUrl: 'https://i.pravatar.cc/150?img=20',
    },
    {
      id: 'advisory-4',
      name: 'Prof. Kenji Tanaka',
      designation: 'Technical Advisor - Digital Infrastructure',
      photoUrl: 'https://i.pravatar.cc/150?img=11',
    },
  ];

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const data = await fetchCollection('team', {});
        // Separate team and advisory members based on a type field, or use all as team
        const fetchedTeam = data.filter(m => !m.type || m.type === 'team');
        const fetchedAdvisory = data.filter(m => m.type === 'advisory');
        
        // Combine with demo data
        setTeamMembers([...demoTeamMembers, ...fetchedTeam]);
        setAdvisoryMembers([...demoAdvisoryMembers, ...fetchedAdvisory]);
      } catch (error) {
        console.error('Error fetching team:', error);
        // If fetch fails, show demo data
        setTeamMembers(demoTeamMembers);
        setAdvisoryMembers(demoAdvisoryMembers);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-undp-blue text-white py-6">
        <div className="section-container text-center">
          <User className="mx-auto mb-2" size={32} />
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Team & Advisory</h1>
          <p className="text-base max-w-3xl mx-auto">
            Meet our dedicated team of digital transformation experts and advisors
          </p>
        </div>
      </div>

      <div className="section-container py-12">
        {/* Message Section */}
        <section className="mb-16">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-undp-blue rounded-lg flex items-center justify-center">
              <MessageSquare className="text-white" size={24} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-undp-blue">Message</h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="card bg-gradient-to-br from-undp-light-grey to-white p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                <div className="flex-shrink-0">
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzmekLN0RLLu70esAjL7PFsjMhGp0ba9cPOQ&s"
                    alt="Stefan Liller"
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-undp-blue mx-auto md:mx-0"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-undp-blue mb-2">
                    Stefan Liller
                  </h3>
                  <p className="text-lg text-gray-700 mb-4 font-semibold">
                    Resident Representative
                  </p>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Welcome to the UNDP Digital & AI Hub. As we navigate an era of unprecedented technological transformation, digital innovation has become central to achieving sustainable development goals and creating lasting impact in communities across Bangladesh.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Our Digital & AI Hub represents UNDP's commitment to harnessing the power of technology for people-centered development. Through strategic initiatives, capacity building, and innovative solutions, we are working to ensure that digital transformation serves humanity and contributes to a more equitable, sustainable future.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      I am proud of our dedicated team of experts who are driving this transformation forward. Together, we are building digital public infrastructure, fostering innovation, and empowering communities to thrive in the digital age. Thank you for joining us on this journey.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Message Section - Sonali Dayaratne */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="card bg-gradient-to-br from-white to-undp-light-grey p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-undp-blue mx-auto md:mx-0 overflow-hidden">
                    <img
                      src="https://www.undp.org/sites/g/files/zskgke326/files/styles/bio_card_medium/public/2023-08/undp_bd_drr_new_01.jpg?h=5d4d2577&itok=WgG6Depq"
                      alt="Sonali Dayaratne"
                      className="w-full h-full object-cover"
                      style={{ objectPosition: '50% 0%' }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-undp-blue mb-2">
                    Sonali Dayaratne
                  </h3>
                  <p className="text-lg text-gray-700 mb-4 font-semibold">
                    Deputy Resident Representative
                  </p>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      In today's rapidly evolving digital landscape, the UNDP Digital & AI Hub stands as a beacon of innovation and collaboration. Our mission extends beyond technology adoption—we are building bridges between digital solutions and sustainable development outcomes that truly matter to the people we serve.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      As Deputy Resident Representative, I am inspired by the transformative potential of our initiatives. From capacity building programs that empower local communities to innovative projects that leverage artificial intelligence for social good, we are creating pathways for inclusive digital transformation across Bangladesh.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      The success of our Digital & AI Hub lies in the collaborative spirit of our team and partners. Together, we are ensuring that digital innovation becomes a powerful tool for advancing the Sustainable Development Goals, leaving no one behind in our journey toward a more connected, empowered, and resilient future.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Advisory Section */}
        <section className="mb-16">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-undp-dark-blue rounded-lg flex items-center justify-center">
              <User className="text-white" size={24} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-undp-blue">Advisory</h2>
          </div>
          {advisoryMembers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {advisoryMembers.map((member) => (
                <div
                  key={member.id}
                  className="card text-center group hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative mb-4">
                    <div className="w-32 h-32 rounded-full mx-auto bg-undp-light-grey flex items-center justify-center border-4 border-undp-light-grey group-hover:border-undp-dark-blue transition-colors">
                      <User size={48} className="text-gray-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-undp-blue mb-2">{member.name}</h3>
                  <p className="text-gray-600 mb-4">{member.designation}</p>
                  
                  {/* Hover reveal contact info */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-y-2">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="flex items-center justify-center space-x-2 text-gray-600 hover:text-undp-blue transition-colors"
                      >
                        <Mail size={16} />
                        <span className="text-sm">Email</span>
                      </a>
                    )}
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center space-x-2 text-gray-600 hover:text-undp-blue transition-colors"
                      >
                        <Linkedin size={16} />
                        <span className="text-sm">LinkedIn</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No advisory members available. Check back soon!</p>
            </div>
          )}
        </section>

        {/* Team Section */}
        <section className="bg-undp-light-grey py-12 rounded-lg">
          <div className="px-8">
            <div className="flex items-center space-x-3 mb-6 sm:mb-8">
              <div className="w-12 h-12 bg-undp-blue rounded-lg flex items-center justify-center">
                <User className="text-white" size={24} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-undp-blue">Team</h2>
            </div>
            {loading && teamMembers.length === 0 ? (
              <SkeletonLoader type="team" count={6} />
            ) : teamMembers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="card text-center group hover:shadow-xl transition-all duration-300 bg-white"
                  >
                    <div className="relative mb-4">
                      <div className="w-32 h-32 rounded-full mx-auto bg-undp-light-grey flex items-center justify-center border-4 border-undp-light-grey group-hover:border-undp-blue transition-colors">
                        <User size={48} className="text-gray-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-undp-blue mb-2">{member.name}</h3>
                    <p className="text-gray-600 mb-4">{member.designation}</p>
                    
                    {/* Hover reveal contact info */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-y-2">
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="flex items-center justify-center space-x-2 text-gray-600 hover:text-undp-blue transition-colors"
                        >
                          <Mail size={16} />
                          <span className="text-sm">Email</span>
                        </a>
                      )}
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center space-x-2 text-gray-600 hover:text-undp-blue transition-colors"
                        >
                          <Linkedin size={16} />
                          <span className="text-sm">LinkedIn</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No team members available. Check back soon!</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Team;
