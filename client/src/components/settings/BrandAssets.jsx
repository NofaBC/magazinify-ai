import React, { useState } from 'react';
import './BrandAssets.css'; // Assuming a corresponding CSS file

const mockBrand = {
  primaryColor: '#3498db',
  secondaryColor: '#2ecc71',
  logoUrl: 'https://via.placeholder.com/150x50?text=Your+Logo',
  fontFamily: 'Arial, sans-serif',
  watermark: 'Magazinify-AI Client',
};

const BrandAssets = () => {
  const [brand, setBrand] = useState(mockBrand);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBrand(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    // In a real application, this would be an API call to save the brand settings
    console.log('Saving brand assets:', brand);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    alert('Brand assets updated successfully!');
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Simulate upload and update logo URL
      const newLogoUrl = URL.createObjectURL(file);
      setBrand(prev => ({ ...prev, logoUrl: newLogoUrl }));
      alert('Logo uploaded successfully!');
    }
  };

  return (
    <div className="brand-assets-container">
      <header className="settings-header">
        <h1>Brand Assets</h1>
        <p>Customize the look and feel of your generated magazines with your brand's assets.</p>
      </header>

      <form onSubmit={handleSave} className="brand-form">
        <section className="color-palette-section form-card">
          <h2>Color Palette</h2>
          <div className="form-grid">
            <div className="input-group">
              <label htmlFor="primaryColor">Primary Color</label>
              <input
                type="color"
                id="primaryColor"
                name="primaryColor"
                value={brand.primaryColor}
                onChange={handleChange}
              />
              <span className="color-value">{brand.primaryColor}</span>
            </div>
            <div className="input-group">
              <label htmlFor="secondaryColor">Secondary Color</label>
              <input
                type="color"
                id="secondaryColor"
                name="secondaryColor"
                value={brand.secondaryColor}
                onChange={handleChange}
              />
              <span className="color-value">{brand.secondaryColor}</span>
            </div>
          </div>
        </section>

        <section className="logo-section form-card">
          <h2>Logo & Typography</h2>
          <div className="logo-upload-area">
            <div className="logo-preview">
              <img src={brand.logoUrl} alt="Brand Logo" />
            </div>
            <div className="logo-controls">
              <p>Upload your high-resolution company logo (PNG or SVG recommended).</p>
              <input
                type="file"
                id="logo-upload"
                accept="image/png, image/svg+xml"
                onChange={handleLogoUpload}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="upload-logo-button"
                onClick={() => document.getElementById('logo-upload').click()}
              >
                Upload New Logo
              </button>
            </div>
          </div>
          <div className="input-group">
            <label htmlFor="fontFamily">Font Family (CSS Name)</label>
            <input
              type="text"
              id="fontFamily"
              name="fontFamily"
              value={brand.fontFamily}
              onChange={handleChange}
              placeholder="e.g., 'Roboto', sans-serif"
            />
          </div>
        </section>

        <section className="watermark-section form-card">
          <h2>Watermark</h2>
          <div className="input-group">
            <label htmlFor="watermark">Watermark Text (for drafts)</label>
            <input
              type="text"
              id="watermark"
              name="watermark"
              value={brand.watermark}
              onChange={handleChange}
              placeholder="e.g., DRAFT or Company Name"
            />
          </div>
        </section>

        <div className="form-actions">
          <button type="submit" className="save-button" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Brand Assets'}
          </button>
        </div>
      </form>
    </div>
  );
};
