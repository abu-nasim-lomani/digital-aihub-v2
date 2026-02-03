import express from 'express';
import prisma from '../config/database.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/authorize.js';

const router = express.Router();

// GET /api/projects
router.get('/', optionalAuth, async (req, res, next) => {
    try {
        const where = req.user?.isAdmin ? {} : { status: 'published' };

        const projects = await prisma.project.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        res.json(projects);
    } catch (error) {
        next(error);
    }
});

// GET /api/projects/my - Get projects for current user (assigned projects for users, all for admins)
router.get('/my', authenticate, async (req, res, next) => {
    try {
        const userId = req.user.userId;

        // Get user to check if admin
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        let projects;

        if (user.isAdmin) {
            // Admin sees all published projects
            projects = await prisma.project.findMany({
                where: { status: 'published' },
                orderBy: { createdAt: 'desc' }
            });
        } else {
            // Regular user sees only assigned projects
            const assignments = await prisma.userProjectAssignment.findMany({
                where: { userId },
                include: {
                    project: true
                }
            });

            // Filter only published projects
            projects = assignments
                .map(a => a.project)
                .filter(p => p.status === 'published');
        }

        res.json(projects);
    } catch (error) {
        next(error);
    }
});

// GET /api/projects/:id
router.get('/:id', async (req, res, next) => {
    try {
        const project = await prisma.project.findUnique({
            where: { id: req.params.id }
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        next(error);
    }
});

// POST /api/projects
import { upload, uploadToSupabase } from '../utils/uploadHelper.js';

router.post('/', authenticate, requireAdmin, upload.single('image'), async (req, res, next) => {
    try {
        let imageUrl = req.body.imageUrl;
        if (req.file) {
            imageUrl = await uploadToSupabase(req.file, 'uploads', 'projects');
        }

        const project = await prisma.project.create({
            data: {
                ...req.body,
                imageUrl,
                createdBy: req.user.userId
            }
        });

        res.status(201).json(project);
    } catch (error) {
        next(error);
    }
});

// PUT /api/projects/:id
router.put('/:id', authenticate, requireAdmin, async (req, res, next) => {
    try {
        const project = await prisma.project.update({
            where: { id: req.params.id },
            data: req.body
        });

        res.json(project);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/projects/:id
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
    try {
        await prisma.project.delete({
            where: { id: req.params.id }
        });

        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default router;
