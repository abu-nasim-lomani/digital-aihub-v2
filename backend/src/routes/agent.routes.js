import express from 'express';
import { chatWithAgent } from '../controllers/agent.controller.js';

const router = express.Router();

router.post('/chat', chatWithAgent);

export default router;
