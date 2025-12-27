import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Automatically scrolls to top of page on route change AND on page reload
 * Scroll happens AFTER reload, not before (professional UX)
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [pathname]);

  // Force scroll to top on component mount (handles page reload)
  useEffect(() => {
    // Disable browser's scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Immediate scroll to top (happens AFTER page loads, not before)
    window.scrollTo(0, 0);

    // Force scroll after a short delay to ensure content is loaded
    const timeoutId = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    }, 0);

    // Additional safety: scroll on DOMContentLoaded
    const handleDOMLoad = () => {
      window.scrollTo(0, 0);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', handleDOMLoad);
    } else {
      handleDOMLoad();
    }

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('DOMContentLoaded', handleDOMLoad);
    };
  }, []); // Empty dependency array = runs once on mount

  return null;
};

export default ScrollToTop;

