import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import {
    assignUserToProject,
    unassignUserFromProject,
    getUserProjects,
    getProjectUsers
} from '../controllers/projectAssignment.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// POST /api/project-assignments - Assign user to project (admin only)
router.post('/', requireAdmin, assignUserToProject);

// DELETE /api/project-assignments - Unassign user from project (admin only)
router.delete('/', requireAdmin, unassignUserFromProject);

// GET /api/project-assignments/user/:userId - Get user's assigned projects
router.get('/user/:userId', getUserProjects);

// GET /api/project-assignments/project/:projectId - Get project's assigned users (admin only)
router.get('/project/:projectId', requireAdmin, getProjectUsers);

export default router;
