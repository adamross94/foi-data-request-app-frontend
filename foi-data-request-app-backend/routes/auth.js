const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models'); // Ensure the models are properly loaded from index.js

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, role, name, department } = req.body;

    // Check if user exists
    const userExists = await User.findOne({
      where: { username },
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
      name,
      department,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: newUser.id, username: newUser.username, role: newUser.role },
    });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/signin
router.post('/signin', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        department: user.department,
      },
    });
  } catch (error) {
    console.error('Error during signin:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
