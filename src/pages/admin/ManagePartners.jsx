import { useState, useEffect, useRef } from 'react';
import { partnerAPI } from '../../utils/api';
import { Plus, Edit, Trash2, Star, Search, Building2, Upload, X } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManagePartners = () => {
    const [loading, setLoading] = useState(true);
    const [partners, setPartners] = useState([]);
    const [filteredPartners, setFilteredPartners] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingPartner, setEditingPartner] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        logo: '',
        category: 'Government',
        description: '',
        website: '',
        email: '',
        contactPerson: '',
        partnershipType: '',
        startDate: '',
        isFeatured: false,
        displayOrder: 0,
        focusAreas: [],
        status: 'published'
    });

    const categories = [
        'Technology Partner',
        'Academic Institution',
        'Government Body',
        'Global Organization',
        'Startup Community',
        'Corporate Sponsor',
        'Research Institute'
    ];

    const partnershipTypes = [
        'Strategic Partnership',
        'Research & Development',
        'Capacity Building',
        'Technical Integration',
        'Funding & Grants',
        'Event Collaboration',
        'Ecosystem Development'
    ];

    // Derive dynamic categories from existing partners + fixed list
    const dynamicCategories = Array.from(new Set([
        ...categories,
        ...partners.map(p => p.category).filter(Boolean)
    ])).sort();

    // Derive dynamic partnership types
    const dynamicPartnershipTypes = Array.from(new Set([
        ...partnershipTypes,
        ...partners.map(p => p.partnershipType).filter(Boolean)
    ])).sort();

    useEffect(() => {
        fetchPartners();
    }, []);

    useEffect(() => {
        filterPartners();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [partners, searchTerm, categoryFilter]);

    const fetchPartners = async () => {
        try {
            setLoading(true);
            const response = await partnerAPI.getAll();
            setPartners(response.data.partners || []);
        } catch (error) {
            console.error('Fetch partners error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterPartners = () => {
        let filtered = partners;

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(p => p.category === categoryFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredPartners(filtered);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let payload = formData;

            // Create FormData if file is selected or we're sending complex data
            // We use FormData always for consistency if that works, or only if file exists
            // But since we modified controller to parse JSON strings, we can use FormData always or conditionally

            if (logoFile) {
                const data = new FormData();
                Object.keys(formData).forEach(key => {
                    // Skip logo field if uploading file to avoid backend array conflict
                    if (key === 'logo' && logoFile) return;

                    if (key === 'focusAreas') {
                        data.append(key, JSON.stringify(formData[key]));
                    } else if (formData[key] !== null && formData[key] !== undefined) {
                        data.append(key, formData[key]);
                    }
                });
                data.append('logoFile', logoFile);
                payload = data;
            }

            if (editingPartner) {
                await partnerAPI.update(editingPartner.id, payload);
            } else {
                await partnerAPI.create(payload);
            }
            fetchPartners();
            handleCloseModal();
        } catch (error) {
            console.error('Save partner error:', error);
            alert(error.response?.data?.error || 'Failed to save partner');
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Delete partner "${name}"?`)) {
            try {
                await partnerAPI.delete(id);
                fetchPartners();
            } catch (error) {
                console.error('Delete error:', error);
                alert('Failed to delete partner');
            }
        }
    };

    const handleToggleFeatured = async (partner) => {
        try {
            await partnerAPI.toggleFeatured(partner.id);
            fetchPartners();
        } catch (error) {
            console.error('Toggle featured error:', error);
        }
    };

    const handleEdit = (partner) => {
        setEditingPartner(partner);
        setFormData({
            name: partner.name || '',
            logo: partner.logo || '', // This defaults to URL string
            category: partner.category || 'Government',
            description: partner.description || '',
            website: partner.website || '',
            email: partner.email || '',
            contactPerson: partner.contactPerson || '',
            partnershipType: partner.partnershipType || '',
            startDate: partner.startDate ? partner.startDate.split('T')[0] : '',
            isFeatured: partner.isFeatured || false,
            displayOrder: partner.displayOrder || 0,
            focusAreas: partner.focusAreas || [],
            status: partner.status || 'published'
        });
        setPreviewUrl(partner.logo || '');
        setLogoFile(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingPartner(null);
        setLogoFile(null);
        setPreviewUrl('');
        setFormData({
            name: '',
            logo: '',
            category: 'Government',
            description: '',
            website: '',
            email: '',
            contactPerson: '',
            partnershipType: '',
            startDate: '',
            isFeatured: false,
            displayOrder: 0,
            focusAreas: [],
            status: 'published'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Partners</h1>
                <p className="text-gray-600">Add and manage strategic partner organizations</p>
            </div>

            {/* Filters and Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search partners..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="all">All Categories</option>
                        {dynamicCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    {/* Add Button */}
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn-primary px-6 py-2 rounded-lg flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Add Partner
                    </button>
                </div>
            </div>

            {/* Partners Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPartners.map(partner => (
                    <div key={partner.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                        {/* Logo */}
                        <div className="h-32 bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
                            {partner.logo ? (
                                <img src={partner.logo} alt={partner.name} className="max-h-full max-w-full object-contain" />
                            ) : (
                                <Building2 size={48} className="text-purple-400" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{partner.name}</h3>
                                {partner.isFeatured && (
                                    <Star size={18} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                )}
                            </div>

                            <span className="inline-block px-2 py-1 text-xs rounded-md bg-purple-100 text-purple-700 font-medium mb-2">
                                {partner.category}
                            </span>

                            {partner.description && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{partner.description}</p>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 pt-3 border-t">
                                <button
                                    onClick={() => handleToggleFeatured(partner)}
                                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${partner.isFeatured
                                        ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                        }`}
                                    title={partner.isFeatured ? 'Unfeature' : 'Feature'}
                                >
                                    <Star size={16} className={partner.isFeatured ? 'fill-current' : ''} />
                                </button>
                                <button
                                    onClick={() => handleEdit(partner)}
                                    className="flex-1 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm font-semibold flex items-center justify-center gap-1"
                                >
                                    <Edit size={16} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(partner.id, partner.name)}
                                    className="px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredPartners.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No partners found
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-2xl font-bold mb-6">
                            {editingPartner ? 'Edit Partner' : 'Add New Partner'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Partner Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2">Category *</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-grow">
                                            <input
                                                type="text"
                                                required
                                                list="category-options"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                                placeholder="Select or type new category"
                                            />
                                            <datalist id="category-options">
                                                {dynamicCategories.map(cat => (
                                                    <option key={cat} value={cat} />
                                                ))}
                                            </datalist>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Logo</label>
                                <div className="flex gap-4 items-start">
                                    {/* Preview Area */}
                                    <div
                                        onClick={() => fileInputRef.current.click()}
                                        className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors overflow-hidden bg-white relative group"
                                    >
                                        {previewUrl ? (
                                            <>
                                                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Upload className="text-white" size={24} />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-1 text-gray-400">
                                                <Upload size={24} />
                                                <span className="text-xs">Upload</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Inputs */}
                                    <div className="flex-1 space-y-3">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />

                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current.click()}
                                                className="text-sm px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-medium transition-colors border border-purple-100 flex items-center gap-2"
                                            >
                                                <Upload size={16} />
                                                Choose File
                                            </button>
                                            <p className="text-xs text-gray-500 mt-1">Supported formats: JPG, PNG, WEBP</p>
                                        </div>

                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-400 text-sm">Or</span>
                                            </div>
                                            <input
                                                type="url"
                                                value={formData.logo}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, logo: e.target.value });
                                                    if (!logoFile) setPreviewUrl(e.target.value);
                                                }}
                                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 text-sm bg-gray-50 focus:bg-white transition-colors"
                                                placeholder="Paste image URL here..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    rows="3"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Website</label>
                                    <input
                                        type="url"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Contact Person</label>
                                    <input
                                        type="text"
                                        value={formData.contactPerson}
                                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2">Partnership Type</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            list="part-type-options"
                                            value={formData.partnershipType}
                                            onChange={(e) => setFormData({ ...formData, partnershipType: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                            placeholder="Select or type custom type"
                                        />
                                        <datalist id="part-type-options">
                                            {dynamicPartnershipTypes.map(type => (
                                                <option key={type} value={type} />
                                            ))}
                                        </datalist>
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2">Display Order</label>
                                    <input
                                        type="number"
                                        value={formData.displayOrder}
                                        onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isFeatured}
                                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                    />
                                    <span className="text-sm font-semibold">Featured Partner</span>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 btn-primary px-4 py-2 rounded-lg"
                                >
                                    {editingPartner ? 'Update' : 'Create'} Partner
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagePartners;
