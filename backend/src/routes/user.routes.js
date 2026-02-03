import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import { getAllUsers, createUser, deleteUser, approveUser, updateProfile, updateUserByAdmin } from '../controllers/user.controller.js';

const router = express.Router();

// Profile route - requires authentication only
router.patch('/profile', authenticate, updateProfile);

// Admin routes - require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// GET /api/users - List all users
router.get('/', getAllUsers);

// POST /api/users - Create new user
router.post('/', createUser);

// PATCH /api/users/:id - Update any user (admin only)
router.patch('/:id', updateUserByAdmin);

// PATCH /api/users/:id/approve - Approve user
router.patch('/:id/approve', approveUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', deleteUser);

export default router;
