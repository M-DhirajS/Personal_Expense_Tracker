import React from 'react';

export const StatCard = ({
  label,
  value,
  subtitle,
  icon,
  iconVariant = 'primary'
}) => {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-label">{label}</span>
        <div className={`stat-icon-wrapper stat-icon-${iconVariant}`}>
          {icon}
        </div>
      </div>
      <div>
        <div className="stat-value">{value}</div>
        {subtitle && <div className="stat-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
};

export default StatCard;
