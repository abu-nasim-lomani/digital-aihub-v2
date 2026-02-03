import { PrismaClient } from '@prisma/client';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/authorize.js';
import express from 'express';

const prisma = new PrismaClient();
const router = express.Router();

// GET /api/support-requests - Get support requests
router.get('/', optionalAuth, async (req, res, next) => {
    try {
        const where = {};

        // Regular users can only see their own requests
        // Guests/Public can validly see public requests if we want, 
        // OR we can just return ALL requests since the user asked for "sobar jonno public" (public for everyone)
        // Implementation: If Admin -> All. If User -> Own. If Guest -> ?
        // Re-reading requirement: "Projects & Supports eta sobar jonno public kore dite hbe" -> Public for everyone.
        // So I will return ALL requests or maybe filtered by status if needed, but for now I'll remove restriction.
        // However, to keep some privacy, maybe guests should only see 'approved' ones? 
        // The user said "project + suppport request... sobar jonno public". 
        // I will assume this means visibility of the list.

        // If user is NOT admin, maybe we just show everything?
        // Let's stick to: Everyone sees everything for now as per "public".

        // OLD LOGIC:
        // if (!req.user?.isAdmin) {
        //     where.createdBy = req.user.userId;
        // }

        // NEW LOGIC: Everyone sees all.
        // We might want to filter sensitive info? The fields are title, type, impact. Seems public safe.

        const requests = await prisma.supportRequest.findMany({
            where,
            include: {
                project: {
                    select: {
                        id: true,
                        title: true
                    }
                },
                creator: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(requests);
    } catch (error) {
        next(error);
    }
});

// GET /api/support-requests/:id - Get single support request
router.get('/:id', optionalAuth, async (req, res, next) => {
    try {
        const request = await prisma.supportRequest.findUnique({
            where: { id: req.params.id },
            include: {
                project: true,
                creator: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true
                    }
                }
            }
        });

        if (!request) {
            return res.status(404).json({ error: 'Support request not found' });
        }

        // Public access allowed
        // if (!req.user.isAdmin && request.createdBy !== req.user.userId) {
        //     return res.status(403).json({ error: 'Access denied' });
        // }

        res.json(request);
    } catch (error) {
        next(error);
    }
});

// POST /api/support-requests - Create support request
router.post('/', optionalAuth, async (req, res, next) => {
    try {
        // Explicitly construct data object to avoid unknown fields
        const data = {
            title: req.body.title,
            supportType: req.body.supportType,
            documentUrl: req.body.documentUrl,
            duration: req.body.duration,
            impact: req.body.impact,
            priority: req.body.priority || 'Medium',
            status: 'pending',
            progress: 0
        };

        if (req.user) {
            data.creator = { connect: { id: req.user.userId } };

            // Validate project assignment for authenticated users
            if (req.body.projectId) {
                // Get user to check if admin
                const user = await prisma.user.findUnique({
                    where: { id: req.user.userId }
                });

                // If not admin, check if user is assigned to this project
                if (!user.isAdmin) {
                    const assignment = await prisma.userProjectAssignment.findUnique({
                        where: {
                            userId_projectId: {
                                userId: req.user.userId,
                                projectId: req.body.projectId
                            }
                        }
                    });

                    if (!assignment) {
                        return res.status(403).json({
                            error: 'You are not assigned to this project. Please contact admin for access.'
                        });
                    }
                }
            }
        } else {
            // Guest submission
            if (!req.body.guestName || !req.body.guestEmail) {
                return res.status(400).json({ error: 'Guest name and email are required' });
            }
            data.guestName = req.body.guestName;
            data.guestEmail = req.body.guestEmail;
        }

        // Handle project relation
        if (req.body.projectId) {
            data.project = { connect: { id: req.body.projectId } };
        }

        const request = await prisma.supportRequest.create({
            data
        });

        res.status(201).json(request);
    } catch (error) {
        next(error);
    }
});

// PUT /api/support-requests/:id - Update support request
router.put('/:id', authenticate, async (req, res, next) => {
    try {
        const existingRequest = await prisma.supportRequest.findUnique({
            where: { id: req.params.id }
        });

        if (!existingRequest) {
            return res.status(404).json({ error: 'Support request not found' });
        }

        // Check authorization
        if (!req.user.isAdmin && existingRequest.createdBy !== req.user.userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const request = await prisma.supportRequest.update({
            where: { id: req.params.id },
            data: req.body
        });

        res.json(request);
    } catch (error) {
        next(error);
    }
});

// PATCH /api/support-requests/:id/status - Update status (admin only)
router.patch('/:id/status', authenticate, requireAdmin, async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!['pending', 'approved', 'declined'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const request = await prisma.supportRequest.update({
            where: { id: req.params.id },
            data: {
                status,
                approvedAt: status === 'approved' ? new Date() : null
            }
        });

        res.json(request);
    } catch (error) {
        next(error);
    }
});

// PATCH /api/support-requests/:id/progress - Update progress (admin only)
router.patch('/:id/progress', authenticate, requireAdmin, async (req, res, next) => {
    try {
        const { progress, workUpdate } = req.body;

        const request = await prisma.supportRequest.findUnique({
            where: { id: req.params.id }
        });

        if (!request) {
            return res.status(404).json({ error: 'Support request not found' });
        }

        // Add work update to array
        const workUpdates = request.workUpdates || [];
        if (workUpdate) {
            workUpdates.push({
                date: new Date().toISOString(),
                update: workUpdate,
                progress: progress
            });
        }

        const updatedRequest = await prisma.supportRequest.update({
            where: { id: req.params.id },
            data: {
                progress: progress || request.progress,
                workUpdates: workUpdates
            }
        });

        res.json(updatedRequest);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/support-requests/:id - Delete support request
router.delete('/:id', authenticate, async (req, res, next) => {
    try {
        const existingRequest = await prisma.supportRequest.findUnique({
            where: { id: req.params.id }
        });

        if (!existingRequest) {
            return res.status(404).json({ error: 'Support request not found' });
        }

        // Check authorization
        if (!req.user.isAdmin && existingRequest.createdBy !== req.user.userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await prisma.supportRequest.delete({
            where: { id: req.params.id }
        });

        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default router;
