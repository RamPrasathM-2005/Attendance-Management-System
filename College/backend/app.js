import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';


// Routes
import adminRoutes from './routes/admin/adminRoutes.js'; // Your existing
import authRoutes from './routes/auth/authRoutes.js'; // New

dotenv.config({ path: './.env' });

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL, // Allow frontend origin
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));



app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes); // Your existing

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'success', message: 'Server running' });
});


export default app;