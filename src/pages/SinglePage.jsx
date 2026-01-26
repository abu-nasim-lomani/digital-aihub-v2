import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { ArrowRight, Target, Lightbulb } from 'lucide-react';

// Import all page components
import Initiatives from './Initiatives';
import Learning from './Learning';
import Projects from './Projects';
import Events from './Events';
import Standards from './Standards';
import Team from './Team';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const SinglePage = () => {
  const [heroSlides] = useState([
    {
      id: 1,
      title: 'Future-ready human-centered Solution design',
      subtitle: 'User-centric solutions: Human-centered design, rapid prototyping, and inclusive CX measurement.',
      image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=1920', // UX/Design
    },
    {
      id: 2,
      title: 'Human-centered Policy & future-fit Governance',
      subtitle: 'Adaptive policy: Agile governance frameworks, policy sandboxes, and ethical AI playbooks.',
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1920', // Governance/Meeting
    },
    {
      id: 3,
      title: 'Research & Standard Development',
      subtitle: 'Adaptable solutions: Continuous research, reference architectures, and global standards alignment.',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1920', // Research/Books
    },
    {
      id: 4,
      title: 'Digital & AI native project and workforce development',
      subtitle: 'Future-fit workforce: Capacity-building programs, assessment frameworks, and learning pathways.',
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1920', // Workforce/Training
    },
    {
      id: 5,
      title: 'Global Knowledge exchange and community of practices',
      subtitle: 'De-risking transformation: Global partnerships, South-South exchange, and knowledge products.',
      image: 'https://images.unsplash.com/photo-1529156069896-8ba733af1160?auto=format&fit=crop&q=80&w=1920', // Global/Connection
    },
  ]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Account for fixed navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Swiper */}
      <section id="home" className="relative h-screen min-h-[600px] w-full overflow-hidden">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={0}
          slidesPerView={1}
          loop={true}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={1000}
          autoplay={{
            delay: 9000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            bulletActiveClass: 'swiper-pagination-bullet-active bg-white w-8 transition-all duration-300'
          }}
          navigation={true}
          className="h-full w-full group"
          loading="lazy"
        >
          {heroSlides.map((slide) => (
            <SwiperSlide key={slide.id} className="h-full w-full overflow-hidden">
              <div
                className="relative h-full w-full bg-cover bg-center animate-ken-burns"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                {/* Premium Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-undp-blue/90 via-undp-blue/70 to-undp-dark-blue/80 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-black/20"></div>

                {/* Content Container */}
                <div className="relative z-10 h-full flex items-center justify-center text-center text-white px-4 sm:px-6 lg:px-8">
                  <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">

                    {/* Animated Title */}
                    <h1 className="animate-title text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight tracking-tight drop-shadow-lg opacity-0">
                      {slide.title}
                    </h1>

                    {/* Animated Subtitle */}
                    <p className="animate-subtitle text-lg sm:text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto font-light leading-relaxed drop-shadow-md opacity-0">
                      {slide.subtitle}
                    </p>

                    {/* Animated Button */}
                    <div className="animate-button pt-4 sm:pt-6 opacity-0">
                      <button
                        onClick={() => scrollToSection('initiatives')}
                        className="group relative inline-flex items-center justify-center px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-undp-blue bg-white rounded-full overflow-hidden transition-all duration-300 hover:bg-undp-light-grey hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                      >
                        <span className="relative z-10 mr-2">Explore Initiatives</span>
                        <ArrowRight size={20} className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce hidden md:block">
          <div className="w-8 h-12 border-2 border-white/50 rounded-full flex justify-center p-2">
            <div className="w-1 h-3 bg-white rounded-full animate-scroll"></div>
          </div>
        </div>
      </section>

      {/* Mission & Purpose Section - Clean Modern Design */}
      {/* Mission & Purpose Section - Premium Design */}
      <section id="mission" className="section-container scroll-mt-20 py-24 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50 to-transparent -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-50 rounded-full blur-3xl -z-10 opacity-50"></div>

        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">

            {/* Left Content */}
            <div className="lg:w-1/2">
              <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-[#003359] text-xs font-bold tracking-widest uppercase mb-6">
                Our Vision
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-[#003359] mb-8 leading-tight">
                Driving Digital <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Transformation</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                We envision a future where technology empowers every citizen, bridges the digital divide, and accelerates sustainable development goals across Bangladesh.
              </p>

              <div className="flex gap-4">
                <div className="flex-1 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:-translate-y-1 transition-transform duration-300">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                    <Target className="text-blue-600" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Our Mission</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Accelerate people-centered digital transformation through innovation, capacity building, and strategic support.
                  </p>
                </div>

                <div className="flex-1 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:-translate-y-1 transition-transform duration-300">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
                    <Lightbulb className="text-purple-600" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Our Purpose</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Serve as a catalyst for digital innovation, ensuring technology creates equitable opportunities for all.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="lg:w-1/2 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800"
                  alt="Digital Transformation Team"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#003359]/80 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex -space-x-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                          <img src={`https://ui-avatars.com/api/?name=User+${i}&background=random`} alt="User" />
                        </div>
                      ))}
                    </div>
                    <span className="text-sm font-semibold">Joined by 500+ Change Makers</span>
                  </div>
                  <p className="text-sm text-blue-100 font-medium opacity-90">
                    "Together, we are building the digital foundations for a prosperous nation."
                  </p>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl animate-bounce-slow hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg text-green-600">
                    <Target size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">Impact Goal</p>
                    <p className="text-lg font-bold text-gray-900">10M+ Citizens</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* All Other Sections - Wrapped with IDs */}
      <div id="initiatives" className="scroll-mt-20">
        <Initiatives />
      </div>
      <div id="learning" className="scroll-mt-20">
        <Learning />
      </div>
      <div id="projects" className="scroll-mt-20">
        <Projects />
      </div>
      <div id="events" className="scroll-mt-20">
        <Events />
      </div>
      <div id="standards" className="scroll-mt-20">
        <Standards />
      </div>
      <div id="team" className="scroll-mt-20">
        <Team />
      </div>
    </div>
  );
};

export default SinglePage;
