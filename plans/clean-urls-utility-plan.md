# Clean URLs Utility - Implementation Plan

## Objective

Create a JavaScript utility that maintains clean URLs by intercepting hash-based navigation while preserving smooth scrolling functionality.

## Requirements Analysis

### Core Functionality

1. **Detect hash links**: Intercept all `<a>` elements with `href` containing `#` (e.g., `#mi-id`, `#section`)
2. **Prevent URL hash update**: Stop the browser from adding the hash fragment to the URL
3. **Preserve smooth scroll**: Ensure smooth scrolling still works to the target element
4. **Handle initial load**: Optionally clean up existing hashes on page load

### Technical Approach

#### 1. Event Delegation Pattern

```javascript
// Use event delegation on document for better performance
document.addEventListener("click", (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (link) {
    e.preventDefault();
    scrollToElement(link.getAttribute("href").slice(1));
  }
});
```

#### 2. Scroll Function

```javascript
function scrollToElement(id) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
```

#### 3. Initial Hash Cleanup

```javascript
// On page load, remove hash from URL without scrolling
if (window.location.hash) {
  history.replaceState(null, "", window.location.pathname);
}
```

## Implementation Steps

### Step 1: Create `assets/scripts/clean-urls.js`

- Initialize the utility as an IIFE (Immediately Invoked Function Expression)
- Add click event listener on document for event delegation
- Implement hash detection and scroll logic
- Handle initial page load hash cleanup

### Step 2: Update `index.html`

- Add the script include for `clean-urls.js`
- Ensure it loads after DOM is ready

### Step 3: Edge Cases to Handle

- Links pointing to non-existent elements
- Links within scrollable containers
- Accessibility considerations (focus management)
- Safari and iOS compatibility

## File Structure

```
assets/scripts/
├── clean-urls.js (new)
├── mega-menu-spa.js
└── scroll-lock.js
```

## Usage Example

```html
<!-- These links will work without updating the URL hash -->
<a href="#section-1">Section 1</a>
<a href="#contact">Contact</a>
<a href="#mi-id">Mi ID</a>
```

## Browser Compatibility

- All modern browsers supporting `scrollIntoView({ behavior: 'smooth' })`
- Graceful degradation for older browsers (instant scroll)

## Testing Checklist

- [ ] Clicking hash links scrolls to target element
- [ ] URL remains clean (no hash fragment)
- [ ] Smooth scrolling animation works
- [ ] Initial page load with hash cleans URL
- [ ] Links to non-existent elements don't cause errors
- [ ] Accessibility (keyboard navigation, focus management)
