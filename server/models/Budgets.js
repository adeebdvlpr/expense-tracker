const mongoose = require('mongoose'); 

const budgetSchema = new mongoose.Schema ({
    income: {
        type: Number, 
        requried: true, 
        trim: true
    },



});