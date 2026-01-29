# Portfolio Form UX Improvement Plan

## Current State Analysis

The existing portfolio form has separate tabs for:

- **General**: Title, Subtitle, Client Name, Industry, ID, Slug, Discipline, Categories
- **Card Data**: Extract, Cover Image URL, Logo URL
- **Item Data**: Project Title, Display Name, Cover Image, Project URL, Images, Team
- **Preview**: Card, Item, JSON views

## Proposed Improvements

### 1. Merge Tabs

- Combine "General" and "Card Data" into a single "Portfolio Data" tab
- Keep "Item Data" and "Preview" as separate tabs
- Update tab navigation accordingly

### 2. Button-Triggered Inputs

Replace traditional visible input fields with a proactive button-based system:

#### Core Required Fields (Always Visible Buttons)

- **Add Client Name** → Reveals input for client name
- **Add Project Title** → Reveals input for main title
- **Add Subtitle** → Reveals input for subtitle
- **Add Description** → Reveals textarea for extract/description
- **Add Cover Image** → Reveals URL input for cover image
- **Add Logo** → Reveals URL input for logo

#### Optional/Advanced Fields (Secondary Buttons)

- **Add Industry** → Reveals industry input
- **Add Categories** → Reveals category management
- **Edit Slug** → Reveals slug input (auto-generated from title)
- **Edit ID** → Reveals ID input (auto-generated)

#### Automated Fields

- Discipline selector (always visible as it's required)
- Slug auto-generates from title
- ID auto-generates when slug is set

### 3. Live Preview with Mock Data

- Always display a card preview on the right side of the form
- Use mock data by default:
  - Placeholder images (via.placeholder.com)
  - Generic text placeholders
  - Default discipline styling
- Update preview in real-time as user adds/modifies data
- Mock data should NOT be saved in inputs - only real user data

### 4. UX Flow Improvements

1. **Initial State**: Empty form with action buttons and mock preview
2. **Progressive Disclosure**: Buttons reveal inputs only when needed
3. **Visual Feedback**: Highlight active inputs, show completion status
4. **Smart Defaults**: Auto-generate slug/ID, suggest categories from history
5. **Validation**: Real-time validation with helpful error messages

### 5. Layout Changes

- **Two-Column Layout**:
  - Left: Form controls (buttons + revealed inputs)
  - Right: Live preview card
- **Responsive**: Stack vertically on mobile
- **Visual Hierarchy**: Clear distinction between required/optional actions

### 6. Technical Implementation

- Update HTML structure for new tab organization
- Add JavaScript for button-triggered input reveals
- Implement live preview updates with mock data fallbacks
- Modify CSS for new layout and button styles
- Update form data collection to handle new flow

### 7. Data Structure Considerations

- Maintain existing `portfolioData` structure
- Ensure mock data doesn't contaminate real form data
- Preserve backward compatibility with existing saved items

## Benefits

- **Reduced Cognitive Load**: Users focus on one task at a time
- **Better Guidance**: Clear action buttons guide the creation process
- **Immediate Feedback**: Live preview shows progress instantly
- **Cleaner Interface**: Less cluttered form with progressive disclosure
- **Improved Completion**: Proactive UX encourages completion of required fields

## Implementation Phases

1. **Phase 1**: Merge tabs and basic button system
2. **Phase 2**: Implement live preview with mock data
3. **Phase 3**: Add progressive disclosure and validation
4. **Phase 4**: Polish UX and responsive design
5. **Phase 5**: Testing and refinement
