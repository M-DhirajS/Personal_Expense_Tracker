import React from 'react';
import { useExpense } from '../context/ExpenseContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useExpense();

  if (!toasts.length) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast) => {
        let icon = <Info size={20} />;
        let className = 'toast toast-info';

        if (toast.type === 'success') {
          icon = <CheckCircle2 size={20} />;
          className = 'toast toast-success';
        } else if (toast.type === 'error') {
          icon = <AlertCircle size={20} />;
          className = 'toast toast-error';
        }

        return (
          <div key={toast.id} className={className}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
              {icon}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ color: '#fff', opacity: 0.8, display: 'flex', alignItems: 'center' }}
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
