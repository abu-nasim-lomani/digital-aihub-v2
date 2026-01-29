import { PrismaClient } from '@prisma/client';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/authorize.js';
import express from 'express';

const prisma = new PrismaClient();
const router = express.Router();

// GET /api/events - Get all events
// GET /api/events - Get all events
router.get('/', optionalAuth, async (req, res, next) => {
    try {
        const { type, year } = req.query;
        const where = {};

        // Filter for non-admins
        if (!req.user?.isAdmin) {
            where.status = { in: ['upcoming', 'completed', 'published'] };
        }

        if (type) {
            where.type = type;
        }

        if (year) {
            const startDate = new Date(`${year}-01-01`);
            const endDate = new Date(`${year}-12-31`);
            where.date = {
                gte: startDate,
                lte: endDate
            };
        }

        const events = await prisma.event.findMany({
            where,
            orderBy: { date: 'desc' }
        });

        res.json(events);
    } catch (error) {
        next(error);
    }
});

// GET /api/events/:id - Get single event
router.get('/:id', async (req, res, next) => {
    try {
        const event = await prisma.event.findUnique({
            where: { id: req.params.id }
        });

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json(event);
    } catch (error) {
        next(error);
    }
});

// POST /api/events - Create event (admin only)
// POST /api/events - Create event (admin only)
router.post('/', authenticate, requireAdmin, async (req, res, next) => {
    try {
        // Remove id if present (frontend might send id: null)
        const { id, ...rest } = req.body;

        if (rest.date) {
            rest.date = new Date(rest.date).toISOString();
        }

        const event = await prisma.event.create({
            data: {
                ...rest,
                createdBy: req.user.userId
            }
        });

        res.status(201).json(event);
    } catch (error) {
        next(error);
    }
});

// PUT /api/events/:id - Update event (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res, next) => {
    try {
        // Remove id to avoid trying to update key or handle mismatch
        const { id, ...rest } = req.body;

        if (rest.date) {
            rest.date = new Date(rest.date).toISOString();
        }

        const event = await prisma.event.update({
            where: { id: req.params.id },
            data: rest
        });

        res.json(event);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/events/:id - Delete event (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
    try {
        await prisma.event.delete({
            where: { id: req.params.id }
        });

        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default router;
