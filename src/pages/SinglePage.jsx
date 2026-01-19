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
      <section className="section-container scroll-mt-20 py-20 bg-gray-50/80">
        <div className="max-w-6xl mx-auto px-4">

          {/* Section Title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Mission & Purpose
            </h2>
            <div className="h-1.5 w-24 bg-undp-blue mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">

            {/* Mission Card */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-undp-blue group-hover:text-white transition-colors duration-300">
                  <Target className="w-6 h-6 text-undp-blue group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-undp-blue transition-colors duration-300">
                  Our Mission
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed pl-0 sm:pl-[60px]">
                To enable and accelerate <span className="font-semibold text-gray-800">people-centered digital transformation</span> across UNDP and partner
                organizations by providing innovative solutions, capacity building, and strategic support.
              </p>
            </div>

            {/* Purpose Card */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                <div className="p-3 bg-amber-50 rounded-lg group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                  <Lightbulb className="w-6 h-6 text-amber-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors duration-300">
                  Our Purpose
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed pl-0 sm:pl-[60px]">
                We serve as a catalyst for <span className="font-semibold text-gray-800">digital innovation</span>, ensuring technology serves humanity.
                Our approach prioritizes inclusivity, accessibility, and ethical use of digital tools.
              </p>
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
