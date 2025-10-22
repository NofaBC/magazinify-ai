import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import 'turn.js';
import $ from 'jquery';
import './Flipbook.css';

/**
 * Flipbook component for rendering interactive magazine
 * 
 * @param {Object} props - Component props
 * @param {Array} props.pages - Array of page image URLs
 * @param {string} props.title - Magazine title
 * @param {Object} props.options - Additional options
 * @returns {JSX.Element} Flipbook component
 */
const Flipbook = ({ pages, title, options }) => {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const flipbookRef = useRef(null);
  const containerRef = useRef(null);

  // Set default options
  const defaultOptions = {
    autoCenter: true,
    display: 'double',
    acceleration: true,
    elevation: 50,
    gradients: true,
    when: {
      turning: function(e, page) {
        setCurrentPage(page);
      }
    }
  };

  // Merge default options with provided options
  const flipbookOptions = { ...defaultOptions, ...(options || {}) };

  useEffect(() => {
    let loadedImages = 0;
    setTotalPages(pages.length);

    // Preload all page images
    const preloadImages = () => {
      pages.forEach(page => {
        const img = new Image();
        img.onload = () => {
          loadedImages++;
          const progress = Math.round((loadedImages / pages.length) * 100);
          setLoadingProgress(progress);
          if (loadedImages >= pages.length) {
            initializeFlipbook();
          }
        };
        img.onerror = () => {
          loadedImages++;
          const progress = Math.round((loadedImages / pages.length) * 100);
          setLoadingProgress(progress);
          if (loadedImages >= pages.length) {
            initializeFlipbook();
          }
        };
        img.src = page;
      });
    };

    // Initialize the flipbook once all images are loaded
    const initializeFlipbook = () => {
      if (flipbookRef.current) {
        // Get container dimensions
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const isLandscape = containerWidth > containerHeight;
        
        let bookWidth, bookHeight;
        
        if (isLandscape) {
          bookHeight = containerHeight * 0.8;
          bookWidth = bookHeight * 0.77 * 2; // Maintain aspect ratio
        } else {
          bookWidth = containerWidth * 0.9;
          bookHeight = bookWidth * 1.3 / 2; // Maintain aspect ratio
        }
        
        // Initialize turn.js
        $(flipbookRef.current).turn({
          width: bookWidth,
          height: bookHeight,
          ...flipbookOptions
        });

        // Handle keyboard navigation
        $(document).keydown(function(e) {
          switch(e.keyCode) {
            case 37: // left arrow
              $(flipbookRef.current).turn('previous');
              break;
            case 39: // right arrow
              $(flipbookRef.current).turn('next');
              break;
          }
        });

        // Handle window resize
        const handleResize = () => {
          // Get container dimensions
          const containerWidth = containerRef.current.clientWidth;
          const containerHeight = containerRef.current.clientHeight;
          const isLandscape = containerWidth > containerHeight;
          
          let bookWidth, bookHeight;
          
          if (isLandscape) {
            bookHeight = containerHeight * 0.8;
            bookWidth = bookHeight * 0.77 * 2;
          } else {
            bookWidth = containerWidth * 0.9;
            bookHeight = bookWidth * 1.3 / 2;
          }
          
          $(flipbookRef.current).turn('size', bookWidth, bookHeight);
          setZoom(1);
        };

        window.addEventListener('resize', handleResize);
        setLoading(false);

        return () => {
          window.removeEventListener('resize', handleResize);
          $(flipbookRef.current).turn('destroy');
        };
      }
    };

    preloadImages();

    // Cleanup on component unmount
    return () => {
      if (flipbookRef.current) {
        $(flipbookRef.current).turn('destroy');
      }
    };
  }, [pages, flipbookOptions]);

  // Handle navigation
  const handlePrevPage = () => {
    $(flipbookRef.current).turn('previous');
  };

  const handleNextPage = () => {
    $(flipbookRef.current).turn('next');
  };

  // Handle zoom
  const handleZoomIn = () => {
    if (zoom < 1.5) {
      const newZoom = zoom + 0.1;
      setZoom(newZoom);
      $(flipbookRef.current).css('transform', `scale(${newZoom})`);
    }
  };

  const handleZoomOut = () => {
    if (zoom > 0.5) {
      const newZoom = zoom - 0.1;
      setZoom(newZoom);
      $(flipbookRef.current).css('transform', `scale(${newZoom})`);
    }
  };

  // Handle fullscreen
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="flipbook-container" ref={containerRef}>
      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <h3>Loading Magazine</h3>
            <div className="progress-bar">
              <div className="progress" style={{ width: `${loadingProgress}%` }}></div>
            </div>
            <p>{loadingProgress}%</p>
          </div>
        </div>
      )}

      <div className="flipbook-wrapper">
        <div className="flipbook" ref={flipbookRef}>
          {pages.map((page, index) => (
            <div key={index} className="page">
              <img src={page} alt={`Page ${index + 1}`} />
            </div>
          ))}
        </div>
      </div>

      <div className="flipbook-controls">
        <button onClick={handlePrevPage} className="control-button">
          <i className="fas fa-chevron-left"></i>
        </button>
        <span className="page-indicator">
          Page <span>{currentPage}</span> of <span>{totalPages}</span>
        </span>
        <button onClick={handleNextPage} className="control-button">
          <i className="fas fa-chevron-right"></i>
        </button>
        <button onClick={handleZoomIn} className="control-button">
          <i className="fas fa-search-plus"></i>
        </button>
        <button onClick={handleZoomOut} className="control-button">
          <i className="fas fa-search-minus"></i>
        </button>
        <button onClick={handleFullscreen} className="control-button">
          <i className="fas fa-expand"></i>
        </button>
      </div>
    </div>
  );
};

Flipbook.propTypes = {
  pages: PropTypes.arrayOf(PropTypes.string).isRequired,
  title: PropTypes.string,
  options: PropTypes.object
};

export default Flipbook;
