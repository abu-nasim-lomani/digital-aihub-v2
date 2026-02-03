import { ExternalLink, Mail, Calendar, Award } from 'lucide-react';

const FeaturedPartnerCard = ({ partner }) => {
    const formatDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
        });
    };

    return (
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-200 hover:-translate-y-1">
            {/* Logo Section */}
            <div className="h-48 bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-8">
                {partner.logo ? (
                    <img
                        src={partner.logo}
                        alt={partner.name}
                        className="max-h-full max-w-full object-contain"
                    />
                ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                        <span className="text-4xl font-bold text-white">
                            {partner.name.charAt(0)}
                        </span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-6">
                {/* Category Badge */}
                <div className="mb-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                        <Award size={12} />
                        {partner.category}
                    </span>
                </div>

                {/* Partner Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {partner.name}
                </h3>

                {/* Description */}
                {partner.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {partner.description}
                    </p>
                )}

                {/* Focus Areas */}
                {partner.focusAreas && partner.focusAreas.length > 0 && (
                    <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                            {partner.focusAreas.slice(0, 3).map((area, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 text-xs rounded-md bg-blue-50 text-blue-700 font-medium"
                                >
                                    {area}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Partnership Info */}
                <div className="space-y-2 mb-4">
                    {partner.partnershipType && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Award size={14} className="text-purple-500" />
                            <span>{partner.partnershipType}</span>
                        </div>
                    )}
                    {partner.startDate && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={14} className="text-blue-500" />
                            <span>Since {formatDate(partner.startDate)}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                    {partner.website && (
                        <a
                            href={partner.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors text-sm font-semibold"
                        >
                            <ExternalLink size={16} />
                            Visit Website
                        </a>
                    )}
                    {partner.email && (
                        <a
                            href={`mailto:${partner.email}`}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors text-sm font-semibold"
                        >
                            <Mail size={16} />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeaturedPartnerCard;
