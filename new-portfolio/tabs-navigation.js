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
document.addEventListener("DOMContentLoaded", () => {
  setupViewControls();
  // setupTabsNavigation will be called after portfolio data is loaded
});

/**
 * Re-initialize tabs when portfolio content is rendered
 */
document.addEventListener("portfolio-rendered", () => {
  // Remove loading state
  document.body.setAttribute("data-loading", "false");

  // Setup tabs navigation
  window.setupTabsNavigation();
});
