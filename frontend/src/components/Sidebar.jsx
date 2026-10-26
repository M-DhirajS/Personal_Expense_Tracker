import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  PieChart,
  Settings,
  WalletCards,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={19} /> },
    { to: '/expenses', label: 'All Expenses', icon: <Receipt size={19} /> },
    { to: '/add-expense', label: 'Add Expense', icon: <PlusCircle size={19} /> },
    { to: '/analytics', label: 'Expense Analytics', icon: <PieChart size={19} /> },
    { to: '/settings', label: 'Settings & Info', icon: <Settings size={19} /> }
  ];

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-icon-wrapper">
            <WalletCards size={24} />
          </div>
          <div className="brand-info" style={{ flex: 1 }}>
            <h2>SpendWise</h2>
            <p>Expense Tracker</p>
          </div>
          {isOpen && (
            <button
              className="btn-icon-only mobile-menu-btn"
              onClick={onClose}
              title="Close Menu"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
              onClick={onClose}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-badge">
            <div className="user-avatar">MCA</div>
            <div className="user-meta">
              <h4>MCA Student</h4>
              <p>
                <span className="status-dot"></span> MERN Active
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
