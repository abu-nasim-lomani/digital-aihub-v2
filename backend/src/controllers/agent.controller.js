import prisma from '../config/database.js';
import { chatbotService } from '../services/chatbot.service.js';

// Tools definition for Gemini Function Calling
const toolsDefinition = [
    {
        name: "getProjects",
        description: "Get a list of all projects or search for specific projects.",
        parameters: {
            type: "OBJECT",
            properties: {
                search: {
                    type: "STRING",
                    description: "Optional search term to filter projects by title or description.",
                },
                limit: {
                    type: "INTEGER",
                    description: "Number of projects to return (default 5).",
                }
            },
        },
    },
    {
        name: "getEvents",
        description: "Get a list of upcoming or past events.",
        parameters: {
            type: "OBJECT",
            properties: {
                status: {
                    type: "STRING",
                    enum: ["upcoming", "past", "all"],
                    description: "Filter events by status (default: upcoming)",
                },
                limit: {
                    type: "INTEGER",
                    description: "Number of events to return (default 5).",
                }
            },
        },
    },
    {
        name: "getSupportStats",
        description: "Get statistics about support requests.",
        parameters: {
            type: "OBJECT",
            properties: {},
        },
    },
    {
        name: "navigateToPage",
        description: "Navigate to a specific page on the website. Use this when user wants to go to a page.",
        parameters: {
            type: "OBJECT",
            properties: {
                page: {
                    type: "STRING",
                    enum: ["home", "projects", "events", "initiatives", "team", "about", "contact", "support"],
                    description: "The page to navigate to",
                }
            },
            required: ["page"]
        },
    },
    {
        name: "searchAllContent",
        description: "Search across all content types (projects, events, initiatives, team members) for a query.",
        parameters: {
            type: "OBJECT",
            properties: {
                query: {
                    type: "STRING",
                    description: "Search query",
                },
                limit: {
                    type: "INTEGER",
                    description: "Max results per category (default 3)",
                }
            },
            required: ["query"]
        },
    },
    {
        name: "createSupportRequest",
        description: "Create a support request. Collect name, email, and message from user.",
        parameters: {
            type: "OBJECT",
            properties: {
                guestName: {
                    type: "STRING",
                    description: "User's full name",
                },
                guestEmail: {
                    type: "STRING",
                    description: "User's email address",
                },
                message: {
                    type: "STRING",
                    description: "The support request message",
                }
            },
            required: ["guestName", "guestEmail", "message"]
        },
    },
    {
        name: "getTeamMembers",
        description: "Get information about team members.",
        parameters: {
            type: "OBJECT",
            properties: {
                section: {
                    type: "STRING",
                    enum: ["team", "advisory", "all"],
                    description: "Filter by section (default: all)",
                },
                limit: {
                    type: "INTEGER",
                    description: "Number of members to return (default 10)",
                }
            },
        },
    },
    {
        name: "getInitiatives",
        description: "Get information about initiatives.",
        parameters: {
            type: "OBJECT",
            properties: {
                search: {
                    type: "STRING",
                    description: "Search term for initiatives",
                },
                limit: {
                    type: "INTEGER",
                    description: "Number of initiatives to return (default 5)",
                }
            },
        },
    },
    {
        name: "registerForEvent",
        description: "Register a user for an event. Collect event ID, name, email, and phone.",
        parameters: {
            type: "OBJECT",
            properties: {
                eventId: {
                    type: "STRING",
                    description: "The event ID to register for",
                },
                name: {
                    type: "STRING",
                    description: "Participant's full name",
                },
                email: {
                    type: "STRING",
                    description: "Participant's email",
                },
                phone: {
                    type: "STRING",
                    description: "Participant's phone number",
                }
            },
            required: ["eventId", "name", "email"]
        },
    }
];

// Helper functions for tools
async function getProjects({ search, limit = 5 }) {
    try {
        const where = search ? {
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ],
        } : {};

        const projects = await prisma.project.findMany({
            where,
            take: Number(limit),
            orderBy: { createdAt: 'desc' },
        });
        return JSON.stringify(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        return JSON.stringify({ error: "Failed to fetch projects" });
    }
}

async function getEvents({ status = 'upcoming', limit = 5 }) {
    try {
        const now = new Date();
        let where = {};
        if (status === 'upcoming') {
            where = { date: { gte: now } };
        } else if (status === 'past') {
            where = { date: { lt: now } };
        }

        const events = await prisma.event.findMany({
            where,
            take: Number(limit),
            orderBy: { date: 'asc' },
        });
        return JSON.stringify(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        return JSON.stringify({ error: "Failed to fetch events" });
    }
}

async function getSupportStats() {
    try {
        const total = await prisma.supportRequest.count();
        const pending = await prisma.supportRequest.count({ where: { status: 'pending' } });
        const resolved = await prisma.supportRequest.count({ where: { status: 'resolved' } });
        return JSON.stringify({ total, pending, resolved });
    } catch (error) {
        console.error("Error fetching stats:", error);
        return JSON.stringify({ error: "Failed to fetch stats" });
    }
}

async function navigateToPage({ page }) {
    const pageMap = {
        home: "/",
        projects: "/projects",
        events: "/events",
        initiatives: "/initiatives",
        team: "/team",
        about: "/about",
        contact: "/contact",
        support: "/support"
    };
    return JSON.stringify({
        action: "navigate",
        page: pageMap[page] || "/",
        message: `Navigating to ${page} page`
    });
}

async function searchAllContent({ query, limit = 3 }) {
    try {
        const results = {};

        // Search projects
        const projects = await prisma.project.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                ],
            },
            take: Number(limit),
        });
        if (projects.length > 0) results.projects = projects;

        // Search events
        const events = await prisma.event.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                ],
            },
            take: Number(limit),
        });
        if (events.length > 0) results.events = events;

        // Search initiatives
        const initiatives = await prisma.initiative.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                ],
            },
            take: Number(limit),
        });
        if (initiatives.length > 0) results.initiatives = initiatives;

        // Search team members
        const team = await prisma.teamMember.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { designation: { contains: query, mode: 'insensitive' } },
                    { bio: { contains: query, mode: 'insensitive' } },
                ],
            },
            take: Number(limit),
        });
        if (team.length > 0) results.team = team;

        return JSON.stringify(results);
    } catch (error) {
        console.error("Error searching content:", error);
        return JSON.stringify({ error: "Failed to search content" });
    }
}

async function createSupportRequest({ guestName, guestEmail, message }) {
    try {
        const supportRequest = await prisma.supportRequest.create({
            data: {
                guestName,
                guestEmail,
                message,
                status: 'pending',
            },
        });
        return JSON.stringify({
            success: true,
            id: supportRequest.id,
            message: "Support request created successfully"
        });
    } catch (error) {
        console.error("Error creating support request:", error);
        return JSON.stringify({ error: "Failed to create support request" });
    }
}

async function getTeamMembers({ section = 'all', limit = 10 }) {
    try {
        const where = section === 'all' ? {} : { section };
        const members = await prisma.teamMember.findMany({
            where,
            take: Number(limit),
            orderBy: { createdAt: 'desc' },
        });
        return JSON.stringify(members);
    } catch (error) {
        console.error("Error fetching team members:", error);
        return JSON.stringify({ error: "Failed to fetch team members" });
    }
}

async function getInitiatives({ search, limit = 5 }) {
    try {
        const where = search ? {
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ],
        } : {};

        const initiatives = await prisma.initiative.findMany({
            where,
            take: Number(limit),
            orderBy: { createdAt: 'desc' },
        });
        return JSON.stringify(initiatives);
    } catch (error) {
        console.error("Error fetching initiatives:", error);
        return JSON.stringify({ error: "Failed to fetch initiatives" });
    }
}

// eslint-disable-next-line no-unused-vars
async function registerForEvent({ eventId, name, email: _email, phone: _phone }) {
    try {
        // Note: You'll need to create an EventRegistration model in Prisma schema
        // For now, we'll return a success message
        // TODO: Add EventRegistration model and implement actual registration
        return JSON.stringify({
            success: true,
            message: `Registration successful for ${name}. Event ID: ${eventId}`,
            note: "Event registration feature requires database schema update"
        });
    } catch (error) {
        console.error("Error registering for event:", error);
        return JSON.stringify({ error: "Failed to register for event" });
    }
}

const availableFunctions = {
    getProjects,
    getEvents,
    getSupportStats,
    navigateToPage,
    searchAllContent,
    createSupportRequest,
    getTeamMembers,
    getInitiatives,
    registerForEvent
};

export const chatWithAgent = async (req, res) => {
    try {
        const { message, history } = req.body;

        // Use local chatbot service instead of AI API
        const { processMessage } = await import('../services/chatbot.service.js');
        const result = await processMessage(message);

        res.json({
            reply: result.reply,
            history: [
                ...history,
                { role: 'user', content: message },
                { role: 'assistant', content: result.reply }
            ]
        });
    } catch (error) {
        console.error("Agent Error:", error);
        res.status(500).json({ error: "Failed to process message" });
    }
};
