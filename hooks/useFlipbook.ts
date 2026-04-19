'use client';

import { useState, useCallback } from 'react';

/** Hook to manage flipbook viewer state */
export function useFlipbook(totalPages: number) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const goToPage = useCallback((page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => goToPage(currentPage + 1), [currentPage, goToPage]);
  const prevPage = useCallback(() => goToPage(currentPage - 1), [currentPage, goToPage]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  return {
    currentPage,
    setCurrentPage,
    goToPage,
    nextPage,
    prevPage,
    isFullscreen,
    toggleFullscreen,
    isFirstPage: currentPage === 0,
    isLastPage: currentPage >= totalPages - 1,
  };
}