const mongoose = require('mongoose'); 

const budgetSchema = new mongoose.Schema ({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    period: {
        type: String,
        required: true,
        trim: true, 
        match: [/^|d{4}-(0[1-9][1[0-2])$/, 'Period must be valid'],
        index: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
    },
    amount:{
        type: Number,
        required: true,
        min: 0,
    },
    currency: {
        type: String,
        equired: true,
        default: 'USD',
        trim: true,
        uppercase: true,
        minlength: 3,
        maxlength: 3,
    },
}, { timestamps: true });

module.exports = mongoose.model('Budgets', budgetSchema);