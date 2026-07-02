const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: [true, 'Transaction must be associated with a from account'],
        index: true,
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: [true, 'Transaction must be associated with a to account'],
        index: true,    
    },

    status: {
        type: String,
        enum: {
            values: [
            'Pending', 'Completed', 'Failed','Reversed' ],

            message: 'Status must be either Pending, Completed, Failed or Reversed'
         },
         default: 'Pending',
    },
    amount: {
        type: Number,
        required: [true, 'Transaction amount is required'],
        min: [0, 'Transaction amount must be greater than 0'],
    },
    idempotencyKey: {
        type: String,
        required: [true, 'Idempotency key is required for creating a transaction'],
        unique: true,
        index: true,
    },
},{
    timestamps: true,
})

const transactionModel = mongoose.model('Transaction', transactionSchema);
module.exports = transactionModel;