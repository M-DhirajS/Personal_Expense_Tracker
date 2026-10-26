const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Expense } = require('../models/Expense');

dotenv.config();

const sampleExpenses = [
  {
    title: 'Monthly Apartment Rent',
    amount: 15000,
    category: 'Rent',
    date: new Date(2026, 9, 1),
    paymentMethod: 'Net Banking',
    description: 'Flat rent transfer for October'
  },
  {
    title: 'Supermarket Grocery & Dairy',
    amount: 3250,
    category: 'Food',
    date: new Date(2026, 9, 3),
    paymentMethod: 'UPI',
    description: 'Weekly groceries from Reliance Fresh'
  },
  {
    title: 'Electricity & Utility Bill',
    amount: 1840,
    category: 'Bills and Utilities',
    date: new Date(2026, 9, 5),
    paymentMethod: 'UPI',
    description: 'Monthly electricity bill paid via GPay'
  },
  {
    title: 'Metro Smart Card Recharge',
    amount: 1000,
    category: 'Transportation',
    date: new Date(2026, 9, 7),
    paymentMethod: 'Debit Card',
    description: 'Monthly metro pass for college transit'
  },
  {
    title: 'MCA Database Systems Reference Book',
    amount: 950,
    category: 'Education',
    date: new Date(2026, 9, 10),
    paymentMethod: 'Credit Card',
    description: 'Textbook for advanced database curriculum'
  },
  {
    title: 'Weekend Dining with Friends',
    amount: 1650,
    category: 'Food',
    date: new Date(2026, 9, 12),
    paymentMethod: 'UPI',
    description: 'Italian restaurant dinner'
  },
  {
    title: 'Doctor Consultation & Cough Syrup',
    amount: 800,
    category: 'Healthcare',
    date: new Date(2026, 9, 14),
    paymentMethod: 'Cash',
    description: 'Clinic visit for seasonal flu'
  },
  {
    title: 'Movie Tickets & Snacks',
    amount: 600,
    category: 'Entertainment',
    date: new Date(2026, 9, 16),
    paymentMethod: 'Debit Card',
    description: 'Weekend cinema screening'
  },
  {
    title: 'Festive Shopping & Formal Wear',
    amount: 4500,
    category: 'Shopping',
    date: new Date(2026, 9, 18),
    paymentMethod: 'Credit Card',
    description: 'Interview formals and festive attire'
  },
  {
    title: 'High-speed Fiber Broadband Plan',
    amount: 999,
    category: 'Bills and Utilities',
    date: new Date(2026, 9, 20),
    paymentMethod: 'Net Banking',
    description: 'Airtel Xstream broadband recharge'
  },
  {
    title: 'Weekend Roadtrip Fuel',
    amount: 2200,
    category: 'Travel',
    date: new Date(2026, 9, 22),
    paymentMethod: 'Credit Card',
    description: 'Petrol station fill-up for short getaway'
  },
  {
    title: 'Campus Cafeteria Refreshments',
    amount: 240,
    category: 'Food',
    date: new Date(2026, 9, 25),
    paymentMethod: 'UPI',
    description: 'Snacks during project presentation discussion'
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/personal_expense_tracker';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB...');

    await Expense.deleteMany({});
    console.log('[Seed] Cleared existing expenses.');

    const created = await Expense.insertMany(sampleExpenses);
    console.log(`[Seed] Successfully inserted ${created.length} expense records.`);

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDB();
