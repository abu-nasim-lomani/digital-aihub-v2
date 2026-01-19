import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    X, LogIn, UserPlus, Mail, Lock, CheckCircle,
    ArrowRight, AlertCircle, User
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
    const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const { login, signup } = useAuth();
    const navigate = useNavigate();

    // Reset state when modal opens or mode changes
    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            setError('');
            setSuccess(false);
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        }
    }, [isOpen, initialMode]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);

        try {
            if (mode === 'login') {
                /* LOGIN LOGIC */
                await login(email, password);

                // Admin Check Helper
                const isAdmin = email.toLowerCase().trim() === 'admin' && password === 'admin123';

                setSuccess(true);
                setTimeout(() => {
                    onClose(); // Close modal
                    if (isAdmin) {
                        navigate('/admin/dashboard');
                    } else {
                        // Optional: User dashboard or stay on current page
                        // navigate('/user/dashboard'); 
                    }
                }, 800);

            } else {
                /* SIGNUP LOGIC */
                // Validation
                if (email.toLowerCase().trim() === 'admin') {
                    throw new Error('Admin account cannot be created.');
                }
                if (password !== confirmPassword) {
                    throw new Error('Passwords do not match');
                }
                if (password.length < 6) {
                    throw new Error('Password must be at least 6 characters');
                }

                const result = await signup(email, password);
                setSuccess(true);

                setTimeout(() => {
                    // If email confirmation needed, maybe show message longer
                    if (result?.requiresEmailConfirmation) {
                        setMode('login'); // Switch to login to prompt them
                        setError('Account created! Please check email then login.');
                        setSuccess(false);
                    } else {
                        onClose();
                        if (email.toLowerCase().trim() === 'admin') navigate('/admin/dashboard');
                    }
                }, 1500);
            }
        } catch (err) {
            console.error(err);
            let msg = 'Authentication failed.';
            if (err.message.includes('invalid_credentials') || err.message.includes('Invalid login')) {
                msg = 'Invalid email or password.';
            } else if (err.code === 'auth/email-already-in-use') {
                msg = 'Email already registered.';
            } else if (err.message) {
                msg = err.message;
            }
            setError(msg);
            setSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">

            {/* Modal Container */}
            <div className="relative bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto max-h-[90vh] md:h-[550px] animate-in zoom-in-95 duration-300">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 bg-black/10 hover:bg-black/20 text-gray-500 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>

                {/* LEFT PANEL: Branding */}
                <div className={`hidden md:flex w-[45%] bg-[#003359] relative overflow-hidden flex-col justify-between p-10 text-white transition-all duration-500`}>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    {mode === 'login' ? (
                        /* Login BG Effects */
                        <>
                            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                        </>
                    ) : (
                        /* Signup BG Effects */
                        <>
                            <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                        </>
                    )}

                    <div className="relative z-10">
                        <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center mb-6">
                            {mode === 'login' ? <LogIn size={20} className="text-white" /> : <UserPlus size={20} className="text-white" />}
                        </div>
                        <h2 className="text-3xl font-bold leading-tight mb-3">
                            {mode === 'login' ? 'Welcome Back.' : 'Join the Hub.'}
                        </h2>
                        <p className="text-blue-100 text-sm opacity-80 leading-relaxed">
                            {mode === 'login'
                                ? 'Access your dashboard, manage projects, and explore exclusive content.'
                                : 'Create an account to collaborate, learn, and drive digital impact together.'}
                        </p>
                    </div>

                    <div className="relative z-10">
                        {mode === 'login' ? (
                            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-xs">
                                <p className="font-bold mb-1">Demo Access:</p>
                                <div className="opacity-80">User: admin / Pass: admin123</div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm opacity-80 font-medium">
                                <div className="flex -space-x-2">
                                    <div className="w-6 h-6 rounded-full bg-yellow-400 border border-[#003359]"></div>
                                    <div className="w-6 h-6 rounded-full bg-blue-400 border border-[#003359]"></div>
                                    <div className="w-6 h-6 rounded-full bg-red-400 border border-[#003359]"></div>
                                </div>
                                <span>Join 500+ Change Makers</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL: Form */}
                <div className="flex-1 flex flex-col justify-center p-8 md:p-12 relative overflow-y-auto">

                    <div className="mb-6 text-center md:text-left">
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                            {mode === 'login' ? 'Sign In' : 'Create Account'}
                        </h3>
                        <p className="text-gray-500 text-sm">
                            {mode === 'login' ? 'Enter your details to continue.' : 'It only takes a minute.'}
                        </p>
                    </div>

                    {/* Feedback Messages */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm animate-in shake">
                            <AlertCircle size={16} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg flex items-center gap-2 text-green-700 text-sm animate-in zoom-in-95">
                            <CheckCircle size={16} className="shrink-0" />
                            <span className="font-medium">{mode === 'login' ? 'Login Successful!' : 'Account Created!'}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase">Password</label>
                                {mode === 'login' && <button type="button" className="text-xs text-blue-600 font-bold hover:underline">Forgot?</button>}
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {mode === 'signup' && (
                            <div className="animate-in slide-in-from-top-2 duration-300">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirm Password</label>
                                <div className="relative">
                                    <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || success}
                            className="w-full btn-primary py-3 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <LoadingSpinner size="sm" color="white" />
                            ) : (
                                <>
                                    <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle Mode */}
                    <div className="mt-8 text-center pt-6 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                            <button
                                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                className="text-blue-600 font-bold hover:underline focus:outline-none"
                            >
                                {mode === 'login' ? 'Sign up' : 'Log in'}
                            </button>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AuthModal;
