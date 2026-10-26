import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ExpenseContext = createContext(null);

export const EXPENSE_CATEGORIES = [
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

export const PAYMENT_METHODS = [
  'Cash',
  'UPI',
  'Debit Card',
  'Credit Card',
  'Net Banking',
  'Other'
];

export const ExpenseProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('pet_currency') || '₹';
  });

  const [toasts, setToasts] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const setCurrency = (curr) => {
    setCurrencyState(curr);
    localStorage.setItem('pet_currency', curr);
  };

  const formatCurrency = useCallback((amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return `${currency}0.00`;
    }
    const num = Number(amount);
    return `${currency}${num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }, [currency]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type, message) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <ExpenseContext.Provider
      value={{
        currency,
        setCurrency,
        formatCurrency,
        toasts,
        showToast,
        removeToast,
        refreshKey,
        triggerRefresh,
        EXPENSE_CATEGORIES,
        PAYMENT_METHODS
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};
