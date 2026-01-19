import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, ChevronDown, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const userMenuRef = useRef(null);

  const navItems = [
    { path: '/', label: 'Home', sectionId: 'home' },
    { path: '/initiatives', label: 'Initiatives', sectionId: 'initiatives' },
    { path: '/learning', label: 'Learning', sectionId: 'learning' },
    { path: '/projects', label: 'Projects & Supports', sectionId: 'projects' },
    { path: '/events', label: 'Events', sectionId: 'events' },
    { path: '/standards', label: 'Standards', sectionId: 'standards' },
    { path: '/team', label: 'Team & Advisory', sectionId: 'team' },
  ];

  // Scroll Detection for Floating Effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isOpen]);

  const isActive = (path) => location.pathname === path;

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const handleNavClick = (e, item) => {
    if (location.pathname === '/') {
      e.preventDefault();
      setIsOpen(false); // Close mobile drawer
      scrollToSection(item.sectionId);
    } else {
      e.preventDefault();
      setIsOpen(false);
      navigate('/');
      setTimeout(() => scrollToSection(item.sectionId), 100);
    }
  };

  const handleLogout = async () => {
    setIsOpen(false);
    setUserMenuOpen(false);
    try {
      localStorage.removeItem('adminUser');
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('adminUser');
    }
    window.location.href = '/';
  };

  const getUserInitials = (email) => {
    if (!email) return 'U';
    const parts = email.split('@')[0];
    return parts.length >= 2 ? parts.substring(0, 2).toUpperCase() : parts.charAt(0).toUpperCase();
  };

  const isHome = location.pathname === '/';
  // Only show floating pill style if on Home AND at the top
  const isFloating = isHome && !isScrolled;

  return (
    <>
      <nav
        className={`fixed z-50 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${!isFloating
            ? 'top-0 left-0 right-0 w-full bg-white/95 backdrop-blur-xl shadow-md border-b border-gray-100 py-2'
            : 'top-2 md:top-6 left-0 right-0 w-[95%] md:w-[90%] max-w-7xl mx-auto rounded-2xl bg-white/80 backdrop-blur-md shadow-lg shadow-black/5 border border-white/50 py-3'
          }`}
      >
        <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${!isFloating ? 'max-w-7xl' : ''}`}>
          <div className="flex items-center justify-between">

            {/* Logo */}
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                location.pathname === '/' ? window.scrollTo({ top: 0, behavior: 'smooth' }) : navigate('/');
              }}
              className="flex items-center gap-3 group"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/UNDP_logo.svg/1011px-UNDP_logo.svg.png"
                alt="UNDP Logo"
                className="h-8 md:h-10 w-auto transition-transform duration-300 group-hover:scale-110"
              />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-tight group-hover:text-undp-blue transition-colors">
                  Digital & <br className="hidden lg:block" /> <span className="text-undp-blue">AI Hub</span>
                </h1>
              </div>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${isActive(item.path)
                    ? 'bg-undp-blue/10 text-undp-blue'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                  {item.label}
                </a>
              ))}

              {/* Divider */}
              <div className="h-6 w-px bg-gray-200 mx-3"></div>

              {/* User Actions */}
              {currentUser ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all bg-white"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-undp-blue to-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                      {getUserInitials(currentUser.email)}
                    </div>
                    <ChevronDown size={14} className={`text-gray-500 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl ring-1 ring-black/5 py-2 animate-in slide-in-from-top-2 fade-in duration-200 overflow-hidden">
                      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                        <p className="text-sm font-bold text-gray-900 truncate">{currentUser.email}</p>
                        <p className="text-xs text-blue-500 font-medium mt-0.5">{currentUser.isAdmin ? 'Administrator' : 'Member'}</p>
                      </div>
                      <div className="p-1">
                        <Link
                          to={currentUser.isAdmin ? "/admin/dashboard" : "/user/dashboard"}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <User size={16} />
                          Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="btn-primary py-2.5 px-6 rounded-full text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-500 ${isOpen ? 'visible' : 'invisible'}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsOpen(false)}
        />

        {/* Drawer Panel */}
        <div className={`absolute top-0 right-0 w-80 h-full bg-white shadow-2xl transition-transform duration-500 ease-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full">
            {/* Drawer Header */}
            <div className="p-5 flex items-center justify-between border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Menu</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-2">
              {navItems.map((item, idx) => (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive(item.path)
                    ? 'bg-blue-50 text-undp-blue font-bold border-l-4 border-undp-blue'
                    : 'text-gray-600 hover:bg-gray-50 font-medium'
                    }`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Drawer Footer (User Profile) */}
            <div className="p-5 border-t border-gray-100 bg-gray-50/50">
              {currentUser ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-undp-blue text-white flex items-center justify-center font-bold">
                      {getUserInitials(currentUser.email)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm truncate max-w-[180px]">{currentUser.email}</p>
                      <p className="text-xs text-blue-500">{currentUser.isAdmin ? 'Administrator' : 'Member'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={currentUser.isAdmin ? "/admin/dashboard" : "/user/dashboard"}
                      onClick={() => setIsOpen(false)}
                      className="px-3 py-2 text-center text-sm font-semibold bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-2 text-center text-sm font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setIsOpen(false); setShowAuthModal(true); }}
                  className="w-full btn-primary py-3 rounded-xl font-bold shadow-lg"
                >
                  Sign In / Register
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
      />
    </>
  );
};

export default Navbar;
