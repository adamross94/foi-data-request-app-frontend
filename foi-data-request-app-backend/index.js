require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database'); // Import the Sequelize instance

const app = express();

// Enable CORS
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

// Explicitly handle OPTIONS (preflight) for all routes
app.options('*', cors());

// Parse incoming JSON
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('FOI & Data Request Management API');
});

// Mount authentication routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Mount request routes
const requestRoutes = require('./routes/requests');
app.use('/api/requests', requestRoutes);

// Sync models
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
