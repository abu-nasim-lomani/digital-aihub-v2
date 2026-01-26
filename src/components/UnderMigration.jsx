import { Construction, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const UnderMigration = ({ pageName = "This Page" }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="bg-yellow-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Construction className="text-yellow-600" size={40} />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Page Under Migration
                </h1>

                <p className="text-lg text-gray-600 mb-6">
                    <strong>{pageName}</strong> is currently being migrated to the new backend API.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                    <p className="text-sm text-blue-800">
                        <strong>Status:</strong> Backend API is ready and running. This page needs frontend updates to connect to the new API.
                    </p>
                </div>

                <div className="space-y-3">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 bg-undp-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to Home</span>
                    </Link>

                    <p className="text-sm text-gray-500">
                        This page will be available soon. Thank you for your patience!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UnderMigration;
