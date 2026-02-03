import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * List all files in a specific upload folder
 * @param {String} folder - Folder name (e.g., 'home', 'general')
 * @returns {Promise<Array>} - Array of file objects with details
 */
const listUploadedFiles = async (folder = 'general') => {
    try {
        const uploadsDir = path.join(__dirname, '../../uploads', folder);

        // Check if directory exists
        if (!fs.existsSync(uploadsDir)) {
            return [];
        }

        // Read directory
        const files = fs.readdirSync(uploadsDir);

        // Get file details
        const fileDetails = files.map(filename => {
            const filePath = path.join(uploadsDir, filename);
            const stats = fs.statSync(filePath);

            return {
                filename,
                path: `/uploads/${folder}/${filename}`,
                size: stats.size,
                uploadedAt: stats.birthtime,
                url: `/uploads/${folder}/${filename}`
            };
        });

        // Sort by upload date (newest first)
        fileDetails.sort((a, b) => b.uploadedAt - a.uploadedAt);

        return fileDetails;
    } catch (error) {
        console.error('Error listing files:', error);
        throw new Error('Failed to list uploaded files');
    }
};

/**
 * Delete a specific uploaded file
 * @param {String} folder - Folder name
 * @param {String} filename - File name to delete
 * @returns {Promise<Boolean>} - Success status
 */
const deleteUploadedFile = async (folder, filename) => {
    try {
        // Validate inputs
        if (!folder || !filename) {
            throw new Error('Folder and filename are required');
        }

        // Prevent directory traversal
        if (folder.includes('..') || filename.includes('..')) {
            throw new Error('Invalid folder or filename');
        }

        const filePath = path.join(__dirname, '../../uploads', folder, filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            throw new Error('File not found');
        }

        // Delete file
        fs.unlinkSync(filePath);

        console.log(`✅ Deleted file: ${filePath}`);
        return true;
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};

export {
    listUploadedFiles,
    deleteUploadedFile
};
