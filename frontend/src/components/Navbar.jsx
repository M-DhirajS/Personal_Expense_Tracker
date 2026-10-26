import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Plus, Sparkles } from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { expenseAPI } from '../services/api';

export const Navbar = ({ onOpenSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast, triggerRefresh } = useExpense();

  const getPageMeta = () => {
    switch (location.pathname) {
      case '/':
        return {
          title: 'Financial Dashboard',
          subtitle: 'Overview of your personal spending and expense analytics'
        };
      case '/expenses':
        return {
          title: 'All Expenses',
          subtitle: 'Manage, search, filter, and review all recorded expenses'
        };
      case '/add-expense':
        return {
          title: 'Add New Expense',
          subtitle: 'Record a new daily transaction with details'
        };
      case '/analytics':
        return {
          title: 'Expense Analytics & Trends',
          subtitle: 'In-depth visual breakdown and monthly spending comparisons'
        };
      case '/settings':
        return {
          title: 'Settings & Application Info',
          subtitle: 'MongoDB connection details, metadata, and preferences'
        };
      default:
        if (location.pathname.startsWith('/edit-expense')) {
          return {
            title: 'Edit Expense',
            subtitle: 'Update details for this expense record'
          };
        }
        return {
          title: 'Expense Tracker',
          subtitle: 'Manage your finances smartly'
        };
    }
  };

  const handleQuickSeed = async () => {
    try {
      const res = await expenseAPI.seedDemo();
      showToast('success', res.message || 'Sample demo data seeded successfully!');
      triggerRefresh();
    } catch (err) {
      showToast('error', err.message || 'Failed to seed sample data');
    }
  };

  const meta = getPageMeta();

  return (
    <header className="top-navbar">
      <div className="top-navbar-left">
        <button
          className="mobile-menu-btn"
          onClick={onOpenSidebar}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>
        <div className="page-title-section">
          <h1>{meta.title}</h1>
          <p>{meta.subtitle}</p>
        </div>
      </div>

      <div className="top-navbar-right">
        <button
          className="btn btn-secondary"
          onClick={handleQuickSeed}
          title="Seed realistic sample data to demonstrate charts & metrics immediately"
        >
          <Sparkles size={16} style={{ color: 'var(--brand-600)' }} />
          <span>Demo Data</span>
        </button>

        {location.pathname !== '/add-expense' && (
          <button
            className="btn btn-primary"
            onClick={() => navigate('/add-expense')}
          >
            <Plus size={16} />
            <span>Add Expense</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
