import express from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { upload } from '../utils/uploadHelper.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import {
    getAllPartners,
    getFeaturedPartners,
    getPartnerById,
    createPartner,
    updatePartner,
    deletePartner,
    toggleFeatured
} from '../controllers/partner.controller.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getAllPartners);
router.get('/featured', getFeaturedPartners);
router.get('/:id', getPartnerById);

// Admin routes
router.post('/', authenticate, requireAdmin, upload.single('logoFile'), createPartner);
router.put('/:id', authenticate, requireAdmin, upload.single('logoFile'), updatePartner);
router.delete('/:id', authenticate, requireAdmin, deletePartner);
router.patch('/:id/featured', authenticate, requireAdmin, toggleFeatured);

export default router;
