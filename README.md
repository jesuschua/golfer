# Golf Course Screensaver

A beautiful browser-based screensaver that generates randomized golf course holes with an isometric view. The application creates realistic golf course layouts with varying terrain, hazards, and natural lighting.

## Features

- **Randomized Golf Holes**: Each generation creates a unique golf course hole with varying par, difficulty, and layout
- **Isometric 3D View**: Slight isometric perspective provides depth and shows terrain slopes
- **Realistic Course Elements**:
  - Tee areas with elevated positions
  - Curved fairways with varying widths
  - Undulating greens with pin placement
  - Sand bunkers and water hazards
  - Trees and natural obstacles
  - Terrain elevation changes

- **Interactive Controls**:
  - Click anywhere on the canvas to generate a new hole
  - "Generate New Hole" button for easy regeneration
  - Keyboard shortcuts (Space/Enter for new hole, Escape for fullscreen)
  - Auto-regeneration every 30 seconds for true screensaver functionality

- **Responsive Design**: Adapts to different screen sizes and supports fullscreen mode

## How to Run

1. Open `app/index.html` in any modern web browser
2. The screensaver will automatically start generating golf holes
3. Click anywhere or press Space/Enter to generate a new hole
4. Press Escape to toggle fullscreen mode

## Technical Implementation

- **Pure JavaScript**: No external dependencies required
- **HTML5 Canvas**: High-performance 2D rendering
- **Isometric Projection**: Mathematical transformation for 3D appearance
- **Procedural Generation**: Algorithms for realistic golf course layouts
- **Responsive Canvas**: Automatically adjusts to window size

## Course Generation Details

The application uses sophisticated algorithms to create realistic golf holes:

- **Terrain Generation**: Uses smooth noise functions to create natural elevation changes
- **Fairway Curves**: Cubic Bezier curves create natural, flowing fairway shapes
- **Strategic Hazard Placement**: Bunkers and water features are positioned to create interesting gameplay
- **Realistic Proportions**: All elements are scaled to approximate real golf course dimensions
- **Lighting Effects**: Simple lighting simulation enhances the 3D appearance

Enjoy watching endless variations of beautiful golf holes!
