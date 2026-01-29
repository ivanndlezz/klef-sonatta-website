# Portfolio Item Dynamic Rendering Plan

## Overview

As the static `portfolio-item.html`, create a new file `portfolio-item-dynamic.html` that fetches portfolio item data via GraphQL based on a slug, renders the interface, manages states, and includes skeleton animations for loading.

## Key Components

- **Mock Slug**: Start with `mock_slug = "/slug-que-existe"`; plan to extract from `window.location.pathname` in the future.
- **GraphQL Fetch**: Use endpoint `https://klef.newfacecards.com/graphql` with a custom query to fetch post data by slug.
- **State Management**: JSON object with `loading`, `data`, `error` properties.
- **Skeleton Animations**: CSS-based shimmer effects for title, images, and description during loading.
- **Rendering**: Populate HTML elements with fetched data.

## GraphQL Query

```graphql
query GetPortfolioItem($slug: ID!) {
  post(id: $slug, idType: SLUG) {
    id
    title
    slug
    uri
    date
    content(format: RENDERED)
    featuredImage {
      node {
        sourceUrl(size: LARGE)
        altText
      }
    }
    portfolioImages {
      id
      sourceUrl(size: LARGE)
      altText
      mediaItemUrl
      filePath
    }
    categories {
      nodes {
        categoryId
        name
        slug
        uri
      }
    }
    tags {
      nodes {
        tagId
        name
        slug
      }
    }
    author {
      node {
        id
        name
        firstName
        lastName
        uri
        url
        userId
        avatar {
          url
        }
      }
    }
    coAuthors {
      __typename
      ... on User {
        id
        name
        firstName
        lastName
        uri
        url
        userId
        avatar {
          url
        }
        description
      }
      ... on GuestAuthor {
        id
        name
        firstName
        lastName
        email
        avatar {
          url
        }
        description
        website
      }
    }
  }
}
```

## Todo List

- [ ] Add a `<script>` tag at the end of portfolio-item.html to include JavaScript code for dynamic data fetching and rendering
- [ ] Define a mock_slug constant set to "/slug-que-existe" with a comment planning to extract slug from window.location.pathname in the future
- [ ] Create a state object (JSON-like) with properties: loading (boolean), data (object), error (string)
- [ ] Implement a GraphQL fetch function that uses the provided query to fetch portfolio item data by slug from https://klef.newfacecards.com/graphql
- [ ] Add CSS styles for skeleton animations on key elements: title, images, and description (using keyframes for shimmer effect)
- [ ] Create a render function to populate the HTML elements with fetched data (title, content, images, categories, author, etc.)
- [ ] Implement state management: show skeleton animations during loading, render data on success, display error message on failure
- [ ] Add initialization code to call the fetch function on DOMContentLoaded, updating the state accordingly

## Workflow Diagram

```mermaid
graph TD
    A[Page Load] --> B[Initialize State: loading=true]
    B --> C[Extract Slug (mock for now)]
    C --> D[Fetch Data via GraphQL]
    D --> E{Response?}
    E -->|Success| F[Update State: data=response, loading=false]
    E -->|Error| G[Update State: error=message, loading=false]
    F --> H[Render Data to HTML]
    G --> I[Display Error]
    H --> J[Hide Skeletons]
    I --> J
```

## Notes

- Skeleton animations use CSS keyframes for a shimmer effect.
- State changes trigger re-rendering of the UI.
- Future: Replace mock_slug with dynamic extraction from URL path.
