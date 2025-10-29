import React from 'react';
import './IssueCard.css'; // Assuming a corresponding CSS file

const IssueCard = ({ magazine, onEdit, onViewAnalytics, onDownload }) => {
  const { id, title, coverImageUrl, dateCreated, status, views, downloads } = magazine;

  const statusClass = status.toLowerCase().replace(' ', '-');

  return (
    <div className="issue-card">
      <div className="issue-card-cover">
        <img src={coverImageUrl} alt={`${title} cover`} />
        <span className={`issue-card-status ${statusClass}`}>{status}</span>
      </div>
      <div className="issue-card-details">
        <h3 className="issue-card-title">{title}</h3>
        <p className="issue-card-date">Created: {new Date(dateCreated).toLocaleDateString()}</p>
        <div className="issue-card-stats">
          <div className="stat-item">
            <strong>{views.toLocaleString()}</strong>
            <span>Views</span>
          </div>
          <div className="stat-item">
            <strong>{downloads.toLocaleString()}</strong>
            <span>Downloads</span>
          </div>
        </div>
      </div>
      <div className="issue-card-actions">
        <button onClick={() => onEdit(id)} className="action-button edit">Edit</button>
        <button onClick={() => onViewAnalytics(id)} className="action-button analytics">Analytics</button>
        <button onClick={() => onDownload(id)} className="action-button download">Download PDF</button>
      </div>
    </div>
  );
};

export default IssueCard;
