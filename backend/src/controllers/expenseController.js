const { Expense, EXPENSE_CATEGORIES, PAYMENT_METHODS } = require('../models/Expense');
const mongoose = require('mongoose');

// @desc    Get all expenses with search, filters, and sorting
// @route   GET /api/expenses
// @access  Public
const getAllExpenses = async (req, res, next) => {
  try {
    const { search, category, paymentMethod, startDate, endDate, sortBy = 'date', order = 'desc' } = req.query;

    const filter = {};

    // Search by title (case-insensitive)
    if (search && search.trim() !== '') {
      filter.title = { $regex: search.trim(), $options: 'i' };
    }

    // Filter by Category
    if (category && category !== 'All' && category !== '') {
      filter.category = category;
    }

    // Filter by Payment Method
    if (paymentMethod && paymentMethod !== 'All' && paymentMethod !== '') {
      filter.paymentMethod = paymentMethod;
    }

    // Filter by Date Range
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    // Sorting
    const sortField = ['date', 'amount', 'title'].includes(sortBy) ? sortBy : 'date';
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortField]: sortOrder };

    const expenses = await Expense.find(filter).sort(sortObj);

    // Calculate sum of currently filtered expenses
    const totalAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    res.status(200).json({
      success: true,
      count: expenses.length,
      totalAmount: Number(totalAmount.toFixed(2)),
      data: expenses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expense by ID
// @route   GET /api/expenses/:id
// @access  Public
const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Public
const createExpense = async (req, res, next) => {
  try {
    const { title, amount, category, date, paymentMethod, description } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Expense title is required' });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a valid positive number' });
    }

    if (!category || !EXPENSE_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, message: 'Valid expense category is required' });
    }

    if (!paymentMethod || !PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Valid payment method is required' });
    }

    const expense = await Expense.create({
      title: title.trim(),
      amount: numAmount,
      category,
      date: date ? new Date(date) : new Date(),
      paymentMethod,
      description: description ? description.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing expense
// @route   PUT /api/expenses/:id
// @access  Public
const updateExpense = async (req, res, next) => {
  try {
    const { title, amount, category, date, paymentMethod, description } = req.body;

    const numAmount = parseFloat(amount);
    if (amount !== undefined && (isNaN(numAmount) || numAmount <= 0)) {
      return res.status(400).json({ success: false, message: 'Amount must be a positive number' });
    }

    if (category && !EXPENSE_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }

    if (paymentMethod && !PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Invalid payment method' });
    }

    const updatedData = {
      ...(title !== undefined && { title: title.trim() }),
      ...(amount !== undefined && { amount: numAmount }),
      ...(category !== undefined && { category }),
      ...(date !== undefined && { date: new Date(date) }),
      ...(paymentMethod !== undefined && { paymentMethod }),
      ...(description !== undefined && { description: description.trim() })
    };

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Public
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
      data: { id: req.params.id }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard summary metrics and statistics
// @route   GET /api/expenses/stats/summary
// @access  Public
const getDashboardSummary = async (req, res, next) => {
  try {
    const totalCount = await Expense.countDocuments();

    if (totalCount === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalSpending: 0,
          totalExpenses: 0,
          highestCategory: 'N/A',
          highestCategoryAmount: 0,
          averageDailySpending: 0,
          recentExpenses: [],
          categoryBreakdown: [],
          monthlySpending: [],
          paymentMethodBreakdown: []
        }
      });
    }

    // Total spending
    const totalSpendingResult = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalSpending = totalSpendingResult[0]?.total || 0;

    // Highest spending category
    const categoryAgg = await Expense.aggregate([
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    const highestCategory = categoryAgg[0]?._id || 'N/A';
    const highestCategoryAmount = categoryAgg[0]?.total || 0;

    // Category breakdown with percentage
    const categoryBreakdown = categoryAgg.map(cat => ({
      category: cat._id,
      total: Number(cat.total.toFixed(2)),
      count: cat.count,
      percentage: Number(((cat.total / (totalSpending || 1)) * 100).toFixed(1))
    }));

    // Average daily spending (over total recorded span or minimum 1 day)
    const dateRange = await Expense.aggregate([
      {
        $group: {
          _id: null,
          minDate: { $min: '$date' },
          maxDate: { $max: '$date' }
        }
      }
    ]);

    let daySpan = 1;
    if (dateRange[0]?.minDate && dateRange[0]?.maxDate) {
      const diffTime = Math.abs(new Date(dateRange[0].maxDate) - new Date(dateRange[0].minDate));
      daySpan = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }
    const averageDailySpending = Number((totalSpending / daySpan).toFixed(2));

    // Recent 5 expenses
    const recentExpenses = await Expense.find().sort({ date: -1, createdAt: -1 }).limit(5);

    // Monthly Spending (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyAgg = await Expense.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format monthly data with month names
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlySpending = monthlyAgg.map(item => ({
      year: item._id.year,
      month: item._id.month,
      monthName: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      total: Number(item.total.toFixed(2)),
      count: item.count
    }));

    // Payment method breakdown
    const paymentAgg = await Expense.aggregate([
      { $group: { _id: '$paymentMethod', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    const paymentMethodBreakdown = paymentAgg.map(p => ({
      method: p._id,
      total: Number(p.total.toFixed(2)),
      count: p.count,
      percentage: Number(((p.total / (totalSpending || 1)) * 100).toFixed(1))
    }));

    res.status(200).json({
      success: true,
      data: {
        totalSpending: Number(totalSpending.toFixed(2)),
        totalExpenses: totalCount,
        highestCategory,
        highestCategoryAmount: Number(highestCategoryAmount.toFixed(2)),
        averageDailySpending,
        recentExpenses,
        categoryBreakdown,
        monthlySpending,
        paymentMethodBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get in-depth analytics
// @route   GET /api/expenses/stats/analytics
// @access  Public
const getAnalytics = async (req, res, next) => {
  try {
    const { year, month } = req.query;

    const filter = {};
    const now = new Date();
    const targetYear = year ? parseInt(year, 10) : now.getFullYear();

    if (month && month !== 'all') {
      const targetMonth = parseInt(month, 10) - 1; // 0-indexed
      const startOfMonth = new Date(targetYear, targetMonth, 1);
      const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);
      filter.date = { $gte: startOfMonth, $lte: endOfMonth };
    } else {
      const startOfYear = new Date(targetYear, 0, 1);
      const endOfYear = new Date(targetYear, 11, 31, 23, 59, 59, 999);
      filter.date = { $gte: startOfYear, $lte: endOfYear };
    }

    const expenses = await Expense.find(filter).sort({ date: 1 });

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalCount = expenses.length;
    const averageExpenseAmount = totalCount > 0 ? Number((totalAmount / totalCount).toFixed(2)) : 0;

    // Monthly Bar Chart (All 12 months for targetYear)
    const monthlyBarAgg = await Expense.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(targetYear, 0, 1),
            $lte: new Date(targetYear, 11, 31, 23, 59, 59, 999)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$date' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyBarChart = monthNames.map((name, idx) => {
      const found = monthlyBarAgg.find(m => m._id === idx + 1);
      return {
        month: name,
        monthIndex: idx + 1,
        total: found ? Number(found.total.toFixed(2)) : 0,
        count: found ? found.count : 0
      };
    });

    // Category-wise doughnut chart for the filtered selection
    const categoryAgg = await Expense.aggregate([
      { $match: filter },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    const categoryBreakdown = categoryAgg.map(cat => ({
      name: cat._id,
      value: Number(cat.total.toFixed(2)),
      count: cat.count,
      percentage: totalAmount > 0 ? Number(((cat.total / totalAmount) * 100).toFixed(1)) : 0
    }));

    // Daily spending trend
    const dailyAgg = await Expense.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const dailySpendingTrend = dailyAgg.map(day => ({
      date: day._id,
      amount: Number(day.total.toFixed(2)),
      count: day.count
    }));

    // Top highest spending categories
    const topCategories = categoryBreakdown.slice(0, 5);

    // Monthly Comparison: Current Month vs Previous Month
    const currentMonthNum = now.getMonth();
    const currentYearNum = now.getFullYear();

    const currentMonthExpenses = await Expense.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(currentYearNum, currentMonthNum, 1),
            $lte: new Date(currentYearNum, currentMonthNum + 1, 0, 23, 59, 59, 999)
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const prevMonthNum = currentMonthNum === 0 ? 11 : currentMonthNum - 1;
    const prevYearNum = currentMonthNum === 0 ? currentYearNum - 1 : currentYearNum;

    const prevMonthExpenses = await Expense.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(prevYearNum, prevMonthNum, 1),
            $lte: new Date(prevYearNum, prevMonthNum + 1, 0, 23, 59, 59, 999)
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const currentMonthTotal = currentMonthExpenses[0]?.total || 0;
    const prevMonthTotal = prevMonthExpenses[0]?.total || 0;

    let monthlyChangePercentage = 0;
    if (prevMonthTotal > 0) {
      monthlyChangePercentage = Number((((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100).toFixed(1));
    }

    res.status(200).json({
      success: true,
      data: {
        filter: { year: targetYear, month: month || 'all' },
        totalAmount: Number(totalAmount.toFixed(2)),
        totalCount,
        averageExpenseAmount,
        monthlyBarChart,
        categoryBreakdown,
        dailySpendingTrend,
        topCategories,
        monthlyComparison: {
          currentMonthName: monthNames[currentMonthNum],
          currentMonthTotal: Number(currentMonthTotal.toFixed(2)),
          prevMonthName: monthNames[prevMonthNum],
          prevMonthTotal: Number(prevMonthTotal.toFixed(2)),
          difference: Number((currentMonthTotal - prevMonthTotal).toFixed(2)),
          percentageChange: monthlyChangePercentage
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Seed demo data for MCA case study evaluation
// @route   POST /api/expenses/seed
// @access  Public
const seedDemoExpenses = async (req, res, next) => {
  try {
    const sampleData = [
      { title: 'Monthly Apartment Rent', amount: 15000, category: 'Rent', date: new Date(new Date().setDate(2)), paymentMethod: 'Net Banking', description: 'Monthly flat rent payment' },
      { title: 'Grocery Shopping at DMart', amount: 3450, category: 'Food', date: new Date(new Date().setDate(4)), paymentMethod: 'UPI', description: 'Vegetables, milk, pulses and snacks' },
      { title: 'Electricity & Water Bill', amount: 1850, category: 'Bills and Utilities', date: new Date(new Date().setDate(5)), paymentMethod: 'UPI', description: 'State electricity board utility bill' },
      { title: 'Metro & Cab Travel Pass', amount: 1200, category: 'Transportation', date: new Date(new Date().setDate(7)), paymentMethod: 'Debit Card', description: 'Smart card recharge for daily college commute' },
      { title: 'MCA Cloud Computing Textbook', amount: 890, category: 'Education', date: new Date(new Date().setDate(9)), paymentMethod: 'Credit Card', description: 'Reference textbook for semester exams' },
      { title: 'Family Dinner at Barbeque Nation', amount: 2800, category: 'Food', date: new Date(new Date().setDate(11)), paymentMethod: 'Credit Card', description: 'Celebration dinner with family' },
      { title: 'Pharmacy & Doctor Consultation', amount: 750, category: 'Healthcare', date: new Date(new Date().setDate(13)), paymentMethod: 'Cash', description: 'Prescription medicines and consultation' },
      { title: 'Weekend Movie & Popcorn', amount: 650, category: 'Entertainment', date: new Date(new Date().setDate(15)), paymentMethod: 'UPI', description: 'IMAX movie ticket with snacks' },
      { title: 'Clothing & Footwear Festival Sale', amount: 4200, category: 'Shopping', date: new Date(new Date().setDate(18)), paymentMethod: 'Credit Card', description: 'Shirts and formal shoes for placements' },
      { title: 'High-speed Fiber Broadband', amount: 999, category: 'Bills and Utilities', date: new Date(new Date().setDate(20)), paymentMethod: 'Net Banking', description: 'Monthly 200Mbps unlimited fiber plan' },
      { title: 'Train Tickets for Vacation', amount: 3100, category: 'Travel', date: new Date(new Date().setDate(22)), paymentMethod: 'UPI', description: 'IRCTC return tickets for weekend trip' },
      { title: 'Cafeteria Coffee & Breakfast', amount: 180, category: 'Food', date: new Date(new Date().setDate(24)), paymentMethod: 'UPI', description: 'College canteen coffee and sandwiches' }
    ];

    // Delete existing and insert sample
    await Expense.deleteMany({});
    const inserted = await Expense.insertMany(sampleData);

    res.status(201).json({
      success: true,
      message: `Successfully seeded ${inserted.length} sample expenses for testing!`,
      data: inserted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Application & Database metadata for Settings page
// @route   GET /api/info
// @access  Public
const getSystemInfo = async (req, res, next) => {
  try {
    const totalExpenses = await Expense.countDocuments();
    const dbState = mongoose.connection.readyState;
    const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];

    res.status(200).json({
      success: true,
      data: {
        appName: 'Personal Expense Tracker',
        projectType: 'MCA MERN Stack Development Case Study',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: {
          name: mongoose.connection.name || 'personal_expense_tracker',
          host: mongoose.connection.host || '127.0.0.1',
          port: mongoose.connection.port || 27017,
          status: states[dbState] || 'Unknown',
          totalExpenseRecords: totalExpenses
        },
        supportedCategories: EXPENSE_CATEGORIES,
        supportedPaymentMethods: PAYMENT_METHODS
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getDashboardSummary,
  getAnalytics,
  seedDemoExpenses,
  getSystemInfo
};
