# Portfolio Sheet Layout Plan

## Overview

Redesign the portfolio sidesheet/bottom sheet to have a structured layout with:

- **Header**: Top controls (2 buttons + chevron) + close button (always visible)
- **Content**: Scrollable middle section
- **Footer**: Bottom controls (primary, secondary, more actions)

## Current Structure

```html
<div id="bottomsheet">
  <div id="header">
    <div class="drag-handle"></div>
    <button id="close-btn">X</button>
  </div>
  <div id="sheet-content"></div>
  <div id="sheet-cta"></div>
</div>
```

## New Structure

```html
<div id="bottomsheet">
  <!-- Header: Top Controls -->
  <div class="sheet-top-controls">
    <div class="top-controls-left">
      <button class="top-btn">Button 1</button>
      <button class="top-btn">Button 2</button>
      <button class="top-chevron" aria-label="More options">
        <svg>...</svg>
      </button>
    </div>
    <button class="close-btn">X</button>
  </div>

  <!-- Content: Middle Section -->
  <div class="sheet-content">
    <!-- Scrollable content here -->
  </div>

  <!-- Footer: Bottom Controls -->
  <div class="sheet-bottom-controls">
    <button class="btn-secondary">Secondary</button>
    <button class="btn-primary">Primary Action</button>
    <button class="btn-more">⋮</button>
  </div>
</div>
```

## Implementation Steps

### Step 1: Update CSS for New Layout Structure

- Create `.sheet-top-controls` container with flexbox layout
- Position close button on right side, always visible
- Create `.sheet-content` with flex-grow for scrollable area
- Create `.sheet-bottom-controls` container fixed at bottom
- Update responsive styles for mobile vs desktop

### Step 2: Update HTML Structure

- Modify `#bottomsheet` HTML to use new structure
- Add top controls section with left/right positioning
- Ensure close button is always visible
- Add bottom controls section

### Step 3: Update JavaScript (adaptive-sheet.js)

- Update references from `#header` to new structure
- Add event handlers for top controls buttons
- Add event handlers for chevron (expand options)
- Add event handlers for bottom controls
- Ensure drag-to-close still works

### Step 4: Add Button Styles

- Primary action button (blue/brand color)
- Secondary action button (outlined/ghost)
- Three dots button (icon-only)
- Top control buttons styling
- Chevron button styling

### Step 5: Test Responsive Behavior

- Mobile: bottom sheet with controls
- Desktop: side panel/sidesheet with controls
- Ensure close button always visible
- Test drag gestures
- Test all button interactions

## Files to Modify

1. `index.html` - Update bottomsheet HTML structure
2. `index.html` - Add/update CSS for new layout
3. `shared/components/adaptive-sheet/adaptive-sheet.js` - Update JS references
