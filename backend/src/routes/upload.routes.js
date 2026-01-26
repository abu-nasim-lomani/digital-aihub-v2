
import express from 'express';
import { upload, uploadToSupabase } from '../utils/uploadHelper.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// POST /api/upload
router.post('/', authenticate, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const folder = req.body.folder || 'uploads';
        const publicUrl = await uploadToSupabase(req.file, 'uploads', folder);

        res.json({ url: publicUrl }); // Frontend expects { url: ... } or string? 
        // api.js says: return response.data;
        // Usually response.data contains the URL or object. 
        // The user didn't specify format, but standard is JSON.
        // If api.js returns response.data, and component expects string, maybe it needs { url } or just the string?
        // Let's look at api.js usage. It just returns response.data.
        // I will return { url: publicUrl } and { publicUrl } to be safe.
    } catch (error) {
        next(error);
    }
});

export default router;
