import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, RotateCcw } from 'lucide-react';
import { expenseAPI } from '../services/api';
import { useExpense } from '../context/ExpenseContext';

export const EditExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { EXPENSE_CATEGORIES, PAYMENT_METHODS, showToast, triggerRefresh } = useExpense();

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    date: '',
    paymentMethod: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        setLoading(true);
        const res = await expenseAPI.getById(id);
        const data = res.data;
        setFormData({
          title: data.title,
          amount: data.amount,
          category: data.category,
          date: new Date(data.date).toISOString().split('T')[0],
          paymentMethod: data.paymentMethod,
          description: data.description || ''
        });
      } catch (err) {
        showToast('error', err.message || 'Failed to fetch expense details');
        navigate('/expenses');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchExpense();
    }
  }, [id, navigate, showToast]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    const num = parseFloat(formData.amount);
    if (!formData.amount || isNaN(num) || num <= 0) newErrors.amount = 'Valid positive amount is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Payment method is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      const res = await expenseAPI.update(id, {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      showToast('success', res.message || 'Expense updated successfully in MongoDB');
      triggerRefresh();
      navigate('/expenses');
    } catch (err) {
      showToast('error', err.message || 'Failed to update expense');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-primary" />
        <p>Loading expense record details...</p>
      </div>
    );
  }

  return (
    <div className="edit-expense-page">
      <div className="form-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Edit Expense Record</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Modify details for this transaction entry
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/expenses')}
          >
            <ArrowLeft size={16} />
            <span>Back to List</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="form-group form-group-full">
              <label htmlFor="title">Expense Title *</label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className={`form-input ${errors.title ? 'input-error' : ''}`}
                maxLength={100}
                required
              />
              {errors.title && <span className="field-error-msg">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount (₹) *</label>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={handleChange}
                className={`form-input ${errors.amount ? 'input-error' : ''}`}
                required
              />
              {errors.amount && <span className="field-error-msg">{errors.amount}</span>}
            </div>

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
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.category && <span className="field-error-msg">{errors.category}</span>}
            </div>

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
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              {errors.paymentMethod && (
                <span className="field-error-msg">{errors.paymentMethod}</span>
              )}
            </div>

            <div className="form-group form-group-full">
              <label htmlFor="description">Description or Notes</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-textarea"
                maxLength={500}
              />
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
              onClick={() => navigate('/expenses')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <span className="spinner" style={{ width: '16px', height: '16px' }} />
              ) : (
                <Save size={16} />
              )}
              <span>{submitting ? 'Updating...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExpense;
