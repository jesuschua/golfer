// Utility functions for the golf screensaver

// Random number generator with range
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// Random integer generator
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Convert isometric coordinates to screen coordinates
function isoToScreen(x, y, z = 0) {
    const screenX = (x - y) * Math.cos(Math.PI / 6);
    const screenY = (x + y) * Math.sin(Math.PI / 6) - z;
    return { x: screenX, y: screenY };
}

// Distance between two points
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Clamp value between min and max
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Linear interpolation
function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

// Generate calm, consistent colors for serene aesthetic
function getBaseGreen() {
    return '#4a7c59'; // Calm, muted green
}

function getFairwayGreen() {
    return '#5a8c69'; // Slightly lighter fairway green
}

function getGreenColor() {
    return '#6b9b7a'; // Soft green color
}

function getSandColor() {
    return '#d4c4a0'; // Muted sand color
}

function getWaterColor() {
    return '#6b9dc2'; // Calm blue water
}

function getTreeColor() {
    return '#3a5f3a'; // Deep forest green
}

// Generate smooth noise for terrain
function smoothNoise(x, y, scale = 0.1) {
    return (Math.sin(x * scale) + Math.cos(y * scale)) * 0.5 + 0.5;
}

// Create a smooth curve using cubic bezier
function cubicBezier(t, p0, p1, p2, p3) {
    const oneMinusT = 1 - t;
    return oneMinusT ** 3 * p0 + 
           3 * oneMinusT ** 2 * t * p1 + 
           3 * oneMinusT * t ** 2 * p2 + 
           t ** 3 * p3;
}

// Adjust color brightness for animation effects
function adjustColor(hexColor, brightnessAdjustment) {
    // Parse hex color
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Adjust brightness
    const newR = clamp(r + brightnessAdjustment, 0, 255);
    const newG = clamp(g + brightnessAdjustment, 0, 255);
    const newB = clamp(b + brightnessAdjustment, 0, 255);
    
    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}
