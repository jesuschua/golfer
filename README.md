# Golf Course Screensaver

A beautiful browser-based screensaver that generates randomized golf course holes with an isometric view. Inspired by the calm, minimalistic aesthetic of games like "Journey", this application creates serene golf course layouts with warm earth tones and gentle terrain variations.

## Features

- **Randomized Golf Holes**: Each generation creates a unique golf course hole with varying par, difficulty, and layout
- **Isometric 3D View**: Slight isometric perspective provides depth and shows terrain slopes
- **Journey-Inspired Aesthetic**: Calm, muted earth tones and minimalistic design for a contemplative viewing experience
- **Realistic Course Elements**:
  - Tee areas with elevated positions
  - Curved fairways with varying widths
  - Undulating greens with pin placement and flags
  - Minimal sand bunkers and occasional water hazards
  - Sparse tree placement for open, serene landscapes
  - Gentle terrain elevation changes
  - Golf ball positioned near the hole as if from a previous shot

- **Interactive Controls**:
  - Click anywhere on the canvas to generate a new hole
  - "Generate New Hole" button for easy regeneration
  - Keyboard shortcuts (Space/Enter for new hole, Escape for fullscreen)
  - Auto-regeneration every 2 minutes for contemplative screensaver functionality

- **Responsive Design**: Adapts to different screen sizes and supports fullscreen mode

## How to Run

1. Open `app/index.html` in any modern web browser
2. The screensaver will automatically start generating golf holes
3. Click anywhere or press Space/Enter to generate a new hole
4. Press Escape to toggle fullscreen mode

## Technical Implementation

- **Pure JavaScript**: No external dependencies required
- **HTML5 Canvas**: High-performance 2D rendering with 6x zoom scale for detailed view
- **Isometric Projection**: Mathematical transformation for 3D appearance
- **Procedural Generation**: Algorithms for realistic golf course layouts
- **Responsive Canvas**: Automatically adjusts to window size
- **Consistent Color Palette**: Fixed muted earth tones prevent visual "shimmering"
- **Simplified Golf Ball**: Stationary ball near hole with subtle dimple details

## Course Generation Details

The application uses sophisticated algorithms to create realistic golf holes:

- **Terrain Generation**: Uses smooth noise functions to create gentle elevation changes
- **Fairway Curves**: Cubic Bezier curves create natural, flowing fairway shapes  
- **Minimal Hazard Placement**: Sparse bunkers and rare water features maintain serene aesthetic
- **Realistic Proportions**: All elements are scaled to approximate real golf course dimensions
- **Warm Color Scheme**: Muted greens, sandy browns, and soft blues create a calming atmosphere
- **Strategic Golf Ball Placement**: Ball appears near the pin as if from a successful approach shot

## Visual Style

Inspired by the contemplative beauty of "Journey", the screensaver features:
- Warm, muted earth tones throughout
- Minimal, clean design elements
- Gentle terrain variations
- Sparse, intentional placement of course features
- Consistent color palette to avoid visual distractions
- 2-minute auto-regeneration for peaceful contemplation

Enjoy watching endless variations of serene golf holes!
