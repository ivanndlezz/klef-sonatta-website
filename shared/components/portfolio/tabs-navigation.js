/**
 * Tabs Navigation & Scroll Spy
 * Handles tab clicks and automatic tab activation based on scroll position
 */

/**
 * Setup navigation logic (Tabs, Scroll Spy, etc.)
 * Can be re-called when content is dynamically loaded
 */
window.setupTabsNavigation = function () {
  const sections = document.querySelectorAll(
    "section.section-anchor, section.section-container",
  );
  const tabs = document.querySelectorAll(".tab-btn");
  const tabsWrapper = document.getElementById("tabsScroll");

  if (!tabsWrapper) return;

  // Scroll Spy Logic with IntersectionObserver
  const observerOptions = {
    root: null,
    threshold: 0.2,
    rootMargin: "-10% 0px -40% 0px", // Activate when section is ~10% from top
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        updateTabs(id);
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));

  /**
   * Update active tab state
   */
  function updateTabs(activeId) {
    tabs.forEach((tab) => {
      const isTarget = tab.getAttribute("data-target") === activeId;
      tab.setAttribute("data-state", isTarget ? "active" : "idle");
      if (isTarget) centerTab(tab);
    });
  }

  /**
   * Center active tab in scrollable container
   */
  function centerTab(tab) {
    const wrapperRect = tabsWrapper.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();
    const scrollLeft =
      tabRect.left -
      wrapperRect.left -
      wrapperRect.width / 2 +
      tabRect.width / 2;
    tabsWrapper.scrollBy({ left: scrollLeft, behavior: "smooth" });
  }

  /**
   * Tab Click Events - Smooth scroll to section
   */
  tabs.forEach((tab) => {
    tab.onclick = null; // Prevent double listeners if re-called
    tab.addEventListener("click", () => {
      const targetId = tab.getAttribute("data-target");
      const target = document.getElementById(targetId);
      if (target) {
        const offset = 120; // Account for sticky header + tabs
        window.scrollTo({
          top: target.offsetTop - offset,
          behavior: "smooth",
        });
      }
    });
  });
};

/**
 * View Toggle Logic (Full vs Visual Only)
 */
function setupViewControls() {
  const controlBtns = document.querySelectorAll(".control-btn");

  controlBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.getAttribute("data-state") === "active") return;

      const view = btn.getAttribute("data-view-target");

      // Show loading state during transition
      document.body.setAttribute("data-loading", "true");

      // Update button states
      controlBtns.forEach((b) => b.setAttribute("data-state", "idle"));
      btn.setAttribute("data-state", "active");

      // Apply view change with slight delay for shimmer effect
      setTimeout(() => {
        document.body.setAttribute("data-view", view);
        document.body.setAttribute("data-loading", "false");
      }, 500);
    });
  });
}

/**
 * Initialize on DOM ready
 */
/**
 * Initialize on DOM ready
 */
function initTabsNavigation() {
  setupViewControls();
  setupMenuButton();
  // setupTabsNavigation will be called after portfolio data is loaded via 'portfolio-rendered' event
}

/**
 * Menu Button Switch Handler
 * Detects when hamburger changes to chevron (data-status changes)
 * and triggers visibility changes for .top-nav and .navbar
 */
function setupMenuButton() {
  const menuBtn = document.getElementById("menuBtn");
  if (!menuBtn) return;

  // Remove existing listeners to avoid duplicates if re-initialized
  const newBtn = menuBtn.cloneNode(true);
  if (menuBtn.parentNode) {
    menuBtn.parentNode.replaceChild(newBtn, menuBtn);
  } else {
    return;
  }

  // Listen for click to toggle data-status
  newBtn.addEventListener("click", () => {
    const currentStatus = newBtn.getAttribute("data-status");

    // Toggle between 'regular' and 'open' (hamburger <-> chevron)
    const newStatus = currentStatus === "open" ? "regular" : "open";

    newBtn.setAttribute("data-status", newStatus);

    // Execute the three separate functions based on the switch
    handleTopNavVisibility();
    handleNavbarVisibility();
    handleMobileTopbarVisibility();
  });
}

/**
 * FUNCTION 1: Handle .top-nav Visibility
 * Scope: .top-nav element only
 * Logic:
 *   - When data-status="open" (chevron): hide -> data-status="hide"
 *   - When data-status="regular" (hamburger): show -> data-status="show"
 */
function handleTopNavVisibility() {
  const menuBtn = document.getElementById("menuBtn");
  const topNav = document.querySelector(".top-nav");

  if (!menuBtn || !topNav) return;

  const status = menuBtn.getAttribute("data-status");

  // When switch is at "open" (chevron mode), hide .top-nav
  if (status === "open") {
    topNav.setAttribute("data-status", "hide");
  } else {
    // When switch is at "regular" (hamburger mode), show .top-nav
    topNav.setAttribute("data-status", "show");
  }
}

/**
 * FUNCTION 2: Handle .navbar Visibility
 * Scope: .navbar element only
 * Logic:
 *   - When data-status="open" (chevron): show -> data-status="show"
 *   - When data-status="regular" (hamburger): hide -> data-status="hide"
 */
function handleNavbarVisibility() {
  const menuBtn = document.getElementById("menuBtn");
  const navbar = document.querySelector(".navbar");

  if (!menuBtn || !navbar) return;

  const status = menuBtn.getAttribute("data-status");

  // When switch is at "open" (chevron mode), show .navbar
  if (status === "open") {
    navbar.setAttribute("data-status", "show");
  } else {
    // When switch is at "regular" (hamburger mode), hide .navbar
    navbar.setAttribute("data-status", "hide");
  }
}

/**
 * FUNCTION 3: Handle .mobile-topbar Visibility
 * Scope: .mobile-topbar element only
 * Logic (same as .navbar):
 *   - When data-status="open" (chevron): show -> data-status="show"
 *   - When data-status="regular" (hamburger): hide -> data-status="hide"
 */
function handleMobileTopbarVisibility() {
  const menuBtn = document.getElementById("menuBtn");
  const mobileTopbar = document.querySelector(".mobile-topbar");

  if (!menuBtn || !mobileTopbar) return;

  const status = menuBtn.getAttribute("data-status");

  // When switch is at "open" (chevron mode), show .mobile-topbar
  if (status === "open") {
    mobileTopbar.setAttribute("data-status", "show");
  } else {
    // When switch is at "regular" (hamburger mode), hide .mobile-topbar
    mobileTopbar.setAttribute("data-status", "hide");
  }
}

/**
 * Legacy wrapper functions for backward compatibility
 * @deprecated Use handleTopNavVisibility() and handleNavbarVisibility() instead
 */

function toggleTopNav(shouldHide) {
  const topNav = document.querySelector(".top-nav");
  if (!topNav) return;

  topNav.setAttribute("data-status", shouldHide ? "hide" : "show");
}

function toggleMainNavbar(shouldShow) {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  navbar.setAttribute("data-status", shouldShow ? "show" : "hide");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTabsNavigation);
} else {
  initTabsNavigation();
}

/**
 * Re-initialize tabs when portfolio content is rendered
 */
document.addEventListener("portfolio-rendered", () => {
  // Remove loading state
  document.body.setAttribute("data-loading", "false");

  // Setup tabs navigation
  window.setupTabsNavigation();

  // Re-setup menu button just in case
  setupMenuButton();

  // Setup close button to return to regular hamburger menu
  setupCloseButton();
});

/**
 * Close Button Handler
 * When clicking .close-btn.toggle-menu, return to regular hamburger state
 * and show the regular portfolio navigation
 */
function setupCloseButton() {
  const closeBtn = document.querySelector(".close-btn.toggle-menu");
  if (!closeBtn) return;

  closeBtn.addEventListener("click", () => {
    const menuBtn = document.getElementById("menuBtn");

    // Set menu button back to regular (hamburger) state
    if (menuBtn) {
      menuBtn.setAttribute("data-status", "regular");
    }

    // Show the top navigation (portfolio header)
    handleTopNavVisibility();

    // Hide the full navbar
    handleNavbarVisibility();

    // Hide the mobile topbar
    handleMobileTopbarVisibility();
  });
}
