require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const meetingRoutes = require('./routes/meetingRoutes');
const authRoutes = require('./routes/authRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not set in server/.env. Login/signup will not work correctly.');
}

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',');
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Meeting Summarizer API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
