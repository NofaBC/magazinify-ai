import React, { useState, useEffect } from 'react';
import './ImageManager.css'; // Assuming a corresponding CSS file

// Mock data for images
const mockImages = [
  { id: 1, url: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Image+1', source: 'Stock', selected: false },
  { id: 2, url: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Image+2', source: 'AI Generated', selected: true },
  { id: 3, url: 'https://via.placeholder.com/150/00FF00/FFFFFF?text=Image+3', source: 'Uploaded', selected: false },
  { id: 4, url: 'https://via.placeholder.com/150/FFFF00/000000?text=Image+4', source: 'Stock', selected: false },
];

const ImageManager = ({ magazineId }) => {
  const [images, setImages] = useState(mockImages);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // In a real app, useEffect would fetch images associated with the magazineId

  const handleSelectImage = (id) => {
    setImages(images.map(img =>
      img.id === id ? { ...img, selected: !img.selected } : img
    ));
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt for the AI image generation.');
      return;
    }
    setIsGenerating(true);
    console.log('Generating image with prompt:', prompt);
    // Simulate API call to AI image generator (e.g., DALL-E)
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const newImage = {
      id: Date.now(),
      url: `https://via.placeholder.com/150/000000/FFFFFF?text=AI+Result+${Date.now()}`,
      source: 'AI Generated',
      selected: false,
    };
    setImages(prev => [newImage, ...prev]);
    setPrompt('');
    setIsGenerating(false);
  };

  const handleUploadImage = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    console.log('Uploading file:', file.name);
    // Simulate API call to upload service (e.g., Firebase Storage)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newImage = {
      id: Date.now() + 1,
      url: URL.createObjectURL(file), // Temporary local URL
      source: 'Uploaded',
      selected: false,
    };
    setImages(prev => [newImage, ...prev]);
    setIsUploading(false);
  };

  return (
    <div className="image-manager-container">
      <header className="image-manager-header">
        <h1>Image Manager</h1>
        <p>Select and generate images for your magazine content.</p>
      </header>

      <section className="image-generation-section">
        <h2>AI Image Generation</h2>
        <div className="generation-controls">
          <input
            type="text"
            placeholder="Enter a detailed prompt for the image (e.g., 'A minimalist office setting with a glowing laptop')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
          />
          <button onClick={handleGenerateImage} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate Image'}
          </button>
        </div>
      </section>

      <section className="image-upload-section">
        <h2>Upload Image</h2>
        <input
          type="file"
          accept="image/*"
          id="image-upload"
          onChange={handleUploadImage}
          disabled={isUploading}
          style={{ display: 'none' }}
        />
        <button
          className="upload-button"
          onClick={() => document.getElementById('image-upload').click()}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Choose File to Upload'}
        </button>
      </section>

      <section className="image-gallery-section">
        <h2>Image Gallery ({images.filter(img => img.selected).length} Selected)</h2>
        <div className="image-gallery">
          {images.map((image) => (
            <div
              key={image.id}
              className={`image-item ${image.selected ? 'selected' : ''}`}
              onClick={() => handleSelectImage(image.id)}
            >
              <img src={image.url} alt={`Magazine visual ${image.id}`} />
              <div className="image-source-tag">{image.source}</div>
              {image.selected && <div className="selection-overlay">✓</div>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
