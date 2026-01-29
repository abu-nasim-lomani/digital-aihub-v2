import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { ArrowRight, Target, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

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


  return (
    <div className="min-h-screen">
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
                    <Link to="/initiatives" className="btn-primary inline-flex items-center justify-center space-x-2 py-2.5 sm:py-3 px-4 sm:px-6 min-h-[44px]">
                      <span>Explore Initiatives</span>
                      <ArrowRight size={20} />
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>


      {/* Mission & Purpose Section */}
      <section id="mission" className="section-container">
        <div className="max-w-4xl mx-auto">
          <div>
            <div className="flex items-center space-x-3 mb-4 sm:mb-6">
              <Target className="text-undp-blue" size={28} />
              <h2 className="text-2xl sm:text-3xl font-bold text-undp-blue">Our Mission</h2>
            </div>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6">
              To enable and accelerate people-centered digital transformation across UNDP and partner
              organizations by providing innovative solutions, capacity building, and strategic support.
            </p>
            <div className="flex items-center space-x-3 mb-4 sm:mb-6">
              <Lightbulb className="text-undp-blue" size={28} />
              <h2 className="text-2xl sm:text-3xl font-bold text-undp-blue">Our Purpose</h2>
            </div>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              We serve as a catalyst for digital innovation, ensuring that technology serves humanity
              and contributes to sustainable development goals. Our approach prioritizes inclusivity,
              accessibility, and ethical use of digital tools.
            </p>
          </div>
        </div>
      </section>

      {/* Initiatives Preview */}
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
                <p className="text-gray-500 text-sm">Driving digital adoption and transformation.</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/initiatives" className="text-blue-600 font-bold hover:underline flex items-center justify-center gap-2">Explore All Initiatives <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* Empowering Digital Leaders (Team) */}
      <section id="leaders" className="py-16 bg-white">
        <div className="section-container">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=75" alt="Team" className="rounded-3xl shadow-2xl" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-[#003359] mb-6">Empowering Digital Leaders</h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Our team of experts is dedicated to guiding organizations through their digital journey. We believe in leadership that inspires innovation and resilience.
              </p>
              <Link to="/team" className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-full">
                Meet Our Team <ArrowRight size={18} />
              </Link>
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
    </div >
  );
};

export default Home;
