/**
 * Portfolio Template - MVP
 * Uses data-* attributes for hydration points
 * Uses CSS classes for styling/behavior
 */

export const portfolioTemplate = `
  <article class="portfolio-detail">
    <!-- Hero Section -->
    <header class="portfolio-hero">
      <!-- Category Tag -->
      <div class="category-tag skeleton" data-field="category">
        <span class="skeleton-text">Loading...</span>
      </div>

      <!-- Project Title -->
      <h1 class="project-title skeleton skeleton-title" data-field="title">
        Loading project title...
      </h1>

      <!-- Hero Image -->
      <div class="hero-image skeleton skeleton-image" data-field="heroImage">
        <div class="skeleton-shimmer"></div>
      </div>
    </header>

    <!-- Content Section (for future hydration) -->
    <section class="portfolio-content">
      <div class="content-placeholder skeleton" data-field="content">
        <div class="skeleton-shimmer"></div>
      </div>
    </section>
  </article>
`;

export default portfolioTemplate;
