const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 


exports.register = async (req, res) => {
  try {
    const { 
      username,
      email,
      password,
      dateOfBirth,
      reason 
    } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUserName = username.toLowerCase().trim();

    // Check if user already exists
    let user = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUserName }]
    });
    
    if (user) {
      // Determine which field matched
      if (user.email === normalizedEmail) {
        return res.status(409).json({ message: 'Email already exists' });
      }
      if (user.username === normalizedUserName) {
        return res.status(409).json({ message: 'Username already exists' });
      }
    }
        // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

        // Create new user
    const userData = {
      username: normalizedUserName,
      email: normalizedEmail,
      passwordHash,
    };

    if (dateOfBirth) userData.dateOfBirth = dateOfBirth; // will be a Date if validator ran .toDate()
    if (reason) userData.reason = reason;

    user = new User(userData);

    await user.save();
        // Create and send JWT token
    const payload = { user: { id: user.id } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Create and send JWT token
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};