import { PrismaClient } from '@prisma/client';
import { uploadToLocal } from '../utils/uploadHelper.js';

const prisma = new PrismaClient();

// GET /api/partners - Get all partners (public)
export const getAllPartners = async (req, res) => {
    try {
        const { category, status = 'published' } = req.query;

        const where = { status };
        if (category) {
            where.category = category;
        }

        const partners = await prisma.partner.findMany({
            where,
            orderBy: [
                { isFeatured: 'desc' },
                { displayOrder: 'asc' },
                { createdAt: 'desc' }
            ],
            include: {
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                }
            }
        });

        res.json({
            success: true,
            partners
        });
    } catch (error) {
        console.error('Get partners error:', error);
        res.status(500).json({ error: 'Failed to fetch partners' });
    }
};

// GET /api/partners/featured - Get featured partners (public)
export const getFeaturedPartners = async (req, res) => {
    try {
        const partners = await prisma.partner.findMany({
            where: {
                isFeatured: true,
                status: 'published'
            },
            orderBy: [
                { displayOrder: 'asc' },
                { createdAt: 'desc' }
            ],
            take: 4 // Limit to 4 featured partners
        });

        res.json({
            success: true,
            partners
        });
    } catch (error) {
        console.error('Get featured partners error:', error);
        res.status(500).json({ error: 'Failed to fetch featured partners' });
    }
};

// GET /api/partners/:id - Get single partner (public)
export const getPartnerById = async (req, res) => {
    try {
        const partner = await prisma.partner.findUnique({
            where: { id: req.params.id },
            include: {
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                }
            }
        });

        if (!partner) {
            return res.status(404).json({ error: 'Partner not found' });
        }

        res.json({
            success: true,
            partner
        });
    } catch (error) {
        console.error('Get partner error:', error);
        res.status(500).json({ error: 'Failed to fetch partner' });
    }
};

// POST /api/partners - Create partner (admin only)
export const createPartner = async (req, res) => {
    try {
        const {
            name,
            logo,
            category,
            description,
            website,
            email,
            contactPerson,
            partnershipType,
            startDate,
            isFeatured,
            displayOrder,
            focusAreas,
            status
        } = req.body;

        // Validate required fields
        if (!name || !category) {
            return res.status(400).json({
                error: 'Name and category are required'
            });
        }

        // Handle file upload
        let logoUrl = logo;
        if (req.file) {
            logoUrl = await uploadToLocal(req.file, 'partners', 'partners');
        }

        // Parse fields if coming from FormData
        let parsedFocusAreas = focusAreas;
        if (typeof focusAreas === 'string') {
            try {
                parsedFocusAreas = JSON.parse(focusAreas);
            } catch {
                parsedFocusAreas = [];
            }
        }

        const partner = await prisma.partner.create({
            data: {
                name,
                logo: logoUrl,
                category,
                description,
                website,
                email,
                contactPerson,
                partnershipType,
                startDate: startDate ? new Date(startDate) : null,
                isFeatured: isFeatured === 'true' || isFeatured === true,
                displayOrder: displayOrder ? parseInt(displayOrder) : 0,
                focusAreas: parsedFocusAreas || [],
                status: status || 'published',
                createdBy: req.user.userId
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                }
            }
        });

        res.status(201).json({
            success: true,
            message: 'Partner created successfully',
            partner
        });
    } catch (error) {
        console.error('Create partner error:', error);
        res.status(500).json({ error: 'Failed to create partner: ' + error.message });
    }
};

// PUT /api/partners/:id - Update partner (admin only)
export const updatePartner = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            logo,
            category,
            description,
            website,
            email,
            contactPerson,
            partnershipType,
            startDate,
            isFeatured,
            displayOrder,
            focusAreas,
            status
        } = req.body;

        // Check if partner exists
        const existingPartner = await prisma.partner.findUnique({
            where: { id }
        });

        if (!existingPartner) {
            return res.status(404).json({ error: 'Partner not found' });
        }

        // Handle file upload
        let logoUrl = logo;
        if (req.file) {
            logoUrl = await uploadToLocal(req.file, 'partners', 'partners');
        }

        // Parse fields if coming from FormData
        let parsedFocusAreas = focusAreas;
        if (typeof focusAreas === 'string') {
            try {
                parsedFocusAreas = JSON.parse(focusAreas);
            } catch {
                parsedFocusAreas = [];
            }
        }

        const partner = await prisma.partner.update({
            where: { id },
            data: {
                name,
                logo: logoUrl,
                category,
                description,
                website,
                email,
                contactPerson,
                partnershipType,
                startDate: startDate ? new Date(startDate) : null,
                isFeatured: isFeatured === 'true' || isFeatured === true,
                displayOrder: displayOrder ? parseInt(displayOrder) : 0,
                focusAreas: parsedFocusAreas,
                status
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                }
            }
        });

        res.json({
            success: true,
            message: 'Partner updated successfully',
            partner
        });
    } catch (error) {
        console.error('Update partner error:', error);
        res.status(500).json({ error: 'Failed to update partner' });
    }
};

// DELETE /api/partners/:id - Delete partner (admin only)
export const deletePartner = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if partner exists
        const partner = await prisma.partner.findUnique({
            where: { id }
        });

        if (!partner) {
            return res.status(404).json({ error: 'Partner not found' });
        }

        await prisma.partner.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: 'Partner deleted successfully'
        });
    } catch (error) {
        console.error('Delete partner error:', error);
        res.status(500).json({ error: 'Failed to delete partner' });
    }
};

// PATCH /api/partners/:id/featured - Toggle featured status (admin only)
export const toggleFeatured = async (req, res) => {
    try {
        const { id } = req.params;

        const partner = await prisma.partner.findUnique({
            where: { id }
        });

        if (!partner) {
            return res.status(404).json({ error: 'Partner not found' });
        }

        const updatedPartner = await prisma.partner.update({
            where: { id },
            data: {
                isFeatured: !partner.isFeatured
            }
        });

        res.json({
            success: true,
            message: `Partner ${updatedPartner.isFeatured ? 'featured' : 'unfeatured'} successfully`,
            partner: updatedPartner
        });
    } catch (error) {
        console.error('Toggle featured error:', error);
        res.status(500).json({ error: 'Failed to toggle featured status' });
    }
};
