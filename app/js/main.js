// Main application entry point

class GolfScreensaver {
    constructor() {
        this.renderer = null;
        this.golfCourse = null;
        this.animationId = null;
        this.lastRender = 0;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Initialize canvas renderer
        this.renderer = new CanvasRenderer('golfCanvas');
        
        // Initialize golf course
        this.golfCourse = new GolfCourse(this.renderer);
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start the render loop
        this.startRenderLoop();
        
        // Initial render
        this.render();
        
        console.log('Golf Screensaver initialized successfully!');
    }    setupEventListeners() {
        // Keyboard shortcuts for screensaver functionality
        document.addEventListener('keydown', (event) => {
            switch(event.key) {
                case 'Escape':
                    this.toggleFullscreen();
                    break;
            }
        });

        // Auto-regenerate for screensaver effect
        this.autoRegenerate();
    }    render() {
        this.golfCourse.render();
    }startRenderLoop() {
        const renderFrame = (timestamp) => {
            // Always render for smooth animation
            this.render();
            this.animationId = requestAnimationFrame(renderFrame);
        };
        
        this.animationId = requestAnimationFrame(renderFrame);
    }

    stopRenderLoop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }    autoRegenerate() {
        // Generate a new hole every 30 seconds for dynamic screensaver viewing
        setInterval(() => {
            this.golfCourse.generateNewHole();
            console.log('🔄 Auto-generated new hole for screensaver');
        }, 30000); // 30 seconds = 30,000ms
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen().catch(err => {
                console.log('Error attempting to exit fullscreen:', err);
            });
        }
    }

    // Handle window visibility changes (pause when hidden)
    handleVisibilityChange() {
        if (document.hidden) {
            this.stopRenderLoop();
        } else {
            this.startRenderLoop();
        }
    }
}

// Handle page visibility
document.addEventListener('visibilitychange', () => {
    if (window.screensaver) {
        window.screensaver.handleVisibilityChange();
    }
});

// Initialize the screensaver when the page loads
window.screensaver = new GolfScreensaver();
