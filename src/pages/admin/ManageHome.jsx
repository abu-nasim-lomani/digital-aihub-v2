import { useEffect, useState } from 'react';
import { settingsAPI, uploadFile, uploadAPI } from '../../utils/api';
import { Save, Layout, Image as ImageIcon, Type, Upload, Trash2, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageHome = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [loadingImages, setLoadingImages] = useState(false);
    const [content, setContent] = useState({
        main_tag: '',
        main_title: '',
        main_desc: '',
        mission_title: '',
        mission_desc: '',
        vision_title: '',
        vision_desc: '',
        mission_image: ''
    });

    useEffect(() => {
        fetchSettings();
        fetchUploadedImages();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const keys = ['main_tag', 'main_title', 'main_desc', 'mission_title', 'mission_desc', 'vision_title', 'vision_desc', 'mission_image'];
            const promises = keys.map(key => settingsAPI.get(key).catch(() => ({ data: { value: '' } })));
            const results = await Promise.all(promises);

            const newContent = {};
            keys.forEach((key, index) => {
                const val = results[index].data?.value;
                newContent[key] = (val === true) ? '' : (val || '');
            });

            // Set defaults if empty
            if (!newContent.main_tag) newContent.main_tag = 'Our Vision';
            if (!newContent.main_title) newContent.main_title = 'Driving Digital Transformation';
            if (!newContent.main_desc) newContent.main_desc = 'We envision a future where technology empowers every citizen, bridges the digital divide, and accelerates sustainable development goals across Bangladesh.';
            // Fixed titles are not needed in content state if not used, but keeping for legacy safety or just ignoring them.
            if (!newContent.mission_desc) newContent.mission_desc = 'Accelerate people-centered digital transformation through innovation, capacity building, and strategic support.';

            if (!newContent.vision_desc) newContent.vision_desc = 'Serve as a catalyst for digital innovation, ensuring technology creates equitable opportunities for all.';
            if (!newContent.mission_image) newContent.mission_image = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=75';

            setContent(newContent);
        } catch (error) {
            console.error('Error fetching home content:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch uploaded images
    const fetchUploadedImages = async () => {
        try {
            setLoadingImages(true);
            const response = await uploadAPI.list('home');
            setUploadedImages(response.data.files || []);
        } catch (error) {
            console.error('Error fetching uploaded images:', error);
        } finally {
            setLoadingImages(false);
        }
    };

    // Delete an uploaded image
    const handleDeleteImage = async (filename) => {
        // Check if this is the currently used image
        const baseURL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3001';
        const imageUrl = `${baseURL}/uploads/home/${filename}`;

        if (content.mission_image.includes(filename)) {
            alert('Cannot delete the currently used image. Please select a different image first.');
            return;
        }

        if (!confirm(`Are you sure you want to delete ${filename}?`)) {
            return;
        }

        try {
            await uploadAPI.delete('home', filename);
            alert('Image deleted successfully!');
            // Refresh the image list
            fetchUploadedImages();
        } catch (error) {
            console.error('Error deleting image:', error);
            alert(error.response?.data?.error || 'Failed to delete image');
        }
    };

    // Select an existing image from gallery
    const handleSelectImage = (imageUrl) => {
        const baseURL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3001';
        const fullUrl = `${baseURL}${imageUrl}`;
        setContent(prev => ({ ...prev, mission_image: fullUrl }));
        alert('Image selected! Don\'t forget to click "Save Changes"');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setContent(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('Only image files are allowed (JPEG, PNG, GIF, WebP)');
            e.target.value = ''; // Reset input
            return;
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            alert('File size must be less than 10MB');
            e.target.value = ''; // Reset input
            return;
        }

        try {
            setUploading(true);
            const response = await uploadFile(file, 'home'); // Upload to 'home' folder

            if (response && response.url) {
                // Construct full URL - uploads are served from root, not /api
                // VITE_API_BASE_URL is like "http://localhost:3001/api"
                // But uploads are at "http://localhost:3001/uploads"
                // So we need to remove /api from the base URL
                const apiBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
                const baseURL = apiBaseURL.replace('/api', ''); // Remove /api to get server root
                const fullUrl = response.url.startsWith('http') ? response.url : `${baseURL}${response.url}`;

                console.log('📸 Uploaded image URL:', fullUrl);
                setContent(prev => ({ ...prev, mission_image: fullUrl }));
                alert('Image uploaded successfully!');
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert(error.message || 'Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const promises = Object.keys(content).map(key =>
                settingsAPI.update(key, content[key])
            );
            await Promise.all(promises);
            alert('Home content updated successfully!');
        } catch (error) {
            console.error('Error saving content:', error);
            alert('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <Layout size={28} />
                            </div>
                            Home Page Content
                        </h1>
                        <p className="text-gray-500 mt-2 ml-14">Manage "Mission & Purpose" section content.</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg shadow-blue-500/30"
                    >
                        {saving ? <LoadingSpinner size="sm" color="white" /> : <Save size={20} />}
                        Save Changes
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Text Content */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Main Title Section */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Type size={20} className="text-blue-500" />
                                Main Heading & Description
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Section Tag (Badge)</label>
                                    <input
                                        type="text"
                                        name="main_tag"
                                        value={content.main_tag}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-blue-600 font-medium"
                                        placeholder="e.g. Our Vision"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Main Heading</label>
                                    <input
                                        type="text"
                                        name="main_title"
                                        value={content.main_title}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none font-bold"
                                        placeholder="e.g. Driving Digital Transformation"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Main Description</label>
                                    <textarea
                                        name="main_desc"
                                        rows={3}
                                        value={content.main_desc}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none resize-none"
                                        placeholder="e.g. We envision a future where..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Mission Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Type size={20} className="text-blue-500" />
                                Mission Card
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    {/* <h3 className="text-sm font-bold text-gray-900 mb-1">Our Mission</h3> */}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Entire Mission Statement</label>
                                    <textarea
                                        name="mission_desc"
                                        rows={3}
                                        value={content.mission_desc}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none resize-none"
                                        placeholder="Enter mission statement..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Purpose Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Type size={20} className="text-blue-500" />
                                Purpose Card (Prev. Vision)
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    {/* <h3 className="text-sm font-bold text-gray-900 mb-1">Our Purpose</h3> */}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Entire Purpose Statement</label>
                                    <textarea
                                        name="vision_desc"
                                        rows={3}
                                        value={content.vision_desc}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none resize-none"
                                        placeholder="Enter purpose statement..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Image */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <ImageIcon size={20} className="text-blue-500" />
                                Section Image
                            </h2>

                            <div className="space-y-4">
                                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative group">
                                    {content.mission_image ? (
                                        <img src={content.mission_image} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <ImageIcon size={32} />
                                        </div>
                                    )}

                                    {/* Uploading Overlay */}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                            <div className="text-white flex flex-col items-center gap-2">
                                                <LoadingSpinner size="md" color="white" />
                                                <span className="text-sm font-bold">Uploading...</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Overlay for upload */}
                                    {!uploading && (
                                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                            <div className="text-white flex flex-col items-center gap-2">
                                                <Upload size={24} />
                                                <span className="text-xs font-bold">Change Image</span>
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        </label>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Or Image URL</label>
                                    <input
                                        type="text"
                                        name="mission_image"
                                        value={content.mission_image}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                        placeholder="https://..."
                                    />
                                </div>
                                <p className="text-xs text-gray-500">
                                    This image will be displayed alongside the Mission/Purpose text on the home page.
                                </p>

                                {/* Uploaded Images Gallery */}
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <ImageIcon size={16} className="text-blue-500" />
                                        Uploaded Images ({uploadedImages.length})
                                    </h3>

                                    {loadingImages ? (
                                        <div className="flex items-center justify-center py-8">
                                            <LoadingSpinner size="sm" />
                                        </div>
                                    ) : uploadedImages.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-8">
                                            No images uploaded yet. Upload your first image above!
                                        </p>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-4">
                                            {uploadedImages.map((image) => {
                                                const isCurrentImage = content.mission_image.includes(image.filename);
                                                const baseURL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3001';
                                                const fullImageUrl = `${baseURL}${image.url}`;

                                                return (
                                                    <div
                                                        key={image.filename}
                                                        className={`relative group rounded-lg overflow-hidden border-2 transition-all ${isCurrentImage
                                                            ? 'border-green-500 ring-2 ring-green-200'
                                                            : 'border-gray-200 hover:border-blue-300'
                                                            }`}
                                                    >
                                                        {/* Image */}
                                                        <div
                                                            className="aspect-video bg-gray-100 cursor-pointer"
                                                            onClick={() => handleSelectImage(image.url)}
                                                            title="Click to select this image"
                                                        >
                                                            <img
                                                                src={fullImageUrl}
                                                                alt={image.filename}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>

                                                        {/* Current Image Badge */}
                                                        {isCurrentImage && (
                                                            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold shadow-lg">
                                                                <CheckCircle size={12} />
                                                                Current
                                                            </div>
                                                        )}

                                                        {/* Delete Button */}
                                                        <button
                                                            onClick={() => handleDeleteImage(image.filename)}
                                                            disabled={isCurrentImage}
                                                            className={`absolute top-2 right-2 p-1.5 rounded-md transition-all ${isCurrentImage
                                                                ? 'bg-gray-400 cursor-not-allowed opacity-50'
                                                                : 'bg-red-500 hover:bg-red-600 opacity-0 group-hover:opacity-100'
                                                                } text-white shadow-lg`}
                                                            title={isCurrentImage ? 'Cannot delete current image' : 'Delete image'}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>

                                                        {/* Image Info */}
                                                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <p className="text-xs truncate font-medium">{image.filename}</p>
                                                            <p className="text-xs text-gray-300">
                                                                {(image.size / 1024).toFixed(1)} KB
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageHome;
