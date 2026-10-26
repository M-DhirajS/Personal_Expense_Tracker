import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ExpenseProvider } from './context/ExpenseContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ToastContainer from './components/Toast';

import Dashboard from './pages/Dashboard';
import AllExpenses from './pages/AllExpenses';
import AddExpense from './pages/AddExpense';
import EditExpense from './pages/EditExpense';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

export function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ExpenseProvider>
      <BrowserRouter>
        <div className="app-container">
          {/* Responsive Sidebar */}
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Main Wrapper */}
          <div className="main-wrapper">
            <Navbar onOpenSidebar={() => setSidebarOpen(true)} />

            <main className="page-container">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/expenses" element={<AllExpenses />} />
                <Route path="/add-expense" element={<AddExpense />} />
                <Route path="/edit-expense/:id" element={<EditExpense />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>

          {/* Global Toast Notifications */}
          <ToastContainer />
        </div>
      </BrowserRouter>
    </ExpenseProvider>
  );
}

export default App;
