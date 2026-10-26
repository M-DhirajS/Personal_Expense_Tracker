import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingDown,
  Hash,
  Award,
  Calendar,
  ArrowRight,
  PlusCircle,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  CreditCard
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import { expenseAPI } from '../services/api';
import { useExpense } from '../context/ExpenseContext';
import StatCard from '../components/StatCard';
import CategoryBadge from '../components/CategoryBadge';

// Curated modern color palette for charts
const CATEGORY_COLORS = [
  '#6366f1', // Indigo
  '#f43f5e', // Rose
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#84cc16', // Lime
  '#64748b'  // Slate
];

export const Dashboard = () => {
  const navigate = useNavigate();
  const { formatCurrency, refreshKey, showToast, triggerRefresh } = useExpense();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await expenseAPI.getSummary();
      setSummary(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [refreshKey]);

  const handleSeed = async () => {
    try {
      const res = await expenseAPI.seedDemo();
      showToast('success', res.message || 'Demo data loaded successfully!');
      triggerRefresh();
    } catch (err) {
      showToast('error', err.message || 'Failed to seed sample data');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-primary" />
        <p>Loading financial insights from database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-icon-circle" style={{ backgroundColor: 'var(--rose-50)', color: 'var(--rose-600)' }}>
          <TrendingDown size={32} />
        </div>
        <h3>Unable to load dashboard data</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchSummary}>
          Retry Connection
        </button>
      </div>
    );
  }

  const hasExpenses = summary && summary.totalExpenses > 0;

  return (
    <div className="dashboard-page">
      {/* 1. Stat Cards Row */}
      <div className="stats-grid">
        <StatCard
          label="Total Spending"
          value={formatCurrency(summary?.totalSpending || 0)}
          subtitle="Cumulative expenses recorded"
          icon={<TrendingDown size={22} />}
          iconVariant="danger"
        />
        <StatCard
          label="Total Expenses"
          value={summary?.totalExpenses || 0}
          subtitle="Total transaction entries"
          icon={<Hash size={22} />}
          iconVariant="primary"
        />
        <StatCard
          label="Highest Spending Category"
          value={summary?.highestCategory || 'None'}
          subtitle={
            summary?.highestCategoryAmount
              ? `${formatCurrency(summary.highestCategoryAmount)} total`
              : 'No recorded category'
          }
          icon={<Award size={22} />}
          iconVariant="amber"
        />
        <StatCard
          label="Average Daily Spending"
          value={formatCurrency(summary?.averageDailySpending || 0)}
          subtitle="Calculated across expense active span"
          icon={<Calendar size={22} />}
          iconVariant="success"
        />
      </div>

      {!hasExpenses ? (
        <div className="chart-card empty-state" style={{ marginTop: '20px' }}>
          <div className="empty-icon-circle">
            <CreditCard size={36} />
          </div>
          <h3>No Expense Records Found in MongoDB</h3>
          <p>
            Start tracking your daily expenses by adding your first transaction, or seed demo data for faculty evaluation.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary" onClick={() => navigate('/add-expense')}>
              <PlusCircle size={18} />
              <span>Add Your First Expense</span>
            </button>
            <button className="btn btn-secondary" onClick={handleSeed}>
              <Sparkles size={18} style={{ color: 'var(--brand-600)' }} />
              <span>Populate Demo Data</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 2. Charts Section */}
          <div className="charts-grid-2">
            {/* Monthly Spending Bar Chart */}
            <div className="chart-card">
              <div className="card-header-flex">
                <div>
                  <h3>Monthly Spending Trend</h3>
                  <span className="card-subtitle">Spending breakdown over the last 6 months</span>
                </div>
                <BarChart3 size={20} color="var(--brand-600)" />
              </div>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary?.monthlySpending || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                    <XAxis
                      dataKey="monthName"
                      tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                      axisLine={{ stroke: 'var(--border-light)' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                    />
                    <Tooltip
                      formatter={(val) => [formatCurrency(val), 'Total Spent']}
                      contentStyle={{
                        backgroundColor: '#fff',
                        borderRadius: '10px',
                        border: '1px solid var(--border-light)',
                        boxShadow: 'var(--shadow-md)',
                        fontSize: '0.85rem'
                      }}
                    />
                    <Bar
                      dataKey="total"
                      fill="var(--brand-600)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expense Distribution Doughnut Chart */}
            <div className="chart-card">
              <div className="card-header-flex">
                <div>
                  <h3>Expense Distribution</h3>
                  <span className="card-subtitle">Percentage breakdown by category</span>
                </div>
                <PieIcon size={20} color="var(--brand-600)" />
              </div>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summary?.categoryBreakdown || []}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {(summary?.categoryBreakdown || []).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [formatCurrency(val), name]}
                      contentStyle={{
                        backgroundColor: '#fff',
                        borderRadius: '10px',
                        border: '1px solid var(--border-light)',
                        boxShadow: 'var(--shadow-md)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 3. Bottom Grid: Category Breakdown Progress & Recent Expenses */}
          <div className="charts-grid-2" style={{ marginBottom: 0 }}>
            {/* Category Breakdown with Progress Bars */}
            <div className="chart-card">
              <div className="card-header-flex">
                <div>
                  <h3>Category-wise Breakdown</h3>
                  <span className="card-subtitle">Distribution sorted by highest spending</span>
                </div>
              </div>
              <div className="category-progress-list">
                {summary?.categoryBreakdown?.map((item, idx) => (
                  <div key={item.category} className="category-progress-item">
                    <div className="progress-header">
                      <span className="progress-category-name">
                        <CategoryBadge category={item.category} />
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                          ({item.count} {item.count === 1 ? 'expense' : 'expenses'})
                        </span>
                      </span>
                      <span className="progress-category-amount">
                        {formatCurrency(item.total)}
                        <span style={{ color: 'var(--text-muted)', marginLeft: '6px', fontSize: '0.8rem', fontWeight: 500 }}>
                          {item.percentage}%
                        </span>
                      </span>
                    </div>
                    <div className="progress-bar-track">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Expenses List */}
            <div className="chart-card">
              <div className="card-header-flex">
                <div>
                  <h3>Recent Expenses</h3>
                  <span className="card-subtitle">Latest 5 recorded transactions</span>
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  onClick={() => navigate('/expenses')}
                >
                  <span>View All</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {summary?.recentExpenses?.map((expense) => (
                  <div
                    key={expense._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-hover)',
                      border: '1px solid var(--border-light)'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        {expense.title}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                        <CategoryBadge category={expense.category} />
                        <span style={{ color: 'var(--text-muted)' }}>
                          {new Date(expense.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, color: 'var(--rose-600)', fontSize: '0.95rem' }}>
                        {formatCurrency(expense.amount)}
                      </span>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {expense.paymentMethod}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
