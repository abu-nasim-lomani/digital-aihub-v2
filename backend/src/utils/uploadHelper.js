import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import path from 'path';
import config from '../config/env.js';

// Initialize Supabase client
const supabase = createClient(config.supabaseUrl, config.supabaseKey);

// Use memory storage for multer so we can access the buffer
const storage = multer.memoryStorage();

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images and documents
        const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|ppt|pptx|doc|docx/;

        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

        if (extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images and documents (pdf, ppt, doc) are allowed'));
        }
    }
});

/**
 * Uploads a file to Supabase Storage
 * @param {Object} file - The file object from multer (req.file)
 * @param {String} bucket - Supabase bucket name (default from config)
 * @param {String} folder - Subfolder within bucket (default: 'general')
 * @returns {Promise<String>} - Public URL of the uploaded file
 */
export const uploadToSupabase = async (file, bucket = config.supabaseBucket, folder = 'general') => {
    try {
        if (!file) {
            throw new Error('No file provided');
        }

        const timestamp = Date.now();
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        const filename = `${folder}/${timestamp}_${safeName}`;

        const { error } = await supabase.storage
            .from(bucket)
            .upload(filename, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (error) {
            throw error;
        }

        const { data: publicData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filename);

        return publicData.publicUrl;
    } catch (error) {
        console.error('Supabase Upload Error:', error.message);
        throw error;
    }
};

// Alias for backward compatibility (formerly uploadToLocal)
export const uploadToLocal = uploadToSupabase;
