import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight } from 'lucide-react';

const PartnerCard = ({ partner }) => {
    const navigate = useNavigate();
    return (
        <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-200 hover:-translate-y-0.5">
            {/* Logo Section */}
            <div className="h-32 bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
                {partner.logo ? (
                    <img
                        src={partner.logo}
                        alt={partner.name}
                        className="max-h-full max-w-full object-contain"
                    />
                ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                        <Building2 size={28} className="text-white" />
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-4">
                {/* Partner Name */}
                <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-1">
                    {partner.name}
                </h4>

                {/* Description */}
                {partner.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {partner.description}
                    </p>
                )}

                {/* View Details Button */}
                <button
                    onClick={() => navigate(`/partners/${partner.id}`)}
                    className="w-full mt-4 px-4 py-2 bg-[#002845] hover:bg-[#003865] text-white font-semibold rounded-lg transition-colors duration-300 text-sm flex items-center justify-center gap-2"
                >
                    View Details
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default PartnerCard;
