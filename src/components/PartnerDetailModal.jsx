import { X, Globe, Mail, Calendar, Target, Award } from 'lucide-react';

const PartnerDetailModal = ({ partner, onClose }) => {
    if (!partner) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative max-h-[90vh] flex flex-col">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white hover:scale-110 transition-all border border-white/30"
                >
                    <X size={20} />
                </button>

                {/* Header - Gradient Background */}
                <div className="bg-gradient-to-br from-[#002845] to-blue-900 p-8 text-white relative flex-shrink-0">
                    <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                        {/* Logo Container */}
                        <div className="w-24 h-24 bg-white rounded-xl shadow-lg p-2 flex items-center justify-center flex-shrink-0">
                            {partner.logo ? (
                                <img
                                    src={partner.logo}
                                    alt={partner.name}
                                    className="max-h-full max-w-full object-contain"
                                />
                            ) : (
                                <Award className="text-blue-900 w-10 h-10" />
                            )}
                        </div>

                        <div className="text-center md:text-left space-y-2">
                            <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-medium mb-1">
                                {partner.category}
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                                {partner.name}
                            </h2>
                            {partner.partnershipType && (
                                <p className="text-blue-100 flex items-center justify-center md:justify-start gap-2 text-sm">
                                    <Target size={14} />
                                    {partner.partnershipType}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                    <div className="space-y-8">

                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                About Recommendation
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {partner.description || "No description available."}
                            </p>
                        </div>

                        {/* Focus Areas */}
                        {partner.focusAreas && partner.focusAreas.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Key Focus Areas</h3>
                                <div className="flex flex-wrap gap-2">
                                    {partner.focusAreas.map((area, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-100"
                                        >
                                            {area}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Additional Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                            {partner.website && (
                                <a
                                    href={partner.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        <Globe size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold uppercase">Website</p>
                                        <p className="font-medium text-sm truncate">{partner.website.replace(/^https?:\/\//, '')}</p>
                                    </div>
                                </a>
                            )}

                            {partner.email && (
                                <a
                                    href={`mailto:${partner.email}`}
                                    className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold uppercase">Email Contact</p>
                                        <p className="font-medium text-sm truncate">{partner.email}</p>
                                    </div>
                                </a>
                            )}

                            {partner.startDate && (
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold uppercase">Partnership Since</p>
                                        <p className="font-medium text-sm">
                                            {new Date(partner.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PartnerDetailModal;
