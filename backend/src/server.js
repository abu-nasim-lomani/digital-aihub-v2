import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
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

const app = express();

// CORS configuration - MUST be before other middleware
app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
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
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/initiatives', initiativesRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/standards', standardsRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/support-requests', supportRequestsRoutes);

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
if (process.env.NODE_ENV !== 'production') {
    app.listen(config.port, () => {
        console.log(`🚀 Server running on http://localhost:${config.port}`);
        console.log(`📊 Environment: ${config.nodeEnv}`);
        console.log(`🔐 CORS origin: ${config.corsOrigin}`);
    });
}

export default app;
