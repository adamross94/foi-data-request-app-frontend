const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const sequelize = require('../config/database'); // Import the sequelize instance

// Initialize an empty object to store all models
const models = {};

// Read all files in the models folder, excluding 'index.js'
const modelFiles = fs.readdirSync(__dirname).filter(file => file !== 'index.js');

// Dynamically import all models and store them in the models object
modelFiles.forEach((file) => {
  const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes); // Initialize the model using sequelize instance
  models[model.name] = model; // Save the model into the models object
});

// Define associations if the 'associate' method exists on the model
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models); // Call the associate method to set up relationships
  }
});

module.exports = models;
