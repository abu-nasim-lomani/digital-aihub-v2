import { useState } from 'react';
import ManageProjects from './ManageProjects';
import ManageSupportRequests from './ManageSupportRequests';

const ManageProjectsAndSupport = () => {
    const [activeTab, setActiveTab] = useState('projects'); // 'projects' or 'support'

    return (
        <div className="flex flex-col min-h-screen">
            {/* Tab Navigation */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('projects')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'projects'
                                    ? 'border-undp-blue text-undp-blue'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Projects
                        </button>
                        <button
                            onClick={() => setActiveTab('support')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'support'
                                    ? 'border-undp-blue text-undp-blue'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Support Requests
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-grow bg-gray-50/50">
                <div className={activeTab === 'projects' ? 'block' : 'hidden'}>
                    <ManageProjects />
                </div>
                <div className={activeTab === 'support' ? 'block' : 'hidden'}>
                    <ManageSupportRequests />
                </div>
            </div>
        </div>
    );
};

export default ManageProjectsAndSupport;
