# Slug Fallback System

## Overview

The new portfolio template includes a configurable fallback mechanism that automatically loads a default project when no slug is provided in the URL or when a slug returns a 404 error.

## How It Works

When you navigate to:

```
http://127.0.0.1:52422/new-portfolio/index.html
```

Instead of showing an error, the system automatically loads:

```
http://127.0.0.1:52422/new-portfolio/index.html?slug=fish-and-grill-los-cabos-restaurant-brand
```

## Configuration

### Enabling/Disabling the Fallback

Open `new-portfolio/slug-fallback.js` and modify the configuration:

```javascript
// ============================================
// CONFIGURATION
// ============================================

/**
 * Default slug to use when:
 * 1. No slug is found in URL
 * 2. Slug returns 404/not found
 *
 * Set to null to disable fallback behavior
 */
const DEFAULT_FALLBACK_SLUG = "fish-and-grill-los-cabos-restaurant-brand";

// To disable fallback, comment out the line above and uncomment this:
// const DEFAULT_FALLBACK_SLUG = null;
```

### Option 1: Enable Fallback (Default)

```javascript
const DEFAULT_FALLBACK_SLUG = "fish-and-grill-los-cabos-restaurant-brand";
```

### Option 2: Disable Fallback

```javascript
const DEFAULT_FALLBACK_SLUG = null;
```

### Option 3: Use Different Default Project

```javascript
const DEFAULT_FALLBACK_SLUG = "your-project-slug-here";
```

## Use Cases

### During Development

- **Enabled**: Quickly test the portfolio without needing to type the slug every time
- **Disabled**: Test the error handling and ensure proper URL structure

### In Production

- **Enabled**: Provide a default "showcase" project for visitors who land on the portfolio home
- **Disabled**: Force users to navigate through proper navigation (recommended for most cases)

## Console Messages

When the fallback is triggered, you'll see:

```
⚠️ No slug found in URL. Using fallback: fish-and-grill-los-cabos-restaurant-brand
✅ Slug fallback manager initialized
   Default fallback slug: fish-and-grill-los-cabos-restaurant-brand
```

When disabled:

```
✅ Slug fallback manager initialized
   Fallback disabled (no default slug set)
```

## Technical Details

The fallback system works by:

1. Intercepting the slug detection before `portfolio-item-fetch.js` runs
2. Checking if a slug exists in the URL parameters
3. If no slug or 404 response, replacing it with the default
4. Updating the browser URL without page reload
5. Allowing the normal fetch/render cycle to proceed

## Files Modified

- `new-portfolio/slug-fallback.js` - New file containing fallback logic
- `new-portfolio/index.html` - Added script tag (must load before portfolio-item-fetch.js)
