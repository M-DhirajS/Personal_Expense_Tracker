import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  PieChart as PieIcon,
  BarChart2
} from 'lucide-react';
import { expenseAPI } from '../services/api';
import { useExpense } from '../context/ExpenseContext';
import CategoryBadge from '../components/CategoryBadge';

const PALETTE = [
  '#4f46e5',
  '#ec4899',
  '#10b981',
  '#f59e0b',
  '#06b6d4',
  '#8b5cf6',
  '#f43f5e',
  '#3b82f6',
  '#84cc16',
  '#64748b'
];

export const Analytics = () => {
  const { formatCurrency, refreshKey } = useExpense();

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState('all');

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await expenseAPI.getAnalytics({
        year: selectedYear,
        month: selectedMonth
      });
      setAnalytics(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedYear, selectedMonth, refreshKey]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-primary" />
        <p>Crunching financial analytics and charts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <h3>Analytics Unavailable</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchAnalytics}>
          Retry
        </button>
      </div>
    );
  }

  const comparison = analytics?.monthlyComparison;
  const isIncrease = (comparison?.difference || 0) > 0;

  return (
    <div className="analytics-page">
      {/* Filter Header Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
          padding: '16px 20px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Analytics Filter & Range</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Choose a specific year and month to inspect detailed distributions
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="form-select"
              style={{ width: '110px', padding: '6px 10px', fontSize: '0.85rem' }}
            >
              {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="form-select"
              style={{ width: '130px', padding: '6px 10px', fontSize: '0.85rem' }}
            >
              <option value="all">Full Year</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        {/* Total Spending in Selected Period */}
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Period Spending</span>
            <div className="stat-icon-wrapper stat-icon-danger">
              <TrendingDown size={22} />
            </div>
          </div>
          <div>
            <div className="stat-value">{formatCurrency(analytics?.totalAmount || 0)}</div>
            <div className="stat-subtitle">
              Across {analytics?.totalCount || 0} recorded transactions
            </div>
          </div>
        </div>

        {/* Average Expense Amount */}
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Average Expense Size</span>
            <div className="stat-icon-wrapper stat-icon-primary">
              <Calculator size={22} />
            </div>
          </div>
          <div>
            <div className="stat-value">{formatCurrency(analytics?.averageExpenseAmount || 0)}</div>
            <div className="stat-subtitle">Per individual expense ticket</div>
          </div>
        </div>

        {/* Monthly Comparison */}
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Month-Over-Month</span>
            <div
              className={`stat-icon-wrapper ${
                isIncrease ? 'stat-icon-danger' : 'stat-icon-success'
              }`}
            >
              {isIncrease ? <ArrowUpRight size={22} /> : <ArrowDownRight size={22} />}
            </div>
          </div>
          <div>
            <div className="stat-value">
              {comparison?.percentageChange > 0 ? `+${comparison.percentageChange}%` : `${comparison?.percentageChange || 0}%`}
            </div>
            <div className="stat-subtitle">
              {comparison?.currentMonthName} ({formatCurrency(comparison?.currentMonthTotal || 0)}) vs{' '}
              {comparison?.prevMonthName} ({formatCurrency(comparison?.prevMonthTotal || 0)})
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid-2">
        {/* 1. Monthly Spending Bar Chart */}
        <div className="chart-card">
          <div className="card-header-flex">
            <div>
              <h3>Monthly Spending Comparison ({selectedYear})</h3>
              <span className="card-subtitle">Annual spend trend month by month</span>
            </div>
            <BarChart2 size={20} color="var(--brand-600)" />
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.monthlyBarChart || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickLine={false} />
                <YAxis
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  formatter={(val) => [formatCurrency(val), 'Total Spending']}
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '10px',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-md)'
                  }}
                />
                <Bar dataKey="total" fill="var(--brand-600)" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Category Doughnut Chart */}
        <div className="chart-card">
          <div className="card-header-flex">
            <div>
              <h3>Category-wise Spending Share</h3>
              <span className="card-subtitle">Relative expense percentage</span>
            </div>
            <PieIcon size={20} color="var(--brand-600)" />
          </div>
          <div style={{ width: '100%', height: 300 }}>
            {analytics?.categoryBreakdown?.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <p>No category data for selected period</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics?.categoryBreakdown || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={3}
                  >
                    {(analytics?.categoryBreakdown || []).map((_, index) => (
                      <Cell key={`slice-${index}`} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [formatCurrency(val), name]}
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '10px',
                      border: '1px solid var(--border-light)',
                      boxShadow: 'var(--shadow-md)'
                    }}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    formatter={(val) => <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* 3. Daily Spending Trend Area Chart */}
      <div className="chart-card" style={{ marginBottom: '28px' }}>
        <div className="card-header-flex">
          <div>
            <h3>Daily Spending Trajectory</h3>
            <span className="card-subtitle">Daily expense timeline across recorded dates</span>
          </div>
          <Calendar size={20} color="var(--brand-600)" />
        </div>
        <div style={{ width: '100%', height: 260 }}>
          {analytics?.dailySpendingTrend?.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <p>No daily expense entries found for this selection</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.dailySpendingTrend || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--rose-500)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--rose-500)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                  tickFormatter={(val) => {
                    const parts = val.split('-');
                    return `${parts[2]}/${parts[1]}`;
                  }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  formatter={(val) => [formatCurrency(val), 'Amount Spent']}
                  labelFormatter={(lbl) => `Date: ${lbl}`}
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '10px',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-md)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="var(--rose-600)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 4. Top 5 Highest Spending Categories */}
      <div className="chart-card">
        <div className="card-header-flex">
          <div>
            <h3>Top Highest-Spending Categories</h3>
            <span className="card-subtitle">Ranked by total monetary volume</span>
          </div>
          <Layers size={20} color="var(--brand-600)" />
        </div>

        <div className="category-progress-list">
          {analytics?.topCategories?.map((item, idx) => (
            <div key={item.name} className="category-progress-item">
              <div className="progress-header">
                <span className="progress-category-name">
                  <span
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-subtle)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: 'var(--text-secondary)'
                    }}
                  >
                    #{idx + 1}
                  </span>
                  <CategoryBadge category={item.name} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    ({item.count} {item.count === 1 ? 'record' : 'records'})
                  </span>
                </span>
                <span className="progress-category-amount">
                  {formatCurrency(item.value)}
                  <span style={{ color: 'var(--text-muted)', marginLeft: '8px', fontSize: '0.8rem', fontWeight: 500 }}>
                    {item.percentage}%
                  </span>
                </span>
              </div>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: PALETTE[idx % PALETTE.length]
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
