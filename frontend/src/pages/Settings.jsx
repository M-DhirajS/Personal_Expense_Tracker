import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  Info,
  Layers,
  CreditCard,
  Sparkles,
  Trash2,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { expenseAPI } from '../services/api';
import { useExpense } from '../context/ExpenseContext';
import CategoryBadge from '../components/CategoryBadge';
import ConfirmDialog from '../components/ConfirmDialog';

export const Settings = () => {
  const { currency, setCurrency, EXPENSE_CATEGORIES, PAYMENT_METHODS, showToast, refreshKey, triggerRefresh } = useExpense();

  const [systemInfo, setSystemInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const fetchInfo = async () => {
    try {
      setLoading(true);
      const res = await expenseAPI.getInfo();
      setSystemInfo(res.data);
    } catch (err) {
      showToast('error', 'Failed to retrieve database system information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, [refreshKey]);

  const handleSeed = async () => {
    try {
      const res = await expenseAPI.seedDemo();
      showToast('success', res.message || 'Demo data loaded successfully!');
      triggerRefresh();
      fetchInfo();
    } catch (err) {
      showToast('error', err.message || 'Failed to seed sample data');
    }
  };

  const handleClearAll = async () => {
    try {
      setClearing(true);
      // Fetch all to delete or use an endpoint
      const allExpenses = await expenseAPI.getAll();
      for (const exp of allExpenses.data) {
        await expenseAPI.delete(exp._id);
      }
      showToast('success', 'All expense records cleared from MongoDB');
      setShowClearConfirm(false);
      triggerRefresh();
      fetchInfo();
    } catch (err) {
      showToast('error', err.message || 'Failed to clear records');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="settings-page">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Project & Case Study Info Card */}
        <div className="chart-card">
          <div className="card-header-flex">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--brand-50)',
                  color: 'var(--brand-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Info size={20} />
              </div>
              <div>
                <h3>Academic Case Study Info</h3>
                <span className="card-subtitle">Project & Architectural Overview</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="detail-item">
              <span className="detail-label">Application Name</span>
              <span className="detail-value" style={{ fontWeight: 700 }}>
                Personal Expense Tracker
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Project Scope</span>
              <span className="detail-value">MCA MERN Stack Development Case Study</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Architecture</span>
              <span className="detail-value">
                MERN (MongoDB, Express.js REST API, React.js Vite Frontend, Node.js)
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Key Libraries</span>
              <span className="detail-value" style={{ fontSize: '0.85rem' }}>
                React Hooks, React Router DOM, Axios, Recharts, Lucide Icons, Mongoose, CORS, Dotenv
              </span>
            </div>
          </div>
        </div>

        {/* Live Database & System Status Card */}
        <div className="chart-card">
          <div className="card-header-flex">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--green-50)',
                  color: 'var(--green-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Database size={20} />
              </div>
              <div>
                <h3>MongoDB Database Status</h3>
                <span className="card-subtitle">Live backend database metrics</span>
              </div>
            </div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--green-600)',
                backgroundColor: 'var(--green-50)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)'
              }}
            >
              <span className="status-dot"></span>
              {systemInfo?.database?.status || 'Active'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="detail-item">
              <span className="detail-label">Database Name</span>
              <span className="detail-value" style={{ fontFamily: 'monospace', color: 'var(--brand-600)' }}>
                {systemInfo?.database?.name || 'personal_expense_tracker'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Host & Port</span>
              <span className="detail-value" style={{ fontFamily: 'monospace' }}>
                {systemInfo?.database?.host || '127.0.0.1'}:{systemInfo?.database?.port || 27017}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Total Expense Documents</span>
              <span className="detail-value" style={{ fontWeight: 700 }}>
                {systemInfo?.database?.totalExpenseRecords ?? '...'} records
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Backend Environment</span>
              <span className="detail-value">{systemInfo?.environment || 'development'}</span>
            </div>
          </div>
        </div>

        {/* Currency & Presentation Preferences Card */}
        <div className="chart-card">
          <div className="card-header-flex">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--amber-50)',
                  color: 'var(--amber-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <DollarSign size={20} />
              </div>
              <div>
                <h3>Display Preferences</h3>
                <span className="card-subtitle">Currency & Presentation Settings</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Active Currency Symbol
              </label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                {[
                  { symbol: '₹', label: 'INR (₹)' },
                  { symbol: '$', label: 'USD ($)' },
                  { symbol: '€', label: 'EUR (€)' },
                  { symbol: '£', label: 'GBP (£)' }
                ].map((item) => (
                  <button
                    key={item.symbol}
                    type="button"
                    onClick={() => setCurrency(item.symbol)}
                    className={`btn ${
                      currency === item.symbol ? 'btn-primary' : 'btn-secondary'
                    }`}
                    style={{ flex: 1, padding: '8px' }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <label style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Quick Evaluation Actions
              </label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button className="btn btn-secondary" onClick={handleSeed} style={{ flex: 1 }}>
                  <Sparkles size={16} color="var(--brand-600)" />
                  <span>Seed Demo Data</span>
                </button>
                <button
                  className="btn btn-outline-danger"
                  onClick={() => setShowClearConfirm(true)}
                  style={{ flex: 1 }}
                >
                  <Trash2 size={16} />
                  <span>Clear All Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supported Categories & Payment Methods section */}
      <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Categories */}
        <div className="chart-card">
          <div className="card-header-flex">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Layers size={20} color="var(--brand-600)" />
              <div>
                <h3>Supported Expense Categories</h3>
                <span className="card-subtitle">
                  {EXPENSE_CATEGORIES.length} standardized categories configured in Mongoose schema
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {EXPENSE_CATEGORIES.map((cat) => (
              <CategoryBadge key={cat} category={cat} />
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="chart-card">
          <div className="card-header-flex">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CreditCard size={20} color="var(--brand-600)" />
              <div>
                <h3>Supported Payment Methods</h3>
                <span className="card-subtitle">
                  {PAYMENT_METHODS.length} payment channels supported in validation rules
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {PAYMENT_METHODS.map((method) => (
              <span key={method} className="badge badge-payment" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Clear All */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearAll}
        title="Clear All Expense Records"
        message="Are you sure you want to delete ALL expense records from MongoDB? This will reset the database to an empty state."
        confirmText="Yes, Clear Everything"
        isDanger={true}
        isLoading={clearing}
      />
    </div>
  );
};

export default Settings;
