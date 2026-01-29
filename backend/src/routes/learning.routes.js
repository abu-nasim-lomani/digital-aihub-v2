import { PrismaClient } from '@prisma/client';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/authorize.js';
import express from 'express';

const prisma = new PrismaClient();
const router = express.Router();

// GET /api/learning - Get all learning modules
router.get('/', optionalAuth, async (req, res, next) => {
    try {
        const where = {};

        // If not admin, only show published
        if (!req.user?.isAdmin) {
            where.status = 'published';
        }

        const modules = await prisma.learningModule.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        res.json(modules);
    } catch (error) {
        next(error);
    }
});

// GET /api/learning/:id - Get single learning module
router.get('/:id', async (req, res, next) => {
    try {
        const module = await prisma.learningModule.findUnique({
            where: { id: req.params.id }
        });

        if (!module) {
            return res.status(404).json({ error: 'Learning module not found' });
        }

        res.json(module);
    } catch (error) {
        next(error);
    }
});

// POST /api/learning - Create learning module (admin only)
router.post('/', authenticate, requireAdmin, async (req, res, next) => {
    try {
        const module = await prisma.learningModule.create({
            data: req.body
        });

        res.status(201).json(module);
    } catch (error) {
        next(error);
    }
});

// PUT /api/learning/:id - Update learning module (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res, next) => {
    try {
        const module = await prisma.learningModule.update({
            where: { id: req.params.id },
            data: req.body
        });

        res.json(module);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/learning/:id - Delete learning module (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
    try {
        await prisma.learningModule.delete({
            where: { id: req.params.id }
        });

        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default router;
