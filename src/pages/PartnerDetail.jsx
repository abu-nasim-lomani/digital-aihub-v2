import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Share2, Globe, Mail, Calendar, Target, Award, ArrowLeft } from 'lucide-react';
import { partnerAPI } from '../utils/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PartnerDetail = () => {
    const { id } = useParams();
    const [partner, setPartner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPartner = async () => {
            try {
                const res = await partnerAPI.getById(id);
                setPartner(res.data.partner);
            } catch (err) {
                console.error('Error fetching partner:', err);
                setError('Failed to load partner details.');
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchPartner();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-undp-blue"></div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !partner) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Partner Not Found</h2>
                    <p className="text-gray-600 mb-8">{error || "The requested partner could not be found."}</p>
                    <Link to="/" className="px-6 py-2 bg-undp-blue text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Back to Home
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-grow">
                {/* Header Section */}
                <div className="relative bg-[#002845] text-white pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center opacity-10"></div>
                    </div>

                    <div className="relative max-w-7xl mx-auto">
                        <Link to="/" className="inline-flex items-center text-blue-200 hover:text-white mb-8 transition-colors">
                            <ArrowLeft size={20} className="mr-2" />
                            Back to Partners
                        </Link>

                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-2xl shadow-xl p-4 flex items-center justify-center flex-shrink-0 animate-in zoom-in-50 duration-500">
                                {partner.logo ? (
                                    <img
                                        src={partner.logo}
                                        alt={partner.name}
                                        className="max-h-full max-w-full object-contain"
                                    />
                                ) : (
                                    <Award className="text-blue-900 w-16 h-16" />
                                )}
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-sm font-medium">
                                        {partner.category}
                                    </span>
                                    {partner.status === 'published' && (
                                        <span className="px-3 py-1 bg-green-500/20 text-green-200 rounded-full text-sm font-medium border border-green-500/30">
                                            Active Partner
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                                    {partner.name}
                                </h1>

                                {partner.partnershipType && (
                                    <div className="flex items-center gap-2 text-blue-100 text-lg">
                                        <Target size={20} />
                                        <span>{partner.partnershipType}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-20 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    About Partnership
                                </h2>
                                <div className="prose prose-lg text-gray-600 max-w-none leading-relaxed">
                                    {partner.description ? (
                                        partner.description.split('\n').map((paragraph, idx) => (
                                            <p key={idx}>{paragraph}</p>
                                        ))
                                    ) : (
                                        <p className="italic text-gray-400">No description provided.</p>
                                    )}
                                </div>
                            </div>

                            {partner.focusAreas && partner.focusAreas.length > 0 && (
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Focus Areas</h2>
                                    <div className="flex flex-wrap gap-3">
                                        {partner.focusAreas.map((area, idx) => (
                                            <span
                                                key={idx}
                                                className="px-4 py-2 bg-purple-50 text-purple-700 rounded-xl font-medium border border-purple-100"
                                            >
                                                {area}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Contact Information</h3>
                                <div className="space-y-4">
                                    {partner.website ? (
                                        <a
                                            href={partner.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                <Globe size={18} />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-xs text-gray-500 font-bold uppercase mb-0.5">Website</p>
                                                <p className="text-sm font-medium truncate">{partner.website.replace(/^https?:\/\//, '')}</p>
                                            </div>
                                        </a>
                                    ) : (
                                        <div className="p-4 rounded-2xl bg-gray-50 text-gray-400 text-sm flex items-center gap-2">
                                            <Globe size={16} /> No website available
                                        </div>
                                    )}

                                    {partner.email ? (
                                        <a
                                            href={`mailto:${partner.email}`}
                                            className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                <Mail size={18} />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-xs text-gray-500 font-bold uppercase mb-0.5">Email</p>
                                                <p className="text-sm font-medium truncate">{partner.email}</p>
                                            </div>
                                        </a>
                                    ) : (
                                        <div className="p-4 rounded-2xl bg-gray-50 text-gray-400 text-sm flex items-center gap-2">
                                            <Mail size={16} /> No email available
                                        </div>
                                    )}
                                </div>

                                {partner.startDate && (
                                    <div className="mt-8 pt-8 border-t border-gray-100">
                                        <h4 className="text-xs text-gray-500 font-bold uppercase mb-3">Partnership Since</h4>
                                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                                            <Calendar size={18} className="text-undp-blue" />
                                            {new Date(partner.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PartnerDetail;
