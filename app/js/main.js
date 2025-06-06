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
        // Regenerate button
        const regenerateBtn = document.getElementById('regenerateBtn');
        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', () => {
                this.generateNewHole();
            });
        }

        // Launch ball button
        const launchBallBtn = document.getElementById('launchBallBtn');
        if (launchBallBtn) {
            launchBallBtn.addEventListener('click', () => {
                this.launchBall();
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
                case 'b': // 'B' for ball
                case 'B':
                    this.launchBall();
                    break;
                case 'Escape':
                    this.toggleFullscreen();
                    break;
            }
        });

        // Auto-regenerate every 30 seconds for screensaver effect
        this.autoRegenerate();
    }    generateNewHole() {
        this.golfCourse.generateNewHole();
        this.updateHoleInfo();
        this.updateBallStatus();
        this.render();
    }

    launchBall() {
        if (this.golfCourse) {
            this.golfCourse.startBallAnimation();
            this.updateBallStatus();
            console.log('Ball launched manually');
        }
    }

    updateHoleInfo() {
        const holeInfo = document.getElementById('holeInfo');
        if (holeInfo && this.golfCourse) {
            holeInfo.textContent = this.golfCourse.getHoleInfo();
        }
    }    updateBallStatus() {
        const ballStatus = document.getElementById('ballStatus');
        if (ballStatus && this.golfCourse) {
            let isFlying = false;
            
            // Check if ball exists and is in a "flying" state based on actual physics
            if (this.golfCourse.golfBall && this.golfCourse.ballAnimation) {
                const ball = this.golfCourse.golfBall;
                const animation = this.golfCourse.ballAnimation;
                
                // Ball is "Flying" if:
                // 1. Ball is visible (z >= -2, same threshold as renderBall)
                // 2. Ball has significant motion (horizontal or vertical velocity)
                // 3. Ball is in the air (z > 0.1) OR has significant velocity
                
                const ballVisible = ball.z >= -2;
                const hasVelocity = animation.velocity && (
                    Math.abs(animation.velocity.x) > 1 || 
                    Math.abs(animation.velocity.y) > 1 || 
                    Math.abs(animation.velocity.z) > 1
                );
                const inAir = ball.z > 0.1;
                
                // Ball is flying if it's visible AND (in air OR moving significantly)
                isFlying = ballVisible && (inAir || hasVelocity);
                
                // Debug logging when status changes
                if (this.lastBallStatus !== `Ball: ${isFlying ? 'Flying' : 'Ready'}`) {
                    console.log(`🔄 Ball status: ${isFlying ? 'Flying' : 'Ready'}`);
                    console.log(`   Visible: ${ballVisible} (z: ${ball.z.toFixed(2)})`);
                    console.log(`   Has velocity: ${hasVelocity} (${animation.velocity ? `${animation.velocity.x.toFixed(1)}, ${animation.velocity.y.toFixed(1)}, ${animation.velocity.z.toFixed(1)}` : 'no velocity'})`);
                    console.log(`   In air: ${inAir}`);
                }
            }
            
            const statusText = `Ball: ${isFlying ? 'Flying' : 'Ready'}`;
            ballStatus.textContent = statusText;
            this.lastBallStatus = statusText;
        }
    }render() {
        this.golfCourse.render();
        this.updateBallStatus(); // Update ball status every frame
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
        // Generate a new hole every 2 minutes for contemplative viewing
        setInterval(() => {
            this.generateNewHole();
        }, 10000);
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
