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
    }

    setupEventListeners() {
        // Regenerate button
        const regenerateBtn = document.getElementById('regenerateBtn');
        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', () => {
                this.generateNewHole();
            });
        }

        // Canvas click for interaction
        this.renderer.canvas.addEventListener('click', () => {
            this.generateNewHole();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            switch(event.key) {
                case ' ': // Spacebar
                case 'Enter':
                    this.generateNewHole();
                    break;
                case 'Escape':
                    this.toggleFullscreen();
                    break;
            }
        });

        // Auto-regenerate every 30 seconds for screensaver effect
        this.autoRegenerate();
    }

    generateNewHole() {
        this.golfCourse.generateNewHole();
        this.updateHoleInfo();
        this.render();
    }

    updateHoleInfo() {
        const holeInfo = document.getElementById('holeInfo');
        if (holeInfo && this.golfCourse) {
            holeInfo.textContent = this.golfCourse.getHoleInfo();
        }
    }

    render() {
        this.golfCourse.render();
    }

    startRenderLoop() {
        const renderFrame = (timestamp) => {
            // Throttle to 60 FPS
            if (timestamp - this.lastRender >= 16.67) {
                this.render();
                this.lastRender = timestamp;
            }
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
        // Generate a new hole every 2 minutes for contemplative viewing
        setInterval(() => {
            this.generateNewHole();
        }, 120000);
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
