# Design Guidelines: Silent MI Detection Web Application

## Design Approach: Healthcare Utility System

**Selected Approach**: Medical-grade interface inspired by modern healthcare platforms (Epic MyChart, Meditech) with Material Design principles for consistency and accessibility.

**Key Principles**:
- Clinical trust and professionalism above visual flair
- Clear data hierarchy for critical medical information
- Immediate comprehension for rapid clinical decision-making
- Accessibility-first (WCAG 2.1 AA minimum for medical applications)

---

## Core Design Elements

### A. Color Palette

**Light Mode (Primary)**:
- Primary Blue: 210 85% 45% (medical trust, calmness)
- Background: 0 0% 98% (clean clinical white)
- Surface Cards: 0 0% 100%
- Text Primary: 220 15% 15%
- Text Secondary: 220 10% 45%
- Success/Normal: 145 65% 42% (healthy indicators)
- Warning: 38 92% 50% (caution states)
- Error/Critical: 0 75% 55% (MI detection alerts)
- Border: 220 13% 88%

**Dark Mode**:
- Primary Blue: 210 75% 55%
- Background: 220 18% 10%
- Surface Cards: 220 15% 14%
- Text Primary: 0 0% 95%
- Text Secondary: 220 10% 70%
- Borders: 220 10% 25%

### B. Typography

**Font Stack**: 
- Primary: 'Inter', system-ui, sans-serif (professional, highly legible)
- Monospace: 'JetBrains Mono', monospace (for patient IDs, data values)

**Hierarchy**:
- Page Title: text-3xl font-semibold (clinical section headers)
- Section Headers: text-xl font-medium
- Form Labels: text-sm font-medium uppercase tracking-wide (clinical precision)
- Body Text: text-base font-normal
- Data Values: text-lg font-semibold (test results, readings)
- Helper Text: text-sm text-secondary

### C. Layout System

**Spacing Primitives**: Use Tailwind units of **4, 6, 8, 12** exclusively
- Component padding: p-6 or p-8
- Section gaps: gap-6 or gap-8
- Form field spacing: space-y-4
- Card padding: p-8

**Grid System**:
- Max container width: max-w-5xl (optimal for form-heavy medical apps)
- Two-column layout on desktop: Patient Info (left) + Upload/Results (right)
- Single column stack on mobile/tablet

### D. Component Library

**1. Patient Information Form**:
- Clean, structured form fields in a card
- Left-aligned labels with consistent spacing
- Input fields: Full-width with clear borders (border-2 when focused)
- Field grouping: Age/Gender on same row, Height/Weight on same row, BP separate
- Validation: Inline error messages in red below fields
- All inputs with subtle shadow on focus for depth

**2. File Upload Component**:
- Large dropzone area (min-h-64) with dashed border
- Icon: Upload cloud icon (from Heroicons)
- Clear file format instructions: ".dat, .hea, .csv accepted"
- File preview after upload showing filename and size
- Remove file button with trash icon
- Drag-and-drop visual feedback (border color change)

**3. Results Display Card**:
- Prominent result badge at top (large, colored based on outcome)
- Color coding: Green = Normal, Orange = Monitor, Red = Silent MI Detected
- Confidence score with progress bar visualization
- Detailed breakdown section with expandable technical details
- Timestamp of analysis
- Download/Print report button

**4. Navigation Header**:
- Simple top bar with logo/title on left
- Patient session indicator (if applicable)
- Dark/light mode toggle on right
- Minimal height (h-16) to maximize clinical workspace

**5. Status Indicators**:
- Processing state: Animated pulse on blue background
- Success/Error toasts: Top-right corner notifications
- Loading spinner: Centered overlay during ML inference

**6. Data Visualization** (if showing ECG preview):
- Line chart showing 12-lead ECG traces
- Grid background for medical accuracy
- Lead labels (I, II, III, aVR, aVL, aVF, V1-V6)
- Subtle animation on load

### E. Interaction Patterns

**Form Behavior**:
- Real-time validation with debounce (300ms)
- Clear error states with helpful messages
- Disabled submit button until all required fields valid
- Auto-focus on first field on page load

**File Upload**:
- Drag-and-drop with hover state
- Click to browse fallback
- File type validation before upload
- Progress indicator during upload/processing

**Results**:
- Smooth reveal animation (fade-in from bottom)
- Expandable sections for technical details (ECG parameters)
- Copy-to-clipboard for patient ID/results

**Animations**: Minimal and purposeful
- Fade transitions: 200ms ease-in-out
- Button hover: subtle scale (1.02) and shadow increase
- No distracting animations during critical workflows

---

## Page Structure

**Single-Page Application Layout**:

1. **Header** (sticky): Logo, title "Silent MI Detection System", mode toggle
2. **Main Content Area** (max-w-5xl mx-auto px-6 py-12):
   - **Left Column** (lg:w-1/2):
     - "Patient Information" card with form fields
     - Submit button at bottom of card
   - **Right Column** (lg:w-1/2):
     - "ECG Upload" card with dropzone
     - "Analysis Results" card (appears after processing)
3. **Footer** (minimal): Disclaimer text, version info

**No Hero Image**: This is a clinical utility - immediate access to functionality

---

## Accessibility & Trust Elements

- High contrast ratios (4.5:1 minimum)
- All interactive elements keyboard navigable
- ARIA labels for screen readers on all form inputs
- Focus indicators clearly visible (ring-2 ring-offset-2)
- Medical disclaimer text in footer
- Timestamp on all results for audit trail
- Clear "For Research/Educational Use Only" banner if applicable

**Trust Indicators**:
- Professional color scheme (medical blues)
- Clear labeling and instructions
- Immediate validation feedback
- Transparent confidence scores
- No marketing language - direct, clinical terminology