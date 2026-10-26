import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  Calendar,
  CreditCard,
  Tag,
  ArrowUpDown,
  RotateCcw,
  PlusCircle,
  FileText,
  DollarSign
} from 'lucide-react';
import { expenseAPI } from '../services/api';
import { useExpense } from '../context/ExpenseContext';
import CategoryBadge from '../components/CategoryBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

export const AllExpenses = () => {
  const navigate = useNavigate();
  const { formatCurrency, EXPENSE_CATEGORIES, PAYMENT_METHODS, showToast, refreshKey, triggerRefresh } = useExpense();

  const [expenses, setExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [order, setOrder] = useState('desc');

  // Modal States
  const [viewingExpense, setViewingExpense] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    amount: '',
    category: '',
    date: '',
    paymentMethod: '',
    description: ''
  });
  const [editErrors, setEditErrors] = useState({});
  const [updating, setUpdating] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        sortBy,
        order
      };
      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      if (paymentMethod) params.paymentMethod = paymentMethod;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await expenseAPI.getAll(params);
      setExpenses(res.data || []);
      setTotalAmount(res.totalAmount || 0);
    } catch (err) {
      showToast('error', err.message || 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  }, [search, category, paymentMethod, startDate, endDate, sortBy, order, showToast]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses, refreshKey]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setPaymentMethod('');
    setStartDate('');
    setEndDate('');
    setSortBy('date');
    setOrder('desc');
  };

  // Open Edit Modal
  const handleOpenEdit = (expense) => {
    setEditingExpense(expense);
    setEditForm({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: new Date(expense.date).toISOString().split('T')[0],
      paymentMethod: expense.paymentMethod,
      description: expense.description || ''
    });
    setEditErrors({});
  };

  // Handle Edit Input Change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    if (editErrors[name]) {
      setEditErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  // Validate and Submit Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!editForm.title.trim()) newErrors.title = 'Title is required';
    const num = parseFloat(editForm.amount);
    if (!editForm.amount || isNaN(num) || num <= 0) newErrors.amount = 'Valid positive amount is required';
    if (!editForm.category) newErrors.category = 'Category is required';
    if (!editForm.date) newErrors.date = 'Date is required';
    if (!editForm.paymentMethod) newErrors.paymentMethod = 'Payment method is required';

    if (Object.keys(newErrors).length > 0) {
      setEditErrors(newErrors);
      return;
    }

    try {
      setUpdating(true);
      const res = await expenseAPI.update(editingExpense._id, {
        ...editForm,
        amount: num
      });
      showToast('success', res.message || 'Expense updated successfully');
      setEditingExpense(null);
      triggerRefresh();
    } catch (err) {
      showToast('error', err.message || 'Failed to update expense');
    } finally {
      setUpdating(false);
    }
  };

  // Confirm and Execute Delete
  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      setIsDeleting(true);
      const res = await expenseAPI.delete(deletingId);
      showToast('success', res.message || 'Expense deleted successfully');
      setDeletingId(null);
      triggerRefresh();
    } catch (err) {
      showToast('error', err.message || 'Failed to delete expense');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="all-expenses-page">
      {/* Top Filter & Search Toolbar */}
      <div className="filter-toolbar">
        {/* Search by title */}
        <div className="filter-group">
          <label htmlFor="search-input">Search Title</label>
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              id="search-input"
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input search-input"
            />
          </div>
        </div>

        {/* Filter by Category */}
        <div className="filter-group">
          <label htmlFor="filter-cat">Category</label>
          <select
            id="filter-cat"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-select"
          >
            <option value="">All Categories</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Payment Method */}
        <div className="filter-group">
          <label htmlFor="filter-payment">Payment Method</label>
          <select
            id="filter-payment"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="form-select"
          >
            <option value="">All Methods</option>
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="filter-group" style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="start-date">From</label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="form-input"
              style={{ padding: '8px 10px', fontSize: '0.85rem' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="end-date">To</label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="form-input"
              style={{ padding: '8px 10px', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Reset Filters & Sort Controls */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleResetFilters}
            title="Reset All Filters"
          >
            <RotateCcw size={15} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Summary Banner for Filtered Results */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          padding: '12px 18px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Showing <strong>{expenses.length}</strong> {expenses.length === 1 ? 'record' : 'records'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sort:</span>
            <select
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [sb, ord] = e.target.value.split('-');
                setSortBy(sb);
                setOrder(ord);
              }}
              style={{
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                fontSize: '0.8rem',
                backgroundColor: 'var(--bg-subtle)'
              }}
            >
              <option value="date-desc">Newest Date First</option>
              <option value="date-asc">Oldest Date First</option>
              <option value="amount-desc">Highest Amount First</option>
              <option value="amount-asc">Lowest Amount First</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Filtered Total:
          </span>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.2rem',
              fontWeight: 800,
              color: 'var(--rose-600)'
            }}
          >
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </div>

      {/* Main Expenses Table */}
      <div className="table-card">
        {loading ? (
          <div className="loading-container">
            <div className="spinner spinner-primary" />
            <p>Fetching expenses from MongoDB...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-circle">
              <FileText size={32} />
            </div>
            <h3>No Expenses Found</h3>
            <p>
              {search || category || paymentMethod || startDate || endDate
                ? 'No expense matches your search or filter criteria. Try resetting filters.'
                : 'Your expense list is empty. Add your first expense to get started!'}
            </p>
            {search || category || paymentMethod || startDate || endDate ? (
              <button className="btn btn-secondary" onClick={handleResetFilters}>
                Clear All Filters
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => navigate('/add-expense')}>
                <PlusCircle size={16} />
                <span>Add Expense</span>
              </button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Payment Method</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense._id}>
                    <td>
                      <span className="cell-title">{expense.title}</span>
                    </td>
                    <td>
                      <span className="cell-amount">{formatCurrency(expense.amount)}</span>
                    </td>
                    <td>
                      <CategoryBadge category={expense.category} />
                    </td>
                    <td>
                      {new Date(expense.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td>
                      <span className="badge badge-payment">{expense.paymentMethod}</span>
                    </td>
                    <td>
                      <span
                        style={{
                          maxWidth: '180px',
                          display: 'inline-block',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          color: expense.description ? 'var(--text-secondary)' : 'var(--text-muted)'
                        }}
                      >
                        {expense.description || '—'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="btn-icon-only"
                          title="View Details"
                          onClick={() => setViewingExpense(expense)}
                        >
                          <Eye size={17} color="var(--brand-600)" />
                        </button>
                        <button
                          className="btn-icon-only"
                          title="Edit Expense"
                          onClick={() => handleOpenEdit(expense)}
                        >
                          <Pencil size={17} color="var(--amber-600)" />
                        </button>
                        <button
                          className="btn-icon-only"
                          title="Delete Expense"
                          onClick={() => setDeletingId(expense._id)}
                        >
                          <Trash2 size={17} color="var(--rose-600)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 1. View Details Modal */}
      <Modal
        isOpen={Boolean(viewingExpense)}
        onClose={() => setViewingExpense(null)}
        title="Expense Details"
        footer={
          <button
            className="btn btn-secondary"
            onClick={() => setViewingExpense(null)}
          >
            Close
          </button>
        }
      >
        {viewingExpense && (
          <div>
            <div className="detail-item">
              <span className="detail-label">Title</span>
              <span className="detail-value" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {viewingExpense.title}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="detail-item">
                <span className="detail-label">Amount</span>
                <span
                  className="detail-value"
                  style={{ color: 'var(--rose-600)', fontWeight: 800, fontSize: '1.3rem' }}
                >
                  {formatCurrency(viewingExpense.amount)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Category</span>
                <div style={{ marginTop: '4px' }}>
                  <CategoryBadge category={viewingExpense.category} />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="detail-item">
                <span className="detail-label">Expense Date</span>
                <span className="detail-value">
                  {new Date(viewingExpense.date).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Payment Method</span>
                <span className="detail-value">{viewingExpense.paymentMethod}</span>
              </div>
            </div>

            <div className="detail-item">
              <span className="detail-label">Description / Notes</span>
              <p
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  marginTop: '4px',
                  fontSize: '0.9rem',
                  lineHeight: '1.5'
                }}
              >
                {viewingExpense.description || 'No description provided.'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
              <div className="detail-item">
                <span className="detail-label">Database Record ID</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {viewingExpense._id}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Recorded At</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date(viewingExpense.createdAt || viewingExpense.date).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 2. Edit Expense Modal */}
      <Modal
        isOpen={Boolean(editingExpense)}
        onClose={() => setEditingExpense(null)}
        title="Edit Expense"
        maxWidth="620px"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setEditingExpense(null)}
              disabled={updating}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveEdit}
              disabled={updating}
            >
              {updating ? <span className="spinner" style={{ width: '16px', height: '16px' }} /> : null}
              <span>{updating ? 'Saving Changes...' : 'Save Changes'}</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveEdit}>
          <div className="form-grid">
            <div className="form-group form-group-full">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={editForm.title}
                onChange={handleEditChange}
                className={`form-input ${editErrors.title ? 'input-error' : ''}`}
                required
              />
              {editErrors.title && <span className="field-error-msg">{editErrors.title}</span>}
            </div>

            <div className="form-group">
              <label>Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="amount"
                value={editForm.amount}
                onChange={handleEditChange}
                className={`form-input ${editErrors.amount ? 'input-error' : ''}`}
                required
              />
              {editErrors.amount && <span className="field-error-msg">{editErrors.amount}</span>}
            </div>

            <div className="form-group">
              <label>Expense Date *</label>
              <input
                type="date"
                name="date"
                value={editForm.date}
                onChange={handleEditChange}
                className={`form-input ${editErrors.date ? 'input-error' : ''}`}
                required
              />
              {editErrors.date && <span className="field-error-msg">{editErrors.date}</span>}
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                value={editForm.category}
                onChange={handleEditChange}
                className={`form-select ${editErrors.category ? 'input-error' : ''}`}
                required
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {editErrors.category && <span className="field-error-msg">{editErrors.category}</span>}
            </div>

            <div className="form-group">
              <label>Payment Method *</label>
              <select
                name="paymentMethod"
                value={editForm.paymentMethod}
                onChange={handleEditChange}
                className={`form-select ${editErrors.paymentMethod ? 'input-error' : ''}`}
                required
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              {editErrors.paymentMethod && (
                <span className="field-error-msg">{editErrors.paymentMethod}</span>
              )}
            </div>

            <div className="form-group form-group-full">
              <label>Description or Notes</label>
              <textarea
                name="description"
                value={editForm.description}
                onChange={handleEditChange}
                className="form-textarea"
                maxLength={500}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* 3. Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Expense"
        message="Are you sure you want to permanently delete this expense from MongoDB? This action cannot be undone."
        confirmText="Yes, Delete Expense"
        isDanger={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AllExpenses;
