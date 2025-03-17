require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');

const app = express();

// CORS config
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://foi-data-app-frontend-a3384cca308e.herokuapp.com'
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Ensure preflight requests are also handled
app.options('*', cors());

// JSON parsing
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('FOI & Data Request Management API');
});

// Authentication routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Request routes
const requestRoutes = require('./routes/requests');
app.use('/api/requests', requestRoutes);

// Sequelize sync
sequelize.sync()
  .then(() => {
    console.log('Database synced successfully');
  })
  .catch((error) => {
    console.error('Error syncing database:', error);
  });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
