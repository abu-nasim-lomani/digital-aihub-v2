
// import { supabase } from '../config/supabase.js'; // Removed: Migrated to PostgreSQL
import multer from 'multer';

// Use memory storage for multer so we can access the buffer
const storage = multer.memoryStorage();

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});

/**
 * Uploads a file to Supabase Storage
 * @param {Object} file - The file object from multer (req.file)
 * @param {String} bucket - The bucket name (default: 'uploads')
 * @param {String} folder - Optional folder path
 * @returns {Promise<String>} - Public URL of the uploaded file
 */
export const uploadToSupabase = async (file, bucket = 'uploads', folder = '') => {
    try {
        if (!file) {
            throw new Error('No file provided');
        }

        const timestamp = Date.now();
        // Sanitize filename
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        const filePath = folder ? `${folder}/${timestamp}_${safeName}` : `${timestamp}_${safeName}`;

        const { error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (error) {
            console.error('Supabase Upload Error:', error);
            throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Upload Helper Error:', error.message);
        throw error;
    }
};
