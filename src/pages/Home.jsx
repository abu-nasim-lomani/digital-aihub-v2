import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { ArrowRight, Target, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { settingsAPI, partnerAPI } from '../utils/api';
import FeaturedPartnerCard from '../components/FeaturedPartnerCard';
import PartnerCard from '../components/PartnerCard';

const Home = () => {
  const [heroSlides] = useState([
    {
      id: 1,
      title: 'Enablers for designing people-centered digital transformation',
      subtitle: 'Empowering communities through innovative digital solutions',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=75',
    },
    {
      id: 2,
      title: 'Building Digital Capacity',
      subtitle: 'Transforming organizations for the digital age',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=75',
    },
    {
      id: 3,
      title: 'Innovation for Development',
      subtitle: 'Leveraging AI and technology for sustainable development',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=75',
    },
  ]);

  const [showInitiatives, setShowInitiatives] = useState(false);

  const [partners, setPartners] = useState({ featured: [], all: [] });
  const [partnerCategory, setPartnerCategory] = useState('Government');

  const [homeContent, setHomeContent] = useState({
    main_tag: '',
    main_title: 'hello',
    main_desc: '',
    mission_title: 'Our Mission', // Fixed title as requested earlier
    mission_desc: '',
    vision_title: 'Our Purpose', // Fixed title as requested earlier
    vision_desc: '',
    mission_image: ''
  });

  useEffect(() => {
    // ... Existing useEffect fetching logic
    const fetchSettings = async () => {
      try {
        // Fetch visibility
        const res = await settingsAPI.get('initiative_visibility');
        if (res.data && res.data.value !== undefined) {
          setShowInitiatives(res.data.value);
        }

        // Fetch Home Content
        const keys = ['main_tag', 'main_title', 'main_desc', 'mission_title', 'mission_desc', 'vision_title', 'vision_desc', 'mission_image'];
        const promises = keys.map(key => settingsAPI.get(key).catch(err => {
          console.error(`Error fetching ${key}:`, err);
          return { data: { value: undefined } };
        }));
        const results = await Promise.all(promises);

        setHomeContent(prev => {
          const newContent = { ...prev };
          let hasCustomContent = false;

          keys.forEach((key, index) => {
            const val = results[index].data?.value;
            console.log(`Fetched ${key}:`, val); // Debug log
            if (val !== undefined && val !== null && val !== true) {
              newContent[key] = val;
              hasCustomContent = true;
            }
          });

          return hasCustomContent ? newContent : prev;
        });

      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    const fetchPartners = async () => {
      try {
        const [featuredRes, allRes] = await Promise.all([
          partnerAPI.getFeatured(),
          partnerAPI.getAll()
        ]);
        setPartners({
          featured: featuredRes.data.partners || [],
          all: allRes.data.partners || []
        });
      } catch (error) {
        console.error('Error fetching partners:', error);
      }
    };

    fetchSettings();
    fetchPartners();
  }, []);

  return (
    <div className="min-h-screen">
      {/* DEBUG MARKER - To confirm code update */}
      <div className="bg-red-600 text-white text-center py-2 font-bold select-all">
        CODE VERSION 884 - IF YOU SEE THIS, THE FRONTEND IS UPDATED
      </div>

      {/* Hero Section with Swiper */}
      <section className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px]">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          navigation={true}
          className="h-full"
          loading="lazy"
          onSwiper={(swiper) => {
            window.homeHeroSwiper = swiper;
          }}
        >
          {heroSlides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div
                className="relative h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="absolute inset-0 bg-undp-blue opacity-70"></div>
                <div className="relative z-10 h-full flex items-center justify-center text-center text-white px-4 sm:px-6">
                  <div className="max-w-4xl">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4">{slide.title}</h1>
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8">{slide.subtitle}</p>
                    {showInitiatives && (
                      <Link to="/initiatives" className="btn-primary inline-flex items-center justify-center space-x-2 py-2.5 sm:py-3 px-4 sm:px-6 min-h-[44px]">
                        <span>Explore Initiatives</span>
                        <ArrowRight size={20} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>


      {/* Mission & Purpose Section - New Design */}
      <section id="mission" className="section-container">
        <div className="flex flex-col lg:flex-row items-stretch gap-12 lg:gap-16">
          {/* Left Content */}
          <div className="flex-1 flex flex-col justify-center">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold tracking-widest uppercase mb-4 w-fit">
              {homeContent.main_tag}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#003359] mb-4 leading-tight">
              {homeContent.main_title}
            </h2>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-xl">
              {homeContent.main_desc}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mission Card */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-600 group-hover:scale-110 transition-transform">
                  <Target size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Our Mission</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {homeContent.mission_desc}
                </p>
              </div>

              {/* Purpose Card */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 text-purple-600 group-hover:scale-110 transition-transform">
                  <Lightbulb size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Our Purpose</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {homeContent.vision_desc}
                </p>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex-1 relative">
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl h-full min-h-[400px]">
              <img
                src={homeContent.mission_image}
                alt="Vision"
                className="w-full h-full object-cover"
              />

              {/* Overlay: Impact Goal */}
              <div className="absolute top-8 right-8 bg-white p-4 rounded-2xl shadow-lg flex items-center gap-4 animate-fade-in-up">
                <div className="w-12 h-12 rounded-full border-4 border-green-100 flex items-center justify-center text-green-600">
                  <Target size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Impact Goal</div>
                  <div className="text-lg font-bold text-gray-900">10M+ Citizens</div>
                </div>
              </div>

              {/* Overlay: Users */}
              <div className="absolute bottom-8 left-8 right-8 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white">
                <p className="font-medium text-sm">"Together, we are building the digital foundations for a prosperous nation."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Initiatives Preview */}
      {showInitiatives && (
        <section id="initiatives" className="py-16 bg-gray-50">
          <div className="section-container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#003359] mb-4">Digital Initiatives</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Shaping the future through strategic digital interventions.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-64 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <Lightbulb className="text-blue-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Strategic Initiative {i}</h3>
                  <p className="text-gray-500 text-sm">Driving digital bb adoption and transformation.</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/initiatives" className="text-blue-600 font-bold hover:underline flex items-center justify-center gap-2">Explore All Initiatives <ArrowRight size={16} /></Link>
            </div>
          </div>
        </section>
      )}

      {/* Empowering Digital Leaders (Team) */}
      <section id="leaders" className="py-16 bg-white">
        <div className="section-container">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 order-2 md:order-1">
              {/* Team text aligned left */}
              <h2 className="text-3xl font-bold text-[#003359] mb-6">Empowering Digital Leaders</h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Our team of experts is dedicated to guiding organizations through their digital journey. We believe in leadership that inspires innovation and resilience.
              </p>
              <Link to="/team" className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-full">
                Meet Our Team <ArrowRight size={18} />
              </Link>
            </div>
            {/* Moved Team Image to Right for Alternating layout */}
            <div className="flex-1 order-1 md:order-2">
              {/* Re-using default or another image for Team section specifically if needed, keeping static for now as user asked for Mission only */}
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=75" alt="Team" className="rounded-3xl shadow-2xl" />
            </div>
          </div>
        </div>
      </section>


      {/* Learning & Capacity Building */}
      <section id="learning" className="py-16 bg-[#003359] text-white">
        <div className="section-container text-center">
          <h2 className="text-3xl font-bold mb-6">Learning & Capacity Building</h2>
          <p className="text-blue-100 max-w-3xl mx-auto mb-10 text-lg">
            Equipping individuals and organizations with the skills needed to thrive in the digital era. Access our curated resources and training modules.
          </p>
          <Link to="/learning" className="bg-white text-[#003359] px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors inline-flex items-center gap-2">
            Start Learning <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Projects & Support */}
      <section id="projects" className="py-16 bg-gray-50">
        <div className="section-container">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-[#003359]">Projects & Support</h2>
            <Link to="/projects" className="text-blue-600 font-bold hover:underline hidden md:block">View Portfolio</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-bold mb-4">Impactful Projects</h3>
              <p className="text-gray-600 mb-6">Discover how we are implementing digital solutions across various sectors.</p>
              <Link to="/projects" className="text-blue-600 font-bold flex items-center gap-2">Browse Projects <ArrowRight size={16} /></Link>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-bold mb-4">Get Support</h3>
              <p className="text-gray-600 mb-6">Need assistance? Submit a support request and our team will guide you.</p>
              <Link to="/projects" className="text-blue-600 font-bold flex items-center gap-2">Request Support <ArrowRight size={16} /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Events & Archive */}
      <section id="events" className="py-16 bg-white">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#003359] mb-4">Events & Archive</h2>
            <p className="text-gray-600">Join our upcoming workshops and browse past events.</p>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <span className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-2 block">Next Big Event</span>
              <h3 className="text-2xl font-bold mb-2">Digital Transformation Summit 2026</h3>
              <p className="text-gray-600">Join us for a day of insights and networking.</p>
            </div>
            <Link to="/events" className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
              View Calendar
            </Link>
          </div>
        </div>
      </section>

      {/* Standards */}
      <section id="standards" className="py-16 bg-gray-900 text-white">
        <div className="section-container flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-6">Standards & Best Practices</h2>
            <p className="text-gray-400 text-lg mb-8">
              We adhere to global standards to ensure ethical, secure, and inclusive digital solutions.
            </p>
            <Link to="/standards" className="text-white border border-gray-600 px-6 py-3 rounded-full hover:bg-gray-800 transition-colors">
              Read Guidelines
            </Link>
          </div>
          <div className="flex-1 flex justify-center">
            <Target className="text-blue-500 w-32 h-32 opacity-80" />
          </div>
        </div>
      </section>

      {/* Partners Collaboration */}
      <section id="partners" className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">🤝 Partners Collaboration</h2>
            <p className="text-gray-600">Building Digital Future Together</p>
          </div>
          {/* Placeholder - Will be replaced with real data */}
          {/* Featured Partners */}
          {partners.featured.length > 0 && (
            <div className="mb-20">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
                Featured Strategic Partners
              </h3>
              <div className="grid md:grid-cols-3 gap-8">
                {partners.featured.map(partner => (
                  <FeaturedPartnerCard key={partner.id} partner={partner} />
                ))}
              </div>
            </div>
          )}

          {/* All Partners by Category */}
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
              All Partners
            </h3>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex flex-wrap gap-2 mb-8 border-b pb-4">
                {['Government', 'Private Sector', 'Academic', 'NGO', 'International Organization'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setPartnerCategory(cat)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${partnerCategory === cat
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                {partners.all
                  .filter(p => p.category === partnerCategory)
                  .map(partner => (
                    <PartnerCard key={partner.id} partner={partner} />
                  ))}
              </div>

              {partners.all.filter(p => p.category === partnerCategory).length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No partners found in this category.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div >
  );
};

export default Home;
