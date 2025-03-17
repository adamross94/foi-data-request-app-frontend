require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database'); // Import the Sequelize instance

const app = express();

// Enable CORS with specified domains
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://foi-data-app-frontend-a3384cca308e.herokuapp.com',
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Explicitly handle preflight requests (helpful if some requests still fail)
app.options('*', cors());

// Parse incoming JSON
app.use(express.json());

// Basic test route
app.get('/', (req, res) => {
  res.send('FOI & Data Request Management API');
});

// Mount authentication routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Mount request routes
const requestRoutes = require('./routes/requests');
app.use('/api/requests', requestRoutes);

// Sync models with the database
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
