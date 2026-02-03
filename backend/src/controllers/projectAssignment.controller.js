import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Assign user to project (admin only)
 */
export const assignUserToProject = async (req, res) => {
    try {
        const { userId, projectId } = req.body;

        // Validate inputs
        if (!userId || !projectId) {
            return res.status(400).json({
                error: 'userId and projectId are required'
            });
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if project exists
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if assignment already exists
        const existing = await prisma.userProjectAssignment.findUnique({
            where: {
                userId_projectId: {
                    userId,
                    projectId
                }
            }
        });

        if (existing) {
            return res.status(400).json({
                error: 'User is already assigned to this project'
            });
        }

        // Create assignment
        const assignment = await prisma.userProjectAssignment.create({
            data: {
                userId,
                projectId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                },
                project: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        });

        res.json({
            success: true,
            message: 'User assigned to project successfully',
            assignment
        });
    } catch (error) {
        console.error('Assign user to project error:', error);
        res.status(500).json({ error: 'Failed to assign user to project' });
    }
};

/**
 * Unassign user from project (admin only)
 */
export const unassignUserFromProject = async (req, res) => {
    try {
        const { userId, projectId } = req.body;

        // Validate inputs
        if (!userId || !projectId) {
            return res.status(400).json({
                error: 'userId and projectId are required'
            });
        }

        // Check if assignment exists
        const assignment = await prisma.userProjectAssignment.findUnique({
            where: {
                userId_projectId: {
                    userId,
                    projectId
                }
            }
        });

        if (!assignment) {
            return res.status(404).json({
                error: 'Assignment not found'
            });
        }

        // Delete assignment
        await prisma.userProjectAssignment.delete({
            where: {
                userId_projectId: {
                    userId,
                    projectId
                }
            }
        });

        res.json({
            success: true,
            message: 'User unassigned from project successfully'
        });
    } catch (error) {
        console.error('Unassign user from project error:', error);
        res.status(500).json({ error: 'Failed to unassign user from project' });
    }
};

/**
 * Get user's assigned projects
 */
export const getUserProjects = async (req, res) => {
    try {
        const userId = req.params.userId;

        const assignments = await prisma.userProjectAssignment.findMany({
            where: { userId },
            include: {
                project: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        status: true,
                        imageUrl: true,
                        createdAt: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const projects = assignments.map(a => a.project);

        res.json({
            success: true,
            projects
        });
    } catch (error) {
        console.error('Get user projects error:', error);
        res.status(500).json({ error: 'Failed to get user projects' });
    }
};

/**
 * Get project's assigned users
 */
export const getProjectUsers = async (req, res) => {
    try {
        const projectId = req.params.projectId;

        const assignments = await prisma.userProjectAssignment.findMany({
            where: { projectId },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        isAdmin: true,
                        isActive: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const users = assignments.map(a => a.user);

        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Get project users error:', error);
        res.status(500).json({ error: 'Failed to get project users' });
    }
};
