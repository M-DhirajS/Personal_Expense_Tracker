import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, RotateCcw, List, CheckCircle2 } from 'lucide-react';
import { expenseAPI } from '../services/api';
import { useExpense } from '../context/ExpenseContext';

export const AddExpense = () => {
  const navigate = useNavigate();
  const { EXPENSE_CATEGORIES, PAYMENT_METHODS, showToast, triggerRefresh } = useExpense();

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const initialFormState = {
    title: '',
    amount: '',
    category: '',
    date: getTodayString(),
    paymentMethod: '',
    description: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Expense title is required';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else {
      const num = parseFloat(formData.amount);
      if (isNaN(num) || num <= 0) {
        newErrors.amount = 'Amount must be a valid positive number';
      }
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.date) {
      newErrors.date = 'Expense date is required';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Clear error for field upon typing
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      const res = await expenseAPI.create({
        ...formData,
        amount: parseFloat(formData.amount)
      });

      showToast('success', res.message || 'Expense successfully saved to MongoDB!');
      triggerRefresh();
      setFormData(initialFormState);
      setErrors({});

      // Navigate to expenses table
      navigate('/expenses');
    } catch (err) {
      showToast('error', err.message || 'Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setErrors({});
  };

  return (
    <div className="add-expense-page">
      <div className="form-card">
        <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Record New Expense</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Fill in the details below. All fields marked with * are required.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            {/* Title */}
            <div className="form-group form-group-full">
              <label htmlFor="title">
                <span>Expense Title *</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {formData.title.length}/100
                </span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Supermarket Grocery Shopping"
                value={formData.title}
                onChange={handleChange}
                className={`form-input ${errors.title ? 'input-error' : ''}`}
                maxLength={100}
                required
              />
              {errors.title && <span className="field-error-msg">{errors.title}</span>}
            </div>

            {/* Amount */}
            <div className="form-group">
              <label htmlFor="amount">Amount (₹) *</label>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleChange}
                className={`form-input ${errors.amount ? 'input-error' : ''}`}
                required
              />
              {errors.amount && <span className="field-error-msg">{errors.amount}</span>}
            </div>

            {/* Expense Date */}
            <div className="form-group">
              <label htmlFor="date">Expense Date *</label>
              <input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                className={`form-input ${errors.date ? 'input-error' : ''}`}
                required
              />
              {errors.date && <span className="field-error-msg">{errors.date}</span>}
            </div>

            {/* Category */}
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`form-select ${errors.category ? 'input-error' : ''}`}
                required
              >
                <option value="">Select Expense Category</option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && <span className="field-error-msg">{errors.category}</span>}
            </div>

            {/* Payment Method */}
            <div className="form-group">
              <label htmlFor="paymentMethod">Payment Method *</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className={`form-select ${errors.paymentMethod ? 'input-error' : ''}`}
                required
              >
                <option value="">Select Payment Method</option>
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
              {errors.paymentMethod && (
                <span className="field-error-msg">{errors.paymentMethod}</span>
              )}
            </div>

            {/* Description / Notes */}
            <div className="form-group form-group-full">
              <label htmlFor="description">
                <span>Description or Notes (Optional)</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {formData.description.length}/500
                </span>
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Add optional notes, store name, invoice number, or details..."
                value={formData.description}
                onChange={handleChange}
                className={`form-textarea ${errors.description ? 'input-error' : ''}`}
                maxLength={500}
              />
              {errors.description && (
                <span className="field-error-msg">{errors.description}</span>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '28px',
              borderTop: '1px solid var(--border-light)',
              paddingTop: '20px'
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
              disabled={submitting}
            >
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <span className="spinner" style={{ width: '16px', height: '16px' }} />
              ) : (
                <PlusCircle size={16} />
              )}
              <span>{submitting ? 'Saving to Database...' : 'Save Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
