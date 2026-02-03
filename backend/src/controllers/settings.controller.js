import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const setting = await prisma.appSettings.findUnique({
            where: { key }
        });

        if (!setting) {
            return res.json({ value: true }); // Default to true if not set
        }

        res.json({ value: setting.value });
    } catch (error) {
        console.error('Error fetching setting:', error);
        res.status(500).json({ error: 'Failed to fetch setting' });
    }
};

export const updateSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body; // Expecting { value: boolean/json }

        const setting = await prisma.appSettings.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });

        res.json({ message: 'Setting updated', data: setting });
    } catch (error) {
        console.error('Error updating setting:', error);
        res.status(500).json({ error: 'Failed to update setting', details: error.message });
    }
};

