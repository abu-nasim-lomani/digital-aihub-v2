import { PrismaClient } from '@prisma/client';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/authorize.js';
import express from 'express';

const prisma = new PrismaClient();
const router = express.Router();

// GET /api/team - Get all team members
router.get('/', optionalAuth, async (req, res, next) => {
    try {
        const { section } = req.query;
        const where = {};

        // Filter for non-admins
        if (!req.user?.isAdmin) {
            where.status = 'published';
        }

        if (section) {
            where.section = section;
        }

        const team = await prisma.team.findMany({
            where,
            orderBy: { displayOrder: 'asc' }
        });

        res.json(team);
    } catch (error) {
        next(error);
    }
});

// GET /api/team/:id - Get single team member
router.get('/:id', async (req, res, next) => {
    try {
        const member = await prisma.team.findUnique({
            where: { id: req.params.id }
        });

        if (!member) {
            return res.status(404).json({ error: 'Team member not found' });
        }

        res.json(member);
    } catch (error) {
        next(error);
    }
});

// POST /api/team - Create team member (admin only)
router.post('/', authenticate, requireAdmin, async (req, res, next) => {
    try {
        const { id: _id, ...rest } = req.body;

        const member = await prisma.team.create({
            data: {
                ...rest,
                status: rest.status || 'pending',
                displayOrder: rest.displayOrder ? parseInt(rest.displayOrder) : 0
            }
        });

        res.status(201).json(member);
    } catch (error) {
        next(error);
    }
});

// PUT /api/team/:id - Update team member (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res, next) => {
    try {
        const { id: _id, ...rest } = req.body;

        // Ensure displayOrder is an integer if present
        if (rest.displayOrder !== undefined) {
            rest.displayOrder = parseInt(rest.displayOrder);
        }

        const member = await prisma.team.update({
            where: { id: req.params.id },
            data: rest
        });

        res.json(member);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/team/:id - Delete team member (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
    try {
        await prisma.team.delete({
            where: { id: req.params.id }
        });

        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default router;
