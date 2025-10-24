import React, { useState, useEffect } from 'react';
import IssueCard from './IssueCard';
import './MagazineList.css'; // Assuming a corresponding CSS file

// Mock data for demonstration
const mockMagazines = [
  {
    id: 'mag-001',
    title: 'Q3 2025 Business Review',
    coverImageUrl: 'https://via.placeholder.com/300x424?text=Q3+Review+Cover',
    dateCreated: Date.now() - 86400000 * 5, // 5 days ago
    status: 'Published',
    views: 1245,
    downloads: 320,
  },
  {
    id: 'mag-002',
    title: 'Marketing Strategy 2026 Draft',
    coverImageUrl: 'https://via.placeholder.com/300x424?text=Strategy+Draft+Cover',
    dateCreated: Date.now() - 86400000 * 1, // 1 day ago
    status: 'Draft',
    views: 12,
    downloads: 0,
  },
  {
    id: 'mag-003',
    title: 'Annual Report 2024',
    coverImageUrl: 'https://via.placeholder.com/300x424?text=Annual+Report+Cover',
    dateCreated: Date.now() - 86400000 * 30, // 30 days ago
    status: 'Published',
    views: 5890,
    downloads: 1500,
  },
  {
    id: 'mag-004',
    title: 'New Product Launch Guide',
    coverImageUrl: 'https://via.placeholder.com/300x424?text=Product+Guide+Cover',
    dateCreated: Date.now() - 86400000 * 10, // 10 days ago
    status: 'Processing',
    views: 0,
    downloads: 0,
  },
];

const MagazineList = () => {
  const [magazines, setMagazines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a real application, this would be an API call to fetch magazines
    // For now, we use mock data
    setTimeout(() => {
      setMagazines(mockMagazines);
      setLoading(false);
    }, 1000);
  }, []);

  const handleEdit = (id) => {
    console.log(`Editing magazine: ${id}`);
    // Navigation to edit page
  };

  const handleViewAnalytics = (id) => {
    console.log(`Viewing analytics for: ${id}`);
    // Navigation to analytics page
  };

  const handleDownload = (id) => {
    console.log(`Downloading magazine: ${id}`);
    // Trigger download API call
  };

  if (loading) {
    return <div className="magazine-list-loading">Loading magazines...</div>;
  }

  if (error) {
    return <div className="magazine-list-error">Error loading magazines: {error}</div>;
  }

  return (
    <div className="magazine-list-container">
      <header className="magazine-list-header">
        <h2>Your Magazines</h2>
        <button className="create-new-button">+ Create New Magazine</button>
      </header>
      <div className="magazine-list-grid">
        {magazines.map((magazine) => (
          <IssueCard
            key={magazine.id}
            magazine={magazine}
            onEdit={handleEdit}
            onViewAnalytics={handleViewAnalytics}
            onDownload={handleDownload}
          />
        ))}
      </div>
      {magazines.length === 0 && (
        <div className="magazine-list-empty">
          <p>You haven't created any magazines yet.</p>
          <button className="create-new-button large">+ Start Your First Magazine</button>
        </div>
      )}
    </div>
  );
};
