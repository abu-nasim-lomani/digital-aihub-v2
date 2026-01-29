import { PrismaClient } from '@prisma/client';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/authorize.js';
import express from 'express';

const prisma = new PrismaClient();
const router = express.Router();

// GET /api/standards - Get all standards
router.get('/', optionalAuth, async (req, res, next) => {
    try {
        const { category } = req.query;
        const where = {};

        // Filter for non-admins
        if (!req.user?.isAdmin) {
            where.status = 'published';
        }

        if (category) {
            where.category = category;
        }

        const standards = await prisma.standard.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        res.json(standards);
    } catch (error) {
        next(error);
    }
});

// GET /api/standards/:id - Get single standard
router.get('/:id', async (req, res, next) => {
    try {
        const standard = await prisma.standard.findUnique({
            where: { id: req.params.id }
        });

        if (!standard) {
            return res.status(404).json({ error: 'Standard not found' });
        }

        res.json(standard);
    } catch (error) {
        next(error);
    }
});

// POST /api/standards - Create standard (admin only)
router.post('/', authenticate, requireAdmin, async (req, res, next) => {
    try {
        const { id: _id, ...rest } = req.body;

        const standard = await prisma.standard.create({
            data: {
                ...rest,
                status: rest.status || 'pending'
            }
        });

        res.status(201).json(standard);
    } catch (error) {
        next(error);
    }
});

// PUT /api/standards/:id - Update standard (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res, next) => {
    try {
        const { id: _id, ...rest } = req.body;

        const standard = await prisma.standard.update({
            where: { id: req.params.id },
            data: rest
        });

        res.json(standard);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/standards/:id - Delete standard (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
    try {
        await prisma.standard.delete({
            where: { id: req.params.id }
        });

        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default router;
