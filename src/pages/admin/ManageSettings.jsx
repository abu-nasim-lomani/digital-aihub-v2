import { useEffect, useState } from 'react';
import { settingsAPI } from '../../utils/api';
import { Eye, EyeOff, Layout, Settings, Save, ArrowUp, ArrowDown } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const SECTION_CONFIG = [
    { key: 'initiative_visibility', label: 'Initiatives', description: 'Show or hide the Initiatives section and pages.' },
    { key: 'learning_visibility', label: 'Learning Center', description: 'Show or hide the Learning section and pages.' },
    { key: 'project_visibility', label: 'Projects & Supports', description: 'Show or hide the Projects section and pages.' },
    { key: 'event_visibility', label: 'Events', description: 'Show or hide the Events section and pages.' },
    { key: 'standard_visibility', label: 'Standards', description: 'Show or hide the Standards section and pages.' },
    { key: 'partner_visibility', label: 'Partners Collaboration', description: 'Show or hide the Partners section and pages.' },
    { key: 'team_visibility', label: 'Team & Advisory', description: 'Show or hide the Team section and pages.' },
];

const ManageSettings = () => {
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        initiative_visibility: true,
        event_visibility: true,
        project_visibility: true,
        learning_visibility: true,
        standard_visibility: true,
        partner_visibility: true,
        team_visibility: true,
    });
    // Default order matches config keys if nothing saved
    const [sectionOrder, setSectionOrder] = useState(SECTION_CONFIG.map(s => s.key));

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const keys = SECTION_CONFIG.map(s => s.key);
            // Fetch visibility settings and order key
            const promises = [
                ...keys.map(key => settingsAPI.get(key).catch(() => ({ data: { value: true } }))),
                settingsAPI.get('section_order').catch(() => ({ data: { value: null } }))
            ];

            const results = await Promise.all(promises);

            const newSettings = {};
            // Process visibility settings (items 0 to N-1)
            keys.forEach((key, index) => {
                newSettings[key] = results[index].data?.value ?? true;
            });

            // Process order setting (last item)
            const orderResult = results[results.length - 1];
            if (orderResult.data?.value && Array.isArray(orderResult.data.value) && orderResult.data.value.length > 0) {
                // Ensure we only use valid keys from the stored order, appending any missing new ones
                const storedOrder = orderResult.data.value;
                const validStoredKeys = storedOrder.filter(k => keys.includes(k));
                const missingKeys = keys.filter(k => !validStoredKeys.includes(k));
                setSectionOrder([...validStoredKeys, ...missingKeys]);
            } else {
                // Use default order if no setting found
                setSectionOrder(keys);
            }

            setSettings(newSettings);
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSetting = async (key) => {
        try {
            const newValue = !settings[key];
            setSettings(prev => ({ ...prev, [key]: newValue })); // Optimistic update
            await settingsAPI.update(key, newValue);
        } catch (error) {
            console.error(`Error updating setting ${key}:`, error);
            setSettings(prev => ({ ...prev, [key]: !prev[key] })); // Revert on error
            alert('Failed to update setting');
        }
    };

    const moveSection = async (index, direction) => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === sectionOrder.length - 1)
        ) return;

        const newOrder = [...sectionOrder];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap
        [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];

        setSectionOrder(newOrder); // Optimistic UI update

        try {
            await settingsAPI.update('section_order', newOrder);
        } catch (error) {
            console.error('Failed to save order:', error);
            alert('Failed to save new order');
            setSectionOrder(sectionOrder); // Revert
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <Settings size={28} />
                        </div>
                        Visibility & Order Control
                    </h1>
                    <p className="text-gray-500 mt-2 ml-14">Manage the visibility and order of sections across the platform.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Layout size={20} className="text-gray-500" />
                            Site Sections
                        </h2>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {sectionOrder.map((key, index) => {
                            const config = SECTION_CONFIG.find(c => c.key === key);
                            // Fallback if key is unknown or removed config
                            if (!config) return null;

                            return (
                                <div key={key} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center gap-4 flex-1">
                                        {/* Reorder Controls */}
                                        <div className="flex flex-col gap-1">
                                            <button
                                                disabled={index === 0}
                                                onClick={() => moveSection(index, 'up')}
                                                className={`p-1 rounded hover:bg-gray-100 transition-colors ${index === 0 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-blue-600'
                                                    }`}
                                                title="Move Up"
                                            >
                                                <ArrowUp size={18} />
                                            </button>
                                            <button
                                                disabled={index === sectionOrder.length - 1}
                                                onClick={() => moveSection(index, 'down')}
                                                className={`p-1 rounded hover:bg-gray-100 transition-colors ${index === sectionOrder.length - 1 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-blue-600'
                                                    }`}
                                                title="Move Down"
                                            >
                                                <ArrowDown size={18} />
                                            </button>
                                        </div>

                                        <div className="pl-2">
                                            <h3 className="text-base font-bold text-gray-900 mb-1">{config.label}</h3>
                                            <p className="text-sm text-gray-500">{config.description}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pl-8 border-l border-gray-100 ml-4">
                                        <span className={`text-xs font-semibold uppercase tracking-wider w-16 text-right ${settings[key] ? 'text-green-600' : 'text-gray-400'}`}>
                                            {settings[key] ? 'Visible' : 'Hidden'}
                                        </span>

                                        <button
                                            onClick={() => toggleSetting(key)}
                                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${settings[key] ? 'bg-blue-600' : 'bg-gray-200'
                                                }`}
                                        >
                                            <span
                                                className={`${settings[key] ? 'translate-x-6' : 'translate-x-1'
                                                    } inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageSettings;
