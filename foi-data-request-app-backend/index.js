require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');  // Import the Sequelize instance

const app = express();

// Enable CORS for the production frontend URL
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
  optionsSuccessStatus: 200,
}));

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
