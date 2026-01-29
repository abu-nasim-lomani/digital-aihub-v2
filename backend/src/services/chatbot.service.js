import prisma from '../config/database.js';

// Intent patterns for recognizing user queries - 100+ variations
const intentPatterns = {
    greeting: [
        /^(hi|hello|hey|greetings|hola|namaste|assalamu alaikum)/i,
        /^(good morning|good afternoon|good evening)/i,
        /^what can you (do|help)/i,
        /^(help|assist) me/i,
        /^how (can|do) you help/i
    ],

    // Support requests - many variations
    support: [
        /^(i|I) (want|need|require) (help|support|assistance)/i,
        /^(help|support|assist) (me|please)/i,
        /^(i|I) (have|got) (a )?(problem|issue|question)/i,
        /(submit|create|send|raise|file).*support.*request/i,
        /^(need|want) support$/i,
        /^help$/i,
        /^support$/i,
        /(contact|reach) support/i,
        /how (can|do) i get (help|support)/i
    ],

    // Team - expanded patterns
    team: [
        /^(go to|show|open|take me to|display|view).*team/i,
        /^team$/i,
        /^(who|show me|tell me about|list).*(team|members|people|staff)/i,
        /(our|the|your) team/i,
        /(team|advisory) (members?|board|page|section)/i,
        /^(show|get|display) (the )?(team|members)/i,
        /who (are|is) (in )?(the |your )?(team|advisory)/i,
        /^(team and advisory|advisory board)$/i
    ],

    // Projects - comprehensive variations
    projects: [
        /^(go to|show|open|take me to|display|view).*(project|portfolio)/i,
        /^projects?$/i,
        /^portfolio$/i,
        /(show|get|what|tell me|list|display).*(all )?(project|portfolio)/i,
        /(our|the|your) projects?/i,
        /projects? (and|&) support/i,
        /what projects (do you have|are there)/i,
        /^(view|see|check) projects?$/i,
        /^project$/i,
        /^(go to )?project$/i
    ],

    // Events - many ways to ask
    events: [
        /^(go to|show|open|take me to|display|view).*events?/i,
        /^events?$/i,
        /(show|get|what|tell me|list|display).*(all )?(event|upcoming|past)/i,
        /(our|the|your) events?/i,
        /(upcoming|past|future|next) events?/i,
        /what events (do you have|are there|coming)/i,
        /when.*event/i,
        /^(view|see|check) events?$/i,
        /^event$/i,
        /^(go to )?event$/i
    ],

    // Initiatives - expanded
    initiatives: [
        /^(go to|show|open|take me to|display|view).*initiatives?/i,
        /^initiatives?$/i,
        /(show|get|what|tell me|list|display).*(all )?initiatives?/i,
        /(our|the|your) initiatives?/i,
        /what initiatives (do you have|are there)/i,
        /^(view|see|check) initiatives?$/i,
        /strategic initiatives?/i,
        /^initiative$/i,
        /^(go to )?initiative$/i
    ],

    // Learning - comprehensive
    learning: [
        /^(go to|show|open|take me to|display|view).*(learning|training|course)/i,
        /^(learning|training|courses?)$/i,
        /(show|get|what|tell me|list).*(learning|training|course|capacity)/i,
        /(our|the|your) (learning|training|courses?)/i,
        /capacity building/i,
        /learning (module|program|section|page)/i,
        /what (can i|to) learn/i,
        /training programs?/i,
        /^(view|see|check) (learning|courses?)$/i,
        /^course$/i,
        /^(go to )?learning$/i
    ],

    // Standards - expanded
    standards: [
        /^(go to|show|open|take me to|display|view).*standards?/i,
        /^standards?$/i,
        /^research$/i,
        /(show|get|what|tell me|list).*standards?/i,
        /(our|the|your) standards?/i,
        /research.*development/i,
        /standards? (section|page)/i,
        /^(view|see|check) standards?$/i,
        /^standard$/i,
        /^(go to )?standard$/i
    ],

    // Vision - multiple ways
    vision: [
        /(what|tell me|show me).*(is )?(your|the|our)? *vision/i,
        /^vision$/i,
        /vision (statement|is)/i,
        /(your|the) vision/i
    ],

    // Mission - multiple ways
    mission: [
        /(what|tell me|show me).*(is )?(your|the|our)? *mission/i,
        /^mission$/i,
        /mission (statement|is)/i,
        /(your|the) mission/i
    ],

    // Purpose - expanded
    purpose: [
        /(what|tell me|show me).*(is )?(your|the|our)? *purpose/i,
        /^purpose$/i,
        /why (do you|does.*hub) exist/i,
        /(your|the) purpose/i
    ],

    // Combined vision/mission queries
    visionMission: [
        /(vision|mission).*(and|&|or).*(mission|vision)/i,
        /(what|tell me).*(vision|mission).*(and|&).*(mission|vision)/i,
        /^(vision and mission|mission and vision)$/i,
        /what.*your.*(vision|mission)/i
    ],

    // Impact - expanded
    impact: [
        /(what|tell me|show me).*(impact|goal)/i,
        /^impact$/i,
        /^goals?$/i,
        /impact (goal|target)/i,
        /(your|the|our) (impact|goals?)/i,
        /what.*achieved/i
    ],

    // About - comprehensive
    about: [
        /(what|tell me|who).*(is|are).*(digital ai hub|you|this)/i,
        /about (digital ai hub|you|this|the hub)/i,
        /^about$/i,
        /who are you/i,
        /what (is|does).*(digital ai hub|this hub)/i,
        /tell me about (yourself|you|the hub)/i
    ],

    // Specific item details - improved patterns
    projectDetails: [
        /(tell me|what|details?|more|info|information).*(about|on).+project/i,
        /(details?|more|info|information).*(about|on|for).+/i,
        /^(about|details).+$/i
    ],
    eventDetails: [
        /(tell me|what|details?|more|info|information).*(about|on).+event/i
    ],
    initiativeDetails: [
        /(tell me|what|details?|more|info|information).*(about|on).+initiative/i
    ],

    // Search - simplified
    searchAll: [
        /(search|find|look for|looking for).+/i
    ],

    // Navigation - actual pages only
    navigation: [
        /^(go to|take me to|open|show|navigate to).*(home|team|about|contact|support)( page)?$/i,
        /^(home|team|about|contact|support)( page)?$/i
    ],

    // Stats
    stats: [
        /(show|get|what|tell me).*(support )?(stats|statistics|numbers)/i,
        /how many.*(support|request|ticket)/i,
        /^stats?$/i,
        /support (stats|statistics)/i
    ]
};

// Response templates
const responses = {
    greeting: "Hello! I'm your Digital AI Hub assistant. I can help you navigate pages, search for information, get details about projects, events, initiatives, and team members. What would you like to know?",

    navigation: (page) => ({
        action: "navigate",
        page: page,
        message: `Navigating to ${page} page`
    }),

    projectsFound: (projects) => {
        if (projects.length === 0) return "I couldn't find any projects.";
        const list = projects.slice(0, 3).map(p => p.title).join(", ");
        return `I found ${projects.length} project${projects.length > 1 ? 's' : ''}. Here are some: ${list}. ${projects.length > 3 ? 'And more.' : ''} `;
    },

    eventsFound: (events) => {
        if (events.length === 0) return "I couldn't find any events.";
        const list = events.slice(0, 3).map(e => e.title).join(", ");
        return `I found ${events.length} event${events.length > 1 ? 's' : ''}. Here are some: ${list}. ${events.length > 3 ? 'And more.' : ''} `;
    },

    initiativesFound: (initiatives) => {
        if (initiatives.length === 0) return "I couldn't find any initiatives.";
        const list = initiatives.slice(0, 3).map(i => i.title).join(", ");
        return `I found ${initiatives.length} initiative${initiatives.length > 1 ? 's' : ''}. Here are some: ${list}. ${initiatives.length > 3 ? 'And more.' : ''} `;
    },

    teamFound: (members) => {
        if (members.length === 0) return "I couldn't find any team members.";
        const list = members.slice(0, 3).map(m => `${m.name}${m.designation ? ', ' + m.designation : ''} `).join("; ");
        return `We have ${members.length} team member${members.length > 1 ? 's' : ''}. Here are some: ${list}. ${members.length > 3 ? 'And more.' : ''} `;
    },

    searchResults: (results) => {
        const parts = [];
        if (results.projects?.length) parts.push(`${results.projects.length} project${results.projects.length > 1 ? 's' : ''} `);
        if (results.events?.length) parts.push(`${results.events.length} event${results.events.length > 1 ? 's' : ''} `);
        if (results.initiatives?.length) parts.push(`${results.initiatives.length} initiative${results.initiatives.length > 1 ? 's' : ''} `);
        if (results.team?.length) parts.push(`${results.team.length} team member${results.team.length > 1 ? 's' : ''} `);

        if (parts.length === 0) return "I couldn't find anything matching your search.";
        return `I found ${parts.join(', ')} related to your search.`;
    },

    stats: (stats) => `We have ${stats.total} total support requests.${stats.pending} are pending and ${stats.resolved} have been resolved.`,

    supportStart: "I'd be happy to help you submit a support request. What's your name?",

    vision: "Our vision is to drive digital transformation. We envision a future where technology empowers every citizen, bridges the digital divide, and accelerates sustainable development goals across Bangladesh.",

    mission: "Our mission is to accelerate people-centered digital transformation through innovation, capacity building, and strategic support.",

    purpose: "Our purpose is to serve as a catalyst for digital innovation, ensuring technology creates equitable opportunities for all.",

    impact: "Our impact goal is to reach 10 million plus citizens through our digital transformation initiatives. Together with 500 plus change makers, we are building the digital foundations for a prosperous nation.",

    about: "Digital AI Hub is dedicated to driving digital transformation across Bangladesh. We work on human-centered solution design, future-fit governance, research and standards development, digital and AI native project development, and global knowledge exchange. We're building a future where technology empowers every citizen.",

    notUnderstood: "I'm not sure I understood that. You can ask me about projects, events, initiatives, learning, standards, team members, our vision, mission, or navigate to different sections. What would you like to know?"
};

// Page mapping for navigation
const pageMap = {
    home: "/",
    about: "/about",
    contact: "/contact",
    support: "/support",
    team: "/team"
};

// Section IDs on home page for scrolling
const homeSections = {
    projects: "projects",
    events: "events",
    initiatives: "initiatives",
    learning: "learning",
    standards: "standards",
    team: "team",
    stats: "stats",
    mission: "mission",
    vision: "vision",
    purpose: "purpose"
};

// Recognize intent from user message
function recognizeIntent(message) {
    const lowerMessage = message.toLowerCase().trim();

    // Check each intent category
    for (const [intent, patterns] of Object.entries(intentPatterns)) {
        for (const pattern of patterns) {
            const match = lowerMessage.match(pattern);
            if (match) {
                return { intent, match, groups: match };
            }
        }
    }

    return { intent: 'unknown', match: null };
}

// Extract entities from message
function extractEntities(message, intent, match) {
    const entities = {};

    if (intent === 'navigation' && match) {
        // Extract page name
        const pageMatch = message.match(/(home|about|contact|support|team)/i);
        if (pageMatch) {
            entities.page = pageMatch[1].toLowerCase();
        }
    }

    if (intent === 'searchAll' && match) {
        // Extract search query
        entities.query = match[2] || match[1];
    }

    if (intent === 'projectDetails' && match) {
        // Extract project name - try to get from group 3 or 2
        entities.itemName = (match[3] || match[2] || match[1]).trim();
    }

    if (intent === 'eventDetails' && match) {
        // Extract event name
        entities.itemName = (match[3] || match[2] || match[1]).trim();
    }

    if (intent === 'initiativeDetails' && match) {
        // Extract initiative name
        entities.itemName = (match[3] || match[2] || match[1]).trim();
    }

    if (intent === 'events' && match) {
        // Check if asking for upcoming or past
        if (/upcoming/i.test(message)) entities.status = 'upcoming';
        else if (/past/i.test(message)) entities.status = 'past';
        else entities.status = 'upcoming';
    }

    if (intent === 'team' && match) {
        // Check if asking for specific section
        if (/advisory/i.test(message)) entities.section = 'advisory';
        else if (/team/i.test(message)) entities.section = 'team';
        else entities.section = 'all';
    }

    return entities;
}

// Process intent and generate response
export async function processMessage(message) {
    try {
        const { intent, match } = recognizeIntent(message);
        const entities = extractEntities(message, intent, match);

        switch (intent) {
            case 'greeting':
                return { reply: responses.greeting };

            case 'navigation': {
                const page = entities.page || 'home';
                const navResponse = responses.navigation(page);
                return {
                    reply: JSON.stringify(navResponse),
                    action: 'navigate',
                    page: pageMap[page] || '/'
                };
            }

            case 'projects': {
                // Fetch projects to introduce them
                const projects = await prisma.project.findMany({
                    take: 5,
                    orderBy: { createdAt: 'desc' }
                });

                let introduction = "Here are our amazing projects! ";
                if (projects.length > 0) {
                    const projectTitles = projects.slice(0, 3).map(p => p.title).join(", ");
                    introduction += `We have ${projects.length} project${projects.length > 1 ? 's' : ''} including ${projectTitles} `;
                    if (projects.length > 3) introduction += ", and more";
                    introduction += ". Explore them below!";
                } else {
                    introduction += "We're working on exciting new projects. Stay tuned!";
                }

                const navResponse = {
                    action: "navigate",
                    page: "/",
                    section: homeSections.projects,
                    message: introduction
                };
                return {
                    reply: introduction + " " + JSON.stringify(navResponse),
                    action: 'navigate',
                    page: '/',
                    section: 'projects'
                };
            }

            case 'events': {
                // Fetch upcoming events to introduce them
                const now = new Date();
                const events = await prisma.event.findMany({
                    where: { date: { gte: now } },
                    take: 5,
                    orderBy: { date: 'asc' }
                });

                let introduction = "Check out our upcoming events! ";
                if (events.length > 0) {
                    const eventTitles = events.slice(0, 3).map(e => e.title).join(", ");
                    introduction += `We have ${events.length} event${events.length > 1 ? 's' : ''} coming up, including ${eventTitles} `;
                    if (events.length > 3) introduction += ", and more";
                    introduction += ". Don't miss out!";
                } else {
                    introduction += "We're planning exciting events. Check back soon!";
                }

                const navResponse = {
                    action: "navigate",
                    page: "/",
                    section: homeSections.events,
                    message: introduction
                };
                return {
                    reply: introduction + " " + JSON.stringify(navResponse),
                    action: 'navigate',
                    page: '/',
                    section: 'events'
                };
            }

            case 'initiatives': {
                // Fetch initiatives to introduce them
                const initiatives = await prisma.initiative.findMany({
                    take: 5,
                    orderBy: { createdAt: 'desc' }
                });

                let introduction = "Discover our initiatives! ";
                if (initiatives.length > 0) {
                    const initiativeTitles = initiatives.slice(0, 3).map(i => i.title).join(", ");
                    introduction += `We're driving ${initiatives.length} initiative${initiatives.length > 1 ? 's' : ''} like ${initiativeTitles}`;
                    if (initiatives.length > 3) introduction += ", and more";
                    introduction += ". See the impact we're making!";
                } else {
                    introduction += "We're launching new initiatives. Stay connected!";
                }

                const navResponse = {
                    action: "navigate",
                    page: "/",
                    section: homeSections.initiatives,
                    message: introduction
                };
                return {
                    reply: introduction + " " + JSON.stringify(navResponse),
                    action: 'navigate',
                    page: '/',
                    section: 'initiatives'
                };
            }

            case 'projectDetails': {
                const itemName = entities.itemName;
                if (!itemName) return { reply: responses.notUnderstood };

                // Search for the project by name
                const project = await prisma.project.findFirst({
                    where: {
                        title: { contains: itemName, mode: 'insensitive' }
                    }
                });

                if (project) {
                    let details = `Let me tell you about ${project.title}. `;
                    if (project.description) details += project.description + " ";
                    if (project.category) details += `It's in the ${project.category} category. `;
                    details += "Would you like to know more?";
                    return { reply: details };
                } else {
                    return { reply: `I couldn't find a project called "${itemName}". Try asking about our projects to see what we have!` };
                }
            }

            case 'eventDetails': {
                const itemName = entities.itemName;
                if (!itemName) return { reply: responses.notUnderstood };

                // Search for the event by name
                const event = await prisma.event.findFirst({
                    where: {
                        title: { contains: itemName, mode: 'insensitive' }
                    }
                });

                if (event) {
                    let details = `Let me tell you about ${event.title}. `;
                    if (event.description) details += event.description + " ";
                    if (event.date) {
                        const eventDate = new Date(event.date);
                        details += `It's scheduled for ${eventDate.toLocaleDateString()}. `;
                    }
                    if (event.location) details += `Location: ${event.location}. `;
                    details += "Interested in joining?";
                    return { reply: details };
                } else {
                    return { reply: `I couldn't find an event called "${itemName}". Check out our events section to see what's coming up!` };
                }
            }

            case 'initiativeDetails': {
                const itemName = entities.itemName;
                if (!itemName) return { reply: responses.notUnderstood };

                // Search for the initiative by name
                const initiative = await prisma.initiative.findFirst({
                    where: {
                        title: { contains: itemName, mode: 'insensitive' }
                    }
                });

                if (initiative) {
                    let details = `Let me tell you about ${initiative.title}. `;
                    if (initiative.description) details += initiative.description + " ";
                    if (initiative.impact) details += `Impact: ${initiative.impact}. `;
                    if (initiative.result) details += `Results: ${initiative.result}. `;
                    details += "Amazing, right?";
                    return { reply: details };
                } else {
                    return { reply: `I couldn't find an initiative called "${itemName}". Explore our initiatives section to learn more!` };
                }
            }

            case 'team': {
                // Navigate to home page team section
                const navResponse = {
                    action: "navigate",
                    page: "/",
                    section: homeSections.team,
                    message: "Meet our amazing team!"
                };
                const introduction = "Meet our amazing team! We have a dedicated group of professionals and advisors working together to drive digital transformation. Let me show you!";
                return {
                    reply: introduction + " " + JSON.stringify(navResponse),
                    action: 'navigate',
                    page: '/',
                    section: 'team'
                };
            }

            case 'learning': {
                // Navigate to home page learning section
                const navResponse = {
                    action: "navigate",
                    page: "/",
                    section: homeSections.learning,
                    message: "Explore our learning and capacity building programs!"
                };
                const introduction = "Explore our learning and capacity building programs! We offer comprehensive training programs and resources to enhance digital transformation capabilities. Check out our modules on Digital Infrastructure, AI and Data, Policy and Governance, and Capacity Building!";
                return {
                    reply: introduction + " " + JSON.stringify(navResponse),
                    action: 'navigate',
                    page: '/',
                    section: 'learning'
                };
            }

            case 'standards': {
                // Navigate to home page standards section
                const navResponse = {
                    action: "navigate",
                    page: "/",
                    section: homeSections.standards,
                    message: "Discover our research and standards development work!"
                };
                const introduction = "Discover our research and standards development work! We focus on adaptable solutions through continuous research, reference architectures, and global standards alignment. Let's build future-ready frameworks together!";
                return {
                    reply: introduction + " " + JSON.stringify(navResponse),
                    action: 'navigate',
                    page: '/',
                    section: 'standards'
                };
            }

            case 'vision': {
                return { reply: responses.vision };
            }

            case 'mission': {
                return { reply: responses.mission };
            }

            case 'visionMission': {
                return { reply: responses.vision + " " + responses.mission };
            }

            case 'purpose': {
                return { reply: responses.purpose };
            }

            case 'impact': {
                return { reply: responses.impact };
            }

            case 'about': {
                return { reply: responses.about };
            }

            case 'searchAll': {
                const query = entities.query;
                if (!query) return { reply: responses.notUnderstood };

                const results = {};

                // Search projects
                const projects = await prisma.project.findMany({
                    where: {
                        OR: [
                            { title: { contains: query, mode: 'insensitive' } },
                            { description: { contains: query, mode: 'insensitive' } }
                        ]
                    },
                    take: 3
                });
                if (projects.length > 0) results.projects = projects;

                // Search events
                const events = await prisma.event.findMany({
                    where: {
                        OR: [
                            { title: { contains: query, mode: 'insensitive' } },
                            { description: { contains: query, mode: 'insensitive' } }
                        ]
                    },
                    take: 3
                });
                if (events.length > 0) results.events = events;

                // Search initiatives
                const initiatives = await prisma.initiative.findMany({
                    where: {
                        OR: [
                            { title: { contains: query, mode: 'insensitive' } },
                            { description: { contains: query, mode: 'insensitive' } }
                        ]
                    },
                    take: 3
                });
                if (initiatives.length > 0) results.initiatives = initiatives;

                // Search team
                const team = await prisma.teamMember.findMany({
                    where: {
                        OR: [
                            { name: { contains: query, mode: 'insensitive' } },
                            { designation: { contains: query, mode: 'insensitive' } },
                            { bio: { contains: query, mode: 'insensitive' } }
                        ]
                    },
                    take: 3
                });
                if (team.length > 0) results.team = team;

                return { reply: responses.searchResults(results) };
            }

            case 'stats': {
                const total = await prisma.supportRequest.count();
                const pending = await prisma.supportRequest.count({ where: { status: 'pending' } });
                const resolved = await prisma.supportRequest.count({ where: { status: 'resolved' } });
                return { reply: responses.stats({ total, pending, resolved }) };
            }

            case 'support':
                return { reply: responses.supportStart };

            default:
                return { reply: responses.notUnderstood };
        }
    } catch (error) {
        console.error('Chatbot processing error:', error);
        return { reply: "Sorry, I encountered an error processing your request." };
    }
}


export const chatbotService = {
    processQuery
};
