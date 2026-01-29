import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/authorize.js';
import express from 'express';

const prisma = new PrismaClient();
const router = express.Router();

// GET /api/initiatives - Get all initiatives (published for public, all for admin)
import { optionalAuth } from '../middleware/auth.js';

router.get('/', optionalAuth, async (req, res, next) => {
    try {
        const { year, status } = req.query;
        let where = {};

        // If not admin, only show published
        if (!req.user?.isAdmin) {
            where.status = 'published';
        } else if (status) {
            // Admin can filter by status
            where.status = status;
        }

        if (year) {
            const startDate = new Date(`${year}-01-01`);
            const endDate = new Date(`${year}-12-31`);
            where.createdAt = {
                gte: startDate,
                lte: endDate
            };
        }

        const initiatives = await prisma.initiative.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        res.json(initiatives);
    } catch (error) {
        next(error);
    }
});

// GET /api/initiatives/:id - Get single initiative
router.get('/:id', async (req, res, next) => {
    try {
        const initiative = await prisma.initiative.findUnique({
            where: { id: req.params.id }
        });

        if (!initiative) {
            return res.status(404).json({ error: 'Initiative not found' });
        }

        res.json(initiative);
    } catch (error) {
        next(error);
    }
});

// POST /api/initiatives - Create initiative (admin only)
// POST /api/initiatives
import { upload, uploadToSupabase } from '../utils/uploadHelper.js';

router.post('/', authenticate, requireAdmin, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'document', maxCount: 1 }]), async (req, res, next) => {
    try {
        let imageUrl = req.body.imageUrl;
        let documentUrl = req.body.documentUrl;

        if (req.files?.image?.[0]) {
            imageUrl = await uploadToSupabase(req.files.image[0], 'uploads', 'initiatives/images');
        }
        if (req.files?.document?.[0]) {
            documentUrl = await uploadToSupabase(req.files.document[0], 'uploads', 'initiatives/documents');
        }

        const initiative = await prisma.initiative.create({
            data: {
                ...req.body,
                imageUrl,
                documentUrl,
                createdBy: req.user.userId
            }
        });

        res.status(201).json(initiative);
    } catch (error) {
        next(error);
    }
});

// PUT /api/initiatives/:id - Update initiative (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res, next) => {
    try {
        const initiative = await prisma.initiative.update({
            where: { id: req.params.id },
            data: req.body
        });

        res.json(initiative);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/initiatives/:id - Delete initiative (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
    try {
        await prisma.initiative.delete({
            where: { id: req.params.id }
        });

        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default router;
