import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, AlertCircle, Info, ArrowRight, Lock, Mail } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';

  // Get redirect path from query params
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      // Small delay to ensure state is updated
      setTimeout(() => {
        // Check if admin from backend response
        if (response?.user?.isAdmin) {
          navigate('/admin/dashboard');
        } else {
          // Regular user - redirect to original page or home
          navigate(redirectPath || '/');
        }
      }, 100);
    } catch (err) {
      let errorMessage = 'Failed to log in. ';

      if (err.message?.includes('Email not confirmed') ||
        err.message?.includes('email_not_confirmed')) {
        errorMessage = 'Please check your email and confirm your account before logging in.';
      } else if (err.message?.includes('Invalid login credentials') ||
        err.message?.includes('invalid_credentials') ||
        err.message?.includes('Invalid email or password')) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else {
        errorMessage = err.message || 'Failed to log in. Please check your credentials.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">

      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-[45%] bg-[#003359] relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10">
          <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center mb-6">
            <LogIn size={24} className="text-white" />
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">Digital Transformation <br />Starts Here.</h2>
          <p className="text-blue-100 text-lg opacity-80">Access the central hub for AI initiatives, content, and digital standards.</p>
        </div>

        <div className="relative z-10">
          <blockquote className="border-l-4 border-blue-400 pl-4 italic text-blue-100/80">
            "Innovation distinguishes between a leader and a follower."
          </blockquote>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">

          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
              {isAdminPage ? 'Admin Portal' : 'Welcome Back'}
            </h1>
            <p className="text-gray-500">
              Please enter your details to sign in.
            </p>
          </div>

          {/* Admin Hint */}
          {isAdminPage && (
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
              <Info size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-bold mb-1">Demo Admin Access:</p>
                <div className="flex flex-col gap-1">
                  <span>Email: <strong>admin@digitalaihub.com</strong></span>
                  <span>Pass: <strong>admin123</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 animate-in shake">
              <AlertCircle size={20} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Email or Username</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex bg-transparent justify-between items-center mb-1.5 ml-1">
                <label className="block text-sm font-bold text-gray-700">Password</label>
                <Link to="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">New to the platform?</span>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              Create an account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
