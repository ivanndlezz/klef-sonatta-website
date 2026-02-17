/**
 * Portfolio Hydrator - MVP
 * Fetches data from GraphQL and hydrates 3 fields: title, category, heroImage
 */

const GRAPHQL_ENDPOINT = "https://klef.newfacecards.com/graphql";

// Simplified GraphQL query - just what we need for MVP
const GET_PORTFOLIO_QUERY = `
  query GetPortfolioItem($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      title
      featuredImage {
        node {
          sourceUrl(size: LARGE)
          altText
        }
      }
      categories {
        nodes {
          name
        }
      }
    }
  }
`;

/**
 * Extract slug from URL
 */
function getSlugFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const slugParam = urlParams.get("slug");
  if (slugParam) return slugParam;

  // Try pathname
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  if (pathParts.length > 0) {
    let lastPart = pathParts[pathParts.length - 1];
    if (lastPart.toLowerCase() === "index.html") {
      if (pathParts.length > 1) {
        lastPart = pathParts[pathParts.length - 2];
      }
    }
    return lastPart;
  }

  // Default for testing
  return "fish-and-grill-los-cabos-restaurant-brand";
}

/**
 * Fetch portfolio data from GraphQL
 */
export async function fetchPortfolioData(slug) {
  try {
    console.log(`🔍 Fetching portfolio: ${slug}`);

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: GET_PORTFOLIO_QUERY,
        variables: { slug },
      }),
    });

    const json = await response.json();

    if (json.errors) {
      throw new Error(json.errors[0].message);
    }

    if (!json.data.post) {
      throw new Error("Portfolio item not found");
    }

    console.log("✅ Data fetched:", json.data.post);
    return json.data.post;
  } catch (error) {
    console.error("❌ Fetch error:", error);
    throw error;
  }
}

/**
 * Hydrate a single field
 */
function hydrateField(fieldName, value, element) {
  switch (fieldName) {
    case "title":
      element.textContent = value;
      element.classList.remove("skeleton", "skeleton-title");
      break;

    case "category":
      const categoryName = value?.nodes?.[0]?.name || "Portfolio";
      element.querySelector("span")?.remove(); // Remove skeleton text
      element.textContent = categoryName;
      element.classList.remove("skeleton");
      break;

    case "heroImage":
      if (value?.node?.sourceUrl) {
        element.style.backgroundImage = `url(${value.node.sourceUrl})`;
        element.style.backgroundSize = "cover";
        element.style.backgroundPosition = "center";
        element.querySelector(".skeleton-shimmer")?.remove();
        element.classList.remove("skeleton", "skeleton-image");
      }
      break;

    default:
      console.warn(`⚠️ Unknown field: ${fieldName}`);
  }

  console.log(`✓ Hydrated: ${fieldName}`);
}

/**
 * Main hydration function
 */
export async function hydrateTemplate(data) {
  console.log("💧 Starting hydration...");

  // Find all elements with data-field attributes
  const fields = document.querySelectorAll("[data-field]");

  // Map GraphQL data to field names
  const dataMap = {
    title: data.title,
    category: data.categories,
    heroImage: data.featuredImage,
  };

  // Hydrate each field
  fields.forEach((element) => {
    const fieldName = element.getAttribute("data-field");
    const value = dataMap[fieldName];

    if (value !== undefined) {
      hydrateField(fieldName, value, element);
    }
  });

  console.log("✅ Hydration complete!");
}

/**
 * Initialize - auto-run on import
 */
export async function init() {
  try {
    const slug = getSlugFromURL();
    console.log(`🚀 Initializing with slug: ${slug}`);

    const data = await fetchPortfolioData(slug);
    await hydrateTemplate(data);
  } catch (error) {
    console.error("❌ Initialization failed:", error);
    // Show error in UI
    document.body.innerHTML = `
      <div style="padding: 40px; text-align: center; font-family: sans-serif;">
        <h2 style="color: #e53e3e;">Error Loading Portfolio</h2>
        <p style="color: #718096;">${error.message}</p>
        <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer;">
          Retry
        </button>
      </div>
    `;
  }
}

export default { init, fetchPortfolioData, hydrateTemplate };
