import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import config from '../config/env.js';

const prisma = new PrismaClient();

// Generate JWT token
const generateToken = (userId, email, isAdmin) => {
    return jwt.sign(
        { userId, email, isAdmin },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
    );
};

// POST /api/auth/signup
export const signup = async (req, res, next) => {
    try {
        const { email, password, fullName } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                fullName: fullName || null,
                isAdmin: false,
                isActive: false,  // Pending admin approval
                emailVerified: false
            }
        });

        res.status(201).json({
            message: 'Account created successfully. Please wait for admin approval before logging in.',
            requiresApproval: true,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                isAdmin: user.isAdmin,
                isActive: user.isActive
            }
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                projectAssignments: {
                    select: { projectId: true }
                }
            }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                error: 'Your account is pending admin approval. Please wait for approval before logging in.'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
        });

        // Generate token
        const token = generateToken(user.id, user.email, user.isAdmin);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                isAdmin: user.isAdmin,
                assignedProjectIds: (user.projectAssignments || []).map(a => a.projectId)
            }
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/auth/me
export const me = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                fullName: true,
                isAdmin: true,
                emailVerified: true,
                createdAt: true,
                projectAssignments: {
                    select: { projectId: true }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const formattedUser = {
            ...user,
            assignedProjectIds: user.projectAssignments.map(a => a.projectId),
            projectAssignments: undefined // Remove the raw relation array
        };

        res.json(formattedUser);
    } catch (error) {
        next(error);
    }
};

// POST /api/auth/logout
export const logout = async (req, res) => {
    // With JWT, logout is handled client-side by removing the token
    res.json({ message: 'Logout successful' });
};
