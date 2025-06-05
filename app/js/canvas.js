// Canvas management and rendering utilities

class CanvasRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.setupEventListeners();
    }

    setupCanvas() {
        // Set canvas size to fill most of the screen
        const margin = 100;
        this.canvas.width = window.innerWidth - margin;
        this.canvas.height = window.innerHeight - margin;
          // Set the canvas center for isometric projection
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        
        // Scale factor for the isometric view - increased for better visibility
        this.scale = 6;
    }

    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
        });
    }    // Clear the canvas with a serene sky background
    clear() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#f5f1e8');  // Warm cream
        gradient.addColorStop(1, '#e8dcc0');  // Soft beige
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Transform isometric coordinates to screen coordinates
    transformPoint(x, y, z = 0) {
        const iso = isoToScreen(x, y, z);
        return {
            x: this.centerX + iso.x * this.scale,
            y: this.centerY + iso.y * this.scale
        };
    }

    // Draw a filled polygon with isometric coordinates
    drawPolygon(points, fillStyle, strokeStyle = null, lineWidth = 1) {
        if (points.length < 3) return;

        this.ctx.save();
        this.ctx.fillStyle = fillStyle;
        this.ctx.beginPath();

        const firstPoint = this.transformPoint(points[0].x, points[0].y, points[0].z || 0);
        this.ctx.moveTo(firstPoint.x, firstPoint.y);

        for (let i = 1; i < points.length; i++) {
            const point = this.transformPoint(points[i].x, points[i].y, points[i].z || 0);
            this.ctx.lineTo(point.x, point.y);
        }

        this.ctx.closePath();
        this.ctx.fill();

        if (strokeStyle) {
            this.ctx.strokeStyle = strokeStyle;
            this.ctx.lineWidth = lineWidth;
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    // Draw a circle in isometric space
    drawCircle(x, y, radius, fillStyle, strokeStyle = null, lineWidth = 1) {
        const center = this.transformPoint(x, y);
        
        this.ctx.save();
        this.ctx.fillStyle = fillStyle;
        this.ctx.beginPath();
        
        // Create an ellipse for isometric perspective
        this.ctx.ellipse(
            center.x, 
            center.y, 
            radius * this.scale, 
            radius * this.scale * 0.5, // Flatten for isometric view
            0, 0, Math.PI * 2
        );
        
        this.ctx.fill();

        if (strokeStyle) {
            this.ctx.strokeStyle = strokeStyle;
            this.ctx.lineWidth = lineWidth;
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    // Draw text at isometric coordinates
    drawText(text, x, y, fontSize = 16, fillStyle = 'black', align = 'center') {
        const point = this.transformPoint(x, y);
        
        this.ctx.save();
        this.ctx.fillStyle = fillStyle;
        this.ctx.font = `${fontSize}px Arial`;
        this.ctx.textAlign = align;
        this.ctx.fillText(text, point.x, point.y);
        this.ctx.restore();
    }

    // Add simple lighting effect to a color
    applyLighting(color, lightFactor = 1) {
        // Parse RGB color
        const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (!match) return color;

        let [, r, g, b] = match.map(Number);
        
        // Apply lighting
        r = Math.min(255, Math.floor(r * lightFactor));
        g = Math.min(255, Math.floor(g * lightFactor));
        b = Math.min(255, Math.floor(b * lightFactor));

        return `rgb(${r}, ${g}, ${b})`;
    }

    // Get canvas dimensions
    getWidth() {
        return this.canvas.width;
    }

    getHeight() {
        return this.canvas.height;
    }
}
