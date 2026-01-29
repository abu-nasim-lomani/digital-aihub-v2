import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import config from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import projectsRoutes from './routes/projects.routes.js';
import initiativesRoutes from './routes/initiatives.routes.js';
import eventsRoutes from './routes/events.routes.js';
import learningRoutes from './routes/learning.routes.js';
import standardsRoutes from './routes/standards.routes.js';
import teamRoutes from './routes/team.routes.js';
import supportRequestsRoutes from './routes/support-requests.routes.js';
import agentRoutes from './routes/agent.routes.js';

const app = express();

// CORS configuration - MUST be before other middleware
// CORS configuration - MUST be before other middleware
const allowedOrigins = [
    config.corsOrigin,
    'http://localhost:5173',
    'http://localhost:3000',
    'https://digital-aihub-i0oor1fz1-md-abu-nasims-projects.vercel.app',
    'https://digital-aihub.vercel.app'
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check if origin is allowed or is a vercel subdomain
        if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMaxRequests
});
app.use('/api/', limiter);

// Static files (uploads) - DISABLED FOR VERCEL (using Supabase)
// app.use('/uploads', express.static(config.uploadDir));

// Routes
import uploadRoutes from './routes/upload.routes.js';

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/initiatives', initiativesRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/standards', standardsRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/support-requests', supportRequestsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/agent', agentRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use(errorHandler);

// Start server only if not importing for Vercel
// eslint-disable-next-line no-undef
if (process.env.NODE_ENV !== 'production') {
    app.listen(config.port, () => {
        console.log(`🚀 Server running on http://localhost:${config.port}`);
        console.log(`📊 Environment: ${config.nodeEnv}`);
        console.log(`🔐 CORS origin: ${config.corsOrigin}`);
        console.log(`⏱️ Rate Limit: ${config.rateLimitMaxRequests} reqs / ${config.rateLimitWindowMs / 60000} mins`);
    });
}

export default app;
