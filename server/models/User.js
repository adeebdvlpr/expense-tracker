const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  dateOfBirth: { 
    type: Date, 
    required: false 
  },
  reason: {
    type: String,
    required: false, 
    enum: ['Budgeting', 'Saving', 'Debt', 'Tracking', 'Other']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },

    // for third-party auth later
    // authProvider: { type: String, default: 'local', enum: ['local', 'google'] },
    // googleId: { type: String
}, {timestamps: true});

module.exports = mongoose.model('User', UserSchema);