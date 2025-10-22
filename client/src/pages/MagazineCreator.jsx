import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useTenant } from '../../hooks/useTenant';
import { createMagazine } from '../../services/magazine';
import './MagazineCreator.css';

/**
 * MagazineCreator component for creating new magazines
 * 
 * @returns {JSX.Element} MagazineCreator component
 */
const MagazineCreator = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { tenant, isLoading: tenantLoading } = useTenant();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    defaultValues: {
      websiteUrl: '',
      includeNofa: true,
      brandOptions: {
        useWebsiteColors: true,
        useCustomColors: false,
        primaryColor: '#0ea5e9',
        secondaryColor: '#2563eb',
        accentColor: '#8b5cf6'
      }
    }
  });
  
  // Watch form values for conditional rendering
  const watchUseWebsiteColors = watch('brandOptions.useWebsiteColors');
  const watchUseCustomColors = watch('brandOptions.useCustomColors');
  
  // Set tenant website URL if available
  useEffect(() => {
    if (tenant && tenant.website) {
      setValue('websiteUrl', tenant.website);
    }
  }, [tenant, setValue]);
  
  // Check if tenant is eligible for magazine creation
  const checkEligibility = async () => {
    if (!tenant) return;
    
    try {
      const response = await fetch(`/api/tenant/${tenant.id}/magazine/eligibility`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        toast.error(`You cannot create a magazine at this time: ${data.message}`);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
      toast.error('Error checking eligibility. Please try again.');
    }
  };
  
  useEffect(() => {
    if (!tenantLoading) {
      checkEligibility();
    }
  }, [tenantLoading]);
  
  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 10) {
      toast.warn('You can only upload up to 10 images at once.');
      return;
    }
    
    // Upload images to server
    const uploadImages = async () => {
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));
      
      try {
        const response = await fetch(`/api/tenant/${tenant.id}/upload/images`, {
          method: 'POST',
          body: formData,
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload images');
        }
        
        const data = await response.json();
        setUploadedImages(prev => [...prev, ...data.images]);
        toast.success('Images uploaded successfully');
        setUploadProgress(0);
      } catch (error) {
        console.error('Error uploading images:', error);
        toast.error('Error uploading images. Please try again.');
        setUploadProgress(0);
      }
    };
    
    uploadImages();
  };
  
  // Remove uploaded image
  const handleRemoveImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };
  
  // Create magazine on form submit
  const onSubmit = async (data) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare magazine data
      const magazineData = {
        websiteUrl: data.websiteUrl,
        options: {
          includeNofaAd: data.includeNofa,
          brandOptions: {
            useWebsiteColors: data.brandOptions.useWebsiteColors,
            useCustomColors: data.brandOptions.useCustomColors,
            colors: data.brandOptions.useCustomColors ? {
              primary: data.brandOptions.primaryColor,
              secondary: data.brandOptions.secondaryColor,
              accent: data.brandOptions.accentColor
            } : null
          }
        },
        uploadedImages: uploadedImages.map(img => ({
          url: img.url,
          description: img.description || 'Uploaded image',
          width: img.width,
          height: img.height
        }))
      };
      
      // Create magazine
      const result = await createMagazine(tenant.id, magazineData);
      
      // Handle success
      toast.success('Magazine generation started! This may take a few minutes.');
      navigate(`/dashboard/magazines/${result.issueId}`);
    } catch (error) {
      console.error('Error creating magazine:', error);
      toast.error('Error creating magazine. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (tenantLoading) {
    return (
      <div className="magazine-creator-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="magazine-creator-container">
      <div className="magazine-creator-header">
        <h1>Create Your Magazine</h1>
        <p>Enter your website URL and we'll generate a professional magazine based on your content.</p>
      </div>
      
      <div className="magazine-creator-form-container">
        <form onSubmit={handleSubmit(onSubmit)} className="magazine-creator-form">
          <div className="form-section">
            <h2>Website Information</h2>
            
            <div className="form-group">
              <label htmlFor="websiteUrl">Website URL</label>
              <input
                type="url"
                id="websiteUrl"
                placeholder="https://yourbusiness.com"
                {...register('websiteUrl', {
                  required: 'Website URL is required',
                  pattern: {
                    value: /^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/\S*)?$/,
                    message: 'Please enter a valid URL'
                  }
                })}
                className={errors.websiteUrl ? 'error' : ''}
              />
              {errors.websiteUrl && <span className="error-message">{errors.websiteUrl.message}</span>}
              <p className="input-help">We'll analyze your website to create content tailored to your business.</p>
            </div>
          </div>
          
          <div className="form-section">
            <h2>Branding Options</h2>
            
            <div className="form-group checkbox-group">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  id="useWebsiteColors"
                  {...register('brandOptions.useWebsiteColors')}
                />
                <span className="checkbox-label">Extract colors from my website</span>
              </label>
              <p className="input-help">We'll automatically detect and use colors from your website.</p>
            </div>
            
            <div className="form-group checkbox-group">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  id="useCustomColors"
                  {...register('brandOptions.useCustomColors')}
                />
                <span className="checkbox-label">Use custom colors</span>
              </label>
            </div>
            
            {watchUseCustomColors && (
              <div className="color-picker-group">
                <div className="form-group">
                  <label htmlFor="primaryColor">Primary Color</label>
                  <input
                    type="color"
                    id="primaryColor"
                    {...register('brandOptions.primaryColor')}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="secondaryColor">Secondary Color</label>
                  <input
                    type="color"
                    id="secondaryColor"
                    {...register('brandOptions.secondaryColor')}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="accentColor">Accent Color</label>
                  <input
                    type="color"
                    id="accentColor"
                    {...register('brandOptions.accentColor')}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="form-section">
            <h2>Image Upload</h2>
            <p className="section-description">
              Upload images to include in your magazine. Images of your products, services, team, or location work best.
            </p>
            
            <div className="upload-area">
              <label htmlFor="image-upload" className="upload-button">
                <i className="fas fa-cloud-upload-alt"></i>
                <span>Select Images</span>
              </label>
              <input
                type="file"
                id="image-upload"
                onChange={handleImageUpload}
                multiple
                accept="image/*"
                className="hidden-input"
              />
              <p className="upload-help">Up to 10 images, max 5MB each (JPG, PNG, GIF)</p>
            </div>
            
            {uploadProgress > 0 && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div className="progress" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <span>{uploadProgress}%</span>
              </div>
            )}
            
            {uploadedImages.length > 0 && (
              <div className="uploaded-images">
                <h3>Uploaded Images</h3>
                <div className="image-grid">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="image-item">
                      <img src={image.url} alt={image.description || `Uploaded image ${index + 1}`} />
                      <div className="image-actions">
                        <button 
                          type="button" 
                          className="remove-image" 
                          onClick={() => handleRemoveImage(index)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="form-section">
            <h2>Additional Options</h2>
            
            <div className="form-group checkbox-group">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  id="includeNofa"
                  {...register('includeNofa')}
                />
                <span className="checkbox-label">Include subtle NOFA credit in magazine</span>
              </label>
              <p className="input-help">
                A small "Powered by NOFA Business Consulting" mention may appear in your magazine.
                {tenant?.subscription?.planType === 'pro' && ' This can be disabled with Pro plan.'}
              </p>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="button secondary" 
              onClick={() => navigate('/dashboard')}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="button primary" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner-small"></div>
                  Generating...
                </>
              ) : 'Generate Magazine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MagazineCreator;
