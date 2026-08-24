const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the URI from environment variables.
 * The app is allowed to boot even if this fails initially so that
 * health checks can report the DB as unavailable rather than crashing.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('MONGODB_URI is not set. Please add it to server/.env');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Retry after a delay instead of crashing the whole server
    setTimeout(connectDB, 5000);
  }
}

module.exports = connectDB;
