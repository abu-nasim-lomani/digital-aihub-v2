

import express from 'express';
import { upload, uploadToLocal } from '../utils/uploadHelper.js';
import { authenticate } from '../middleware/auth.js';
import { listUploadedFiles, deleteUploadedFile } from '../controllers/upload.controller.js';

const router = express.Router();

// POST /api/upload
router.post('/', authenticate, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const folder = req.body.folder || 'general';
        const publicUrl = await uploadToLocal(req.file, 'uploads', folder);

        // Return URL in format expected by frontend
        res.json({ url: publicUrl });
    } catch (error) {
        console.error('Upload route error:', error);
        next(error);
    }
});

// GET /api/upload/list - List all uploaded files in a folder
router.get('/list', authenticate, async (req, res, next) => {
    try {
        const folder = req.query.folder || 'general';
        const files = await listUploadedFiles(folder);

        res.json({ files });
    } catch (error) {
        console.error('List files error:', error);
        next(error);
    }
});

// DELETE /api/upload/:folder/:filename - Delete a specific file
router.delete('/:folder/:filename', authenticate, async (req, res, next) => {
    try {
        const { folder, filename } = req.params;

        // Note: Frontend already checks if image is in use before calling delete
        // So we can safely delete the file here

        // Delete the file
        await deleteUploadedFile(folder, filename);

        res.json({
            success: true,
            message: 'File deleted successfully'
        });
    } catch (error) {
        console.error('Delete file error:', error);
        if (error.message === 'File not found') {
            return res.status(404).json({ error: 'File not found' });
        }
        next(error);
    }
});

export default router;
