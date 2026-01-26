import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/authorize.js';
import express from 'express';

const prisma = new PrismaClient();
const router = express.Router();

// GET /api/standards - Get all standards
router.get('/', async (req, res, next) => {
    try {
        const { category } = req.query;
        const where = { status: 'published' };

        if (category) {
            where.category = category; // 'DPI' or 'LGI'
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
        const standard = await prisma.standard.create({
            data: req.body
        });

        res.status(201).json(standard);
    } catch (error) {
        next(error);
    }
});

// PUT /api/standards/:id - Update standard (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res, next) => {
    try {
        const standard = await prisma.standard.update({
            where: { id: req.params.id },
            data: req.body
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
