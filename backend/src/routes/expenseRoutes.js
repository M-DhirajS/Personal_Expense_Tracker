const express = require('express');
const router = express.Router();

const {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getDashboardSummary,
  getAnalytics,
  seedDemoExpenses
} = require('../controllers/expenseController');

// Specialized analytics and aggregation routes (must be placed before /:id)
router.get('/stats/summary', getDashboardSummary);
router.get('/stats/analytics', getAnalytics);
router.post('/seed', seedDemoExpenses);

// Standard CRUD endpoints
router.route('/')
  .get(getAllExpenses)
  .post(createExpense);

router.route('/:id')
  .get(getExpenseById)
  .put(updateExpense)
  .delete(deleteExpense);

module.exports = router;
