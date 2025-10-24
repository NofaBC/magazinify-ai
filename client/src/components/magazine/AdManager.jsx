import React, { useState, useEffect } from 'react';
import './AdManager.css'; // Assuming a corresponding CSS file

// Mock data for ads
const mockAds = [
  { id: 101, title: 'Premium Sponsorship Slot', type: 'Banner', page: 3, status: 'Active', clicks: 150, impressions: 5000 },
  { id: 102, title: 'Internal Product Promo', type: 'Native', page: 7, status: 'Draft', clicks: 0, impressions: 0 },
  { id: 103, title: 'Partner Ad - Q4 Campaign', type: 'Full Page', page: 12, status: 'Active', clicks: 350, impressions: 10000 },
];

const AdManager = ({ magazineId }) => {
  const [ads, setAds] = useState(mockAds);
  const [isAdding, setIsAdding] = useState(false);
  const [newAd, setNewAd] = useState({ title: '', type: 'Banner', page: 1, content: '' });

  // In a real app, useEffect would fetch ads associated with the magazineId

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAd(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAd = (e) => {
    e.preventDefault();
    if (!newAd.title || !newAd.content) {
      alert('Please fill in all required fields.');
      return;
    }

    const adToAdd = {
      ...newAd,
      id: Date.now(),
      status: 'Draft',
      clicks: 0,
      impressions: 0,
      page: parseInt(newAd.page),
    };

    setAds(prev => [...prev, adToAdd]);
    setNewAd({ title: '', type: 'Banner', page: 1, content: '' });
    setIsAdding(false);
  };

  const handleRemoveAd = (id) => {
    if (window.confirm('Are you sure you want to remove this ad?')) {
      setAds(prev => prev.filter(ad => ad.id !== id));
    }
  };

  return (
    <div className="ad-manager-container">
      <header className="ad-manager-header">
        <h1>Ad Manager</h1>
        <button onClick={() => setIsAdding(!isAdding)} className="add-ad-button">
          {isAdding ? 'Cancel' : '+ Add New Ad Slot'}
        </button>
      </header>

      {isAdding && (
        <section className="add-ad-form">
          <h2>Define New Ad Slot</h2>
          <form onSubmit={handleAddAd}>
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="title">Title/Name</label>
                <input type="text" id="title" name="title" value={newAd.title} onChange={handleInputChange} required />
              </div>
              <div className="input-group">
                <label htmlFor="type">Type</label>
                <select id="type" name="type" value={newAd.type} onChange={handleInputChange}>
                  <option value="Banner">Banner Ad</option>
                  <option value="Native">Native Content Ad</option>
                  <option value="Full Page">Full Page Ad</option>
                </select>
              </div>
              <div className="input-group">
                <label htmlFor="page">Target Page</label>
                <input type="number" id="page" name="page" value={newAd.page} onChange={handleInputChange} min="1" required />
              </div>
            </div>
            <div className="input-group full-width">
              <label htmlFor="content">Ad Content/Embed Code/Description</label>
              <textarea id="content" name="content" value={newAd.content} onChange={handleInputChange} rows="4" required />
            </div>
            <button type="submit" className="save-ad-button">Save Ad Slot</button>
          </form>
        </section>
      )}

      <section className="ad-list-section">
        <h2>Current Ad Slots ({ads.length})</h2>
        <div className="ad-list">
          {ads.length === 0 ? (
            <p className="no-ads">No ad slots defined yet.</p>
          ) : (
            ads.map(ad => (
              <div key={ad.id} className="ad-item">
                <div className="ad-details">
                  <h3>{ad.title}</h3>
                  <p><strong>Type:</strong> {ad.type} | <strong>Page:</strong> {ad.page} | <strong>Status:</strong> <span className={`ad-status ${ad.status.toLowerCase()}`}>{ad.status}</span></p>
                  <div className="ad-stats">
                    <span>Clicks: <strong>{ad.clicks}</strong></span>
                    <span>Impressions: <strong>{ad.impressions}</strong></span>
                  </div>
                </div>
                <div className="ad-actions">
                  <button className="edit-ad-button">Edit</button>
                  <button className="remove-ad-button" onClick={() => handleRemoveAd(ad.id)}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default AdManager;
