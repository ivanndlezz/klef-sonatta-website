/**
 * Scroll Lock Utility - iOS Compatible
 * Prevents body scroll when overlays are open (mega menu, search, bottom sheet)
 */

(function() {
  'use strict';

  const ScrollLock = {
    locked: false,
    scrollY: 0,
    touchMoveHandler: null,

    /**
     * Lock body scroll - iOS compatible
     * Uses position:fixed + transform approach to prevent scroll jump
     */
    lock() {
      if (this.locked) return;

      this.scrollY = window.pageYOffset;

      // Add class for CSS-based styling
      document.body.classList.add('scroll-locked');

      // Apply iOS-compatible scroll locking
      document.body.style.position = 'fixed';
      document.body.style.top = `-${this.scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';

      // Prevent touch move events on iOS to stop elastic scrolling
      this.touchMoveHandler = (e) => {
        // Allow touch events only within the locked overlay container
        const overlay = document.querySelector('.search-overlay.active, .mega-topbar.active, #backdrop.visible, #bottomsheet.open');
        if (overlay && !overlay.contains(e.target)) {
          e.preventDefault();
        }
      };

      document.addEventListener('touchmove', this.touchMoveHandler, { passive: false });

      this.locked = true;
    },

    /**
     * Unlock body scroll
     */
    unlock() {
      if (!this.locked) return;

      // Remove class
      document.body.classList.remove('scroll-locked');

      // Reset styles
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';

      // Remove touch move listener
      if (this.touchMoveHandler) {
        document.removeEventListener('touchmove', this.touchMoveHandler);
        this.touchMoveHandler = null;
      }

      // Restore scroll position
      window.scrollTo(0, this.scrollY);

      this.locked = false;
    },

    /**
     * Check if scroll is currently locked
     */
    isLocked() {
      return this.locked;
    },

    /**
     * Toggle scroll lock
     */
    toggle() {
      if (this.locked) {
        this.unlock();
      } else {
        this.lock();
      }
    }
  };

  // Expose globally
  window.ScrollLock = ScrollLock;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ScrollLock);
  }

})();
