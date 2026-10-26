const mongoose = require('mongoose');

const EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Shopping',
  'Education',
  'Healthcare',
  'Entertainment',
  'Bills and Utilities',
  'Rent',
  'Travel',
  'Other'
];

const PAYMENT_METHODS = [
  'Cash',
  'UPI',
  'Debit Card',
  'Credit Card',
  'Net Banking',
  'Other'
];

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: EXPENSE_CATEGORIES,
        message: '{VALUE} is not a valid category'
      }
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: {
        values: PAYMENT_METHODS,
        message: '{VALUE} is not a valid payment method'
      }
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Indexes for high performance querying
expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ paymentMethod: 1 });

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = {
  Expense,
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS
};
