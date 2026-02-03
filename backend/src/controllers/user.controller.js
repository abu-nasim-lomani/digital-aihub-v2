import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                fullName: true,
                email: true,
                isAdmin: true,
                isActive: true,
                createdAt: true
                // Exclude passwordHash
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Transform to match expected format
        const transformedUsers = users.map(user => ({
            id: user.id,
            name: user.fullName || 'Unknown',
            email: user.email,
            role: user.isAdmin ? 'admin' : 'user',
            isActive: user.isActive,
            createdAt: user.createdAt
        }));

        res.json({ users: transformedUsers });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

/**
 * Create new user (admin only)
 */
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role = 'user' } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                error: 'Name, email, and password are required'
            });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Password length validation
        if (password.length < 6) {
            return res.status(400).json({
                error: 'Password must be at least 6 characters'
            });
        }

        // Role validation
        const isAdmin = role === 'admin';
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({
                error: 'Role must be either "user" or "admin"'
            });
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({
                error: 'Email already registered'
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                fullName: name,
                email,
                passwordHash,
                isAdmin: isAdmin,
                isActive: true,
                emailVerified: false
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                isAdmin: true,
                createdAt: true
                // Exclude passwordHash
            }
        });

        res.status(201).json({
            success: true,
            user: {
                id: user.id,
                name: user.fullName,
                email: user.email,
                role: user.isAdmin ? 'admin' : 'user',
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

/**
 * Delete user (admin only)
 */
export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id; // UUID string, not integer
        const currentUserId = req.user.userId; // From JWT token

        // Validate userId exists
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Prevent self-deletion
        if (userId === currentUserId) {
            return res.status(400).json({
                error: 'Cannot delete your own account'
            });
        }

        // Check if user exists
        const userToDelete = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!userToDelete) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prevent deleting last admin
        if (userToDelete.isAdmin) {
            const adminCount = await prisma.user.count({
                where: { isAdmin: true }
            });

            if (adminCount <= 1) {
                return res.status(400).json({
                    error: 'Cannot delete the last admin user'
                });
            }
        }

        // Delete user
        await prisma.user.delete({
            where: { id: userId }
        });

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

/**
 * Approve user (admin only)
 */
export const approveUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Validate userId exists
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if already active
        if (user.isActive) {
            return res.status(400).json({
                error: 'User is already active'
            });
        }

        // Approve user
        await prisma.user.update({
            where: { id: userId },
            data: { isActive: true }
        });

        res.json({
            success: true,
            message: 'User approved successfully'
        });
    } catch (error) {
        console.error('Approve user error:', error);
        res.status(500).json({ error: 'Failed to approve user' });
    }
};

/**
 * Update own profile (authenticated user)
 */
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId; // From JWT token
        const { fullName, currentPassword, newPassword } = req.body;

        // Get current user
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prepare update data
        const updateData = {};

        // Update name if provided
        if (fullName && fullName.trim()) {
            updateData.fullName = fullName.trim();
        }

        // Update password if provided
        if (newPassword) {
            // Validate new password length
            if (newPassword.length < 6) {
                return res.status(400).json({
                    error: 'New password must be at least 6 characters'
                });
            }

            // Verify current password is provided
            if (!currentPassword) {
                return res.status(400).json({
                    error: 'Current password is required to change password'
                });
            }

            // Verify current password
            const isPasswordValid = await bcrypt.compare(
                currentPassword,
                user.passwordHash
            );

            if (!isPasswordValid) {
                return res.status(400).json({
                    error: 'Current password is incorrect'
                });
            }

            // Hash new password
            updateData.passwordHash = await bcrypt.hash(newPassword, 10);
        }

        // Check if there's anything to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                error: 'No changes provided'
            });
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                fullName: true,
                email: true,
                isAdmin: true
            }
        });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.id,
                fullName: updatedUser.fullName,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

/**
 * Update any user's profile (admin only)
 */
export const updateUserByAdmin = async (req, res) => {
    try {
        const userId = req.params.id; // User ID from URL
        const { fullName, newPassword } = req.body;

        // Validate userId exists
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Get user to update
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prepare update data
        const updateData = {};

        // Update name if provided
        if (fullName && fullName.trim()) {
            updateData.fullName = fullName.trim();
        }

        // Update password if provided (admin doesn't need current password)
        if (newPassword) {
            // Validate new password length
            if (newPassword.length < 6) {
                return res.status(400).json({
                    error: 'New password must be at least 6 characters'
                });
            }

            // Hash new password
            updateData.passwordHash = await bcrypt.hash(newPassword, 10);
        }

        // Check if there's anything to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                error: 'No changes provided'
            });
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                fullName: true,
                email: true,
                isAdmin: true,
                isActive: true
            }
        });

        res.json({
            success: true,
            message: 'User updated successfully',
            user: {
                id: updatedUser.id,
                name: updatedUser.fullName,
                email: updatedUser.email,
                role: updatedUser.isAdmin ? 'admin' : 'user',
                isActive: updatedUser.isActive
            }
        });
    } catch (error) {
        console.error('Update user by admin error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};
