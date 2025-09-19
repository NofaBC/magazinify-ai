import React, { useEffect, useRef, useState } from 'react';
import { PageFlip } from 'page-flip';
import { Button } from '@/components/ui/button.jsx';
import { Card } from '@/components/ui/card.jsx';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  BookOpen,
  Eye,
  Share2
} from 'lucide-react';

const FlipbookReader = ({ 
  issue, 
  sprites = [], 
  onPageTurn, 
  onAnalyticsEvent,
  className = '' 
}) => {
  const flipbookRef = useRef(null);
  const pageFlipRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!flipbookRef.current || sprites.length === 0) return;

    try {
      // Initialize PageFlip
      const pageFlip = new PageFlip(flipbookRef.current, {
        width: 800,
        height: 1200,
        size: 'stretch',
        minWidth: 400,
        maxWidth: 1200,
        minHeight: 600,
        maxHeight: 1800,
        maxShadowOpacity: 0.5,
        showCover: true,
        mobileScrollSupport: true,
        clickEventForward: true,
        usePortrait: true,
        startZIndex: 0,
        autoSize: true,
        showPageCorners: true,
        disableFlipByClick: false
      });

      pageFlipRef.current = pageFlip;

      // Load pages
      const pages = sprites.map(sprite => ({
        src: sprite.url,
        width: sprite.width || 800,
        height: sprite.height || 1200
      }));

      pageFlip.loadFromImages(pages.map(page => page.src));

      // Set up event listeners
      pageFlip.on('flip', (e) => {
        const newPage = e.data;
        setCurrentPage(newPage);
        
        // Analytics tracking
        if (onPageTurn) {
          onPageTurn(newPage);
        }
        
        if (onAnalyticsEvent) {
          onAnalyticsEvent('page_turn', {
            page: newPage,
            device: window.innerWidth < 768 ? 'mobile' : 'desktop',
            timestamp: new Date().toISOString()
          });
        }
      });

      pageFlip.on('changeOrientation', (e) => {
        console.log('Orientation changed:', e.data);
      });

      pageFlip.on('changeState', (e) => {
        console.log('State changed:', e.data);
      });

      setTotalPages(sprites.length);
      setIsLoading(false);

      // Track initial view
      if (onAnalyticsEvent) {
        onAnalyticsEvent('view', {
          issueSlug: issue?.slug,
          device: window.innerWidth < 768 ? 'mobile' : 'desktop',
          timestamp: new Date().toISOString()
        });
      }

    } catch (err) {
      console.error('Error initializing flipbook:', err);
      setError(err.message);
      setIsLoading(false);
    }

    return () => {
      if (pageFlipRef.current) {
        pageFlipRef.current.destroy();
      }
    };
  }, [sprites, issue, onPageTurn, onAnalyticsEvent]);

  const handlePrevPage = () => {
    if (pageFlipRef.current) {
      pageFlipRef.current.flipPrev();
    }
  };

  const handleNextPage = () => {
    if (pageFlipRef.current) {
      pageFlipRef.current.flipNext();
    }
  };

  const handleZoomIn = () => {
    if (pageFlipRef.current) {
      // PageFlip doesn't have built-in zoom, so we'll scale the container
      const container = flipbookRef.current;
      const currentScale = parseFloat(container.style.transform?.match(/scale\(([^)]+)\)/)?.[1] || 1);
      const newScale = Math.min(currentScale * 1.2, 2);
      container.style.transform = `scale(${newScale})`;
    }
  };

  const handleZoomOut = () => {
    if (pageFlipRef.current) {
      const container = flipbookRef.current;
      const currentScale = parseFloat(container.style.transform?.match(/scale\(([^)]+)\)/)?.[1] || 1);
      const newScale = Math.max(currentScale / 1.2, 0.5);
      container.style.transform = `scale(${newScale})`;
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      flipbookRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && issue) {
      try {
        await navigator.share({
          title: issue.title,
          text: `Check out this magazine: ${issue.title}`,
          url: window.location.href
        });
        
        if (onAnalyticsEvent) {
          onAnalyticsEvent('share', {
            method: 'native',
            page: currentPage
          });
        }
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        // You could show a toast here
        console.log('Link copied to clipboard');
        
        if (onAnalyticsEvent) {
          onAnalyticsEvent('share', {
            method: 'clipboard',
            page: currentPage
          });
        }
      } catch (err) {
        console.log('Copy failed:', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-[600px] ${className}`}>
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading magazine...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-[600px] ${className}`}>
        <Card className="p-8 text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Magazine</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  if (sprites.length === 0) {
    return (
      <div className={`flex items-center justify-center min-h-[600px] ${className}`}>
        <Card className="p-8 text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pages Available</h3>
          <p className="text-gray-600">This magazine doesn't have any pages to display.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className={`flipbook-container ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between mb-4 p-4 bg-white rounded-lg shadow-sm">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600 ml-4">
            Page {currentPage + 1} of {totalPages}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleFullscreen}>
            <Maximize className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Flipbook */}
      <div className="flipbook-wrapper flex justify-center">
        <div 
          ref={flipbookRef}
          className="flipbook"
          style={{
            transformOrigin: 'center center',
            transition: 'transform 0.3s ease'
          }}
        />
      </div>

      {/* Mobile-friendly page indicator */}
      <div className="flex justify-center mt-4 md:hidden">
        <div className="flex space-x-1">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentPage ? 'bg-primary' : 'bg-gray-300'
              }`}
              onClick={() => pageFlipRef.current?.flip(i)}
            />
          ))}
        </div>
      </div>

      {/* Reading mode link */}
      {issue && (
        <div className="text-center mt-6">
          <Button variant="outline" className="inline-flex items-center">
            <Eye className="w-4 h-4 mr-2" />
            Switch to Reading Mode
          </Button>
        </div>
      )}
    </div>
  );
};

export default FlipbookReader;
