/**
 * section-navigation.js
 * --------------------------------------------------
 * Utility to process content with simplified section markers:
 * -#section-slug | Section Title
 * or
 * -#section-slug
 *
 * If the title is missing, it extracts it from the first heading following the marker.
 * --------------------------------------------------
 */

(function (global) {
  const SectionNavigation = {};

  /**
   * Normalizes a string into a URL-friendly slug
   * @param {string} text
   * @returns {string}
   */
  SectionNavigation.slugify = function (text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w-]+/g, "") // Remove all non-word chars
      .replace(/--+/g, "-"); // Replace multiple - with single -
  };

  /**
   * Parses the content and extracts sections based on -#slug syntax
   * Also extracts images for SEO Hydration
   * @param {string} content - HTML content from WordPress
   * @returns {Object} { sections: Array, processedContent: string, imageRegistry: Map }
   */
  SectionNavigation.parse = function (content) {
    if (!content)
      return { sections: [], processedContent: "", imageRegistry: new Map() };

    const imageRegistry = new Map();
    let imageCounter = 0;

    // Regex to find -# markers
    const markerRegex = /-#\s*([^|\n<]+)(?:\s*\|\s*([^<\n]+))?/g;

    const sections = [];
    const matches = [];
    let match;
    while ((match = markerRegex.exec(content)) !== null) {
      matches.push({
        fullMatch: match[0],
        idCandidate: match[1].trim(),
        explicitTitle: match[2] ? match[2].trim() : null,
        index: match.index,
      });
    }

    if (matches.length === 0) {
      return { sections: [], processedContent: content, imageRegistry };
    }

    // Process each match to extract content and titles
    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const next = matches[i + 1];

      const start = current.index + current.fullMatch.length;
      const end = next ? next.index : content.length;

      let sectionContent = content.substring(start, end).trim();
      let sectionId = SectionNavigation.slugify(current.idCandidate);
      let sectionTitle = current.explicitTitle;

      // Extract title from first heading if not provided
      if (!sectionTitle) {
        if (
          current.idCandidate.includes("-") ||
          current.idCandidate.includes(" ")
        ) {
          sectionTitle = current.idCandidate
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
        } else {
          const headingMatch = sectionContent.match(
            /<h[1-6][^>]*>(.*?)<\/h[1-6]>/i,
          );
          if (headingMatch) {
            sectionTitle = headingMatch[1].replace(/<[^>]*>/g, "").trim();
          } else {
            sectionTitle = sectionId
              .replace(/-/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase());
          }
        }
      }

      // --- IMAGE EXTRACTION (SEO HYDRATOR) ---
      // Find <img> tags and replace them with placeholders
      // Supported attributes from Gutenberg: src, alt, class, width, height...
      const imgRegex = /<img[^>]+src="([^">]+)"([^>]*)>/gi;
      sectionContent = sectionContent.replace(
        imgRegex,
        (fullMatch, src, attrs) => {
          const id = `img-${sectionId}-${++imageCounter}`;

          // Extract alt text
          const altMatch = attrs.match(/alt="([^">]*)"/i);
          const alt = altMatch ? altMatch[1] : "";

          // Extract width/height for aspect-ratio preservation
          const wMatch = attrs.match(/width="(\d+)"/i);
          const hMatch = attrs.match(/height="(\d+)"/i);
          let style = "";
          if (wMatch && hMatch) {
            style = `style="aspect-ratio: ${wMatch[1]}/${hMatch[2]};"`;
          }

          imageRegistry.set(id, { src, alt, originalMarkup: fullMatch });

          return `<div class="image-hydrator skeleton" data-image-id="${id}" ${style}></div>`;
        },
      );

      sections.push({
        id: sectionId,
        title: sectionTitle,
        content: sectionContent,
      });
    }

    // Reconstruct content wrapping each section in <section id="slug">
    const processedContent = sections
      .map((section) => {
        const cleanContent = section.content.replace(/^<br\s*\/?>/i, "");
        return `<section id="${section.id}" class="section-container section-anchor" data-section-title="${section.title}">
${cleanContent}
</section>`;
      })
      .join("\n");

    return { sections, processedContent, imageRegistry };
  };

  /**
   * Initializes the Image SEO Hydrator observers
   * @param {Map} imageRegistry - The registry returned by parse()
   */
  SectionNavigation.initHydrator = function (imageRegistry) {
    if (!imageRegistry || imageRegistry.size === 0) return;

    const observerOptions = {
      root: null,
      threshold: 0.1,
      rootMargin: "50px", // Load slightly before they enter
    };

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const imageId = target.dataset.imageId;
          const imageData = imageRegistry.get(imageId);

          if (imageData) {
            this.hydrateImage(target, imageData);
          }
          observer.unobserve(target);
        }
      });
    }, observerOptions);

    document
      .querySelectorAll(".image-hydrator")
      .forEach((el) => imageObserver.observe(el));
  };

  /**
   * Performs the actual hydration of a placeholder
   */
  SectionNavigation.hydrateImage = function (target, imageData) {
    const img = document.createElement("img");
    img.src = imageData.src;
    img.alt = imageData.alt;
    img.className = "portfolio-img loaded"; // Standard project class

    img.onload = () => {
      target.appendChild(img);
      target.classList.remove("skeleton");
      target.classList.add("hydrated");
    };

    img.onerror = () => {
      target.classList.remove("skeleton");
      target.classList.add("error");
    };
  };

  /**
   * Renders the navigation tabs based on parsed sections
   * @param {Array} sections - Array of section objects
   * @param {string} containerSelector - Selector for the tabs container
   */
  SectionNavigation.renderTabs = function (sections, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container || !sections.length) return;

    // Clear existing tabs if any
    container.innerHTML = "";

    sections.forEach((section, index) => {
      const button = document.createElement("button");
      button.className = "tab-btn";
      button.dataset.target = section.id;
      button.dataset.state = index === 0 ? "active" : "idle";
      button.textContent = section.title;

      container.appendChild(button);
    });

    // Auto-scroll logic if previously defined in the page could be re-initialized here
  };

  global.SectionNavigation = SectionNavigation;
})(window);
