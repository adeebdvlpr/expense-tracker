const { Uppercase } = require('@sinclair/typebox');
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

  monethlyIncome: {
    type: Number,
    required: false,  
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    trim: true,
    uppercase: true,
    minlength: 3,
    maxlength:3,
  },

    // for third-party auth later
    // authProvider: { type: String, default: 'local', enum: ['local', 'google'] },
    // googleId: { type: String
    
}, {timestamps: true});

module.exports = mongoose.model('User', UserSchema);