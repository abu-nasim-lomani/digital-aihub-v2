import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Youtube, ArrowRight, Globe } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-undp-dark-blue text-white border-t border-blue-800/30">

      {/* Top Wave/Gradient Line (Optional subtle accent) */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-400 via-blue-200 to-blue-400 opacity-20"></div>

      <div className="section-container pt-16 pb-8">

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">

          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/UNDP_logo.svg/1011px-UNDP_logo.svg.png"
                alt="UNDP Logo"
                className="h-12 w-auto filter brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity"
              />
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-wide">Digital & AI Hub</span>
                <span className="text-[10px] text-blue-200 uppercase tracking-widest">Bangladesh</span>
              </div>
            </Link>
            <p className="text-blue-100/80 text-sm leading-relaxed max-w-xs">
              Empowering nations through inclusive digital transformation and ethical AI adoption for a sustainable future.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {[Facebook, Twitter, Linkedin, Youtube].map((Icon, idx) => (
                <a key={idx} href="#" className="w-10 h-10 rounded-full bg-blue-800/30 flex items-center justify-center text-blue-100 hover:bg-white hover:text-[#003359] transition-all duration-300 transform hover:-translate-y-1">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-base mb-6 relative inline-block">
              Platform
              <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-blue-400 rounded-full"></span>
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Our Initiatives', path: '/initiatives' },
                { name: 'Learning & Capacity', path: '/learning' },
                { name: 'Projects & Support', path: '/projects' },
                { name: 'Events Calendar', path: '/events' },
                { name: 'Standards & Policy', path: '/standards' },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="text-blue-100/70 hover:text-white text-sm flex items-center gap-2 group transition-colors"
                  >
                    <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    <span className="group-hover:translate-x-1 transition-transform">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources & Contact */}
          <div>
            <h4 className="text-white font-bold text-base mb-6 relative inline-block">
              Connect
              <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-blue-400 rounded-full"></span>
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-blue-100/70 group">
                <MapPin size={18} className="shrink-0 text-blue-400 mt-0.5 group-hover:text-white transition-colors" />
                <span className="leading-relaxed">
                  UN Offices, 18th Floor, IDB Bhaban,<br />Agargaon, Dhaka 1207
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm text-blue-100/70 group">
                <Phone size={18} className="shrink-0 text-blue-400 group-hover:text-white transition-colors" />
                <span>+880 2 55667788</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-blue-100/70 group">
                <Mail size={18} className="shrink-0 text-blue-400 group-hover:text-white transition-colors" />
                <a href="mailto:registry.bd@undp.org" className="hover:text-white transition-colors">registry.bd@undp.org</a>
              </li>
            </ul>
          </div>

          {/* Newsletter / CTA */}
          <div className="bg-blue-900/20 p-6 rounded-2xl border border-blue-700/30">
            <h4 className="text-white font-bold text-base mb-2">Detailed Reports</h4>
            <p className="text-xs text-blue-200 mb-4 leading-relaxed">
              Subscribe to get the latest monthly technical reports and AI policy updates.
            </p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Enter your work email"
                className="w-full px-4 py-2.5 rounded-lg bg-blue-950/50 border border-blue-800 text-blue-100 placeholder-blue-400/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all"
              />
              <button className="w-full py-2.5 bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group">
                Subscribe
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-800/40 pt-8 mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-blue-300/60">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
            <p>&copy; {currentYear} UNDP Digital & AI Hub.</p>
            <div className="hidden md:block w-1 h-1 bg-blue-800 rounded-full"></div>
            <div className="flex items-center gap-4">
              <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="#" className="hover:text-white transition-colors">Terms of Use</Link>
              <Link to="#" className="hover:text-white transition-colors">Sitemap</Link>
            </div>
          </div>

          <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity cursor-default">
            <Globe size={14} />
            <span>Global Network</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
