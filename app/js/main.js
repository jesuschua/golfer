// Main application entry point

class GolfScreensaver {
    constructor() {
        this.renderer = null;
        this.golfCourse = null;
        this.animationId = null;
        this.lastRender = 0;
        this.wakeLock = null;
        this.isFullscreen = false;
        this.autoFullscreenEnabled = true; // Enable auto-fullscreen on load
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }    setup() {
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
        
        // Setup fullscreen hint and persistent message
        this.setupFullscreenHint();
        
        // Auto-enter fullscreen for screensaver experience
        if (this.autoFullscreenEnabled) {
            setTimeout(() => this.enterFullscreen(), 1000); // Delay to ensure page is ready
        }
        
        console.log('Golf Screensaver initialized successfully!');
    }    setupEventListeners() {
        // Keyboard shortcuts for screensaver functionality
        document.addEventListener('keydown', (event) => {
            switch(event.key) {
                case 'Escape':
                    this.toggleFullscreen();
                    break;
                case 'F11':
                    event.preventDefault(); // Prevent browser default F11 behavior
                    this.toggleFullscreen();
                    break;
            }
        });

        // Click anywhere to toggle fullscreen
        document.addEventListener('click', (event) => {
            // Only toggle if clicking on canvas or body (not on any UI elements)
            if (event.target.tagName === 'CANVAS' || event.target.tagName === 'BODY') {
                this.toggleFullscreen();
            }
        });

        // Handle fullscreen changes
        document.addEventListener('fullscreenchange', () => {
            this.handleFullscreenChange();
        });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Auto-regenerate for screensaver effect
        this.autoRegenerate();
    }render() {
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
    }    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
    }    async enterFullscreen() {
        try {
            await document.documentElement.requestFullscreen();
            console.log('✅ Entered fullscreen mode');
        } catch (err) {
            console.warn('⚠️ Error entering fullscreen:', err);
            // Try alternative fullscreen methods
            this.tryAlternativeFullscreen();
            
            // If fullscreen fails, ensure the persistent message is visible
            setTimeout(() => {
                const fullscreenMessage = document.getElementById('fullscreenMessage');
                if (fullscreenMessage && !document.fullscreenElement) {
                    fullscreenMessage.style.display = 'block';
                }
            }, 100);
        }
    }

    async exitFullscreen() {
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
                console.log('✅ Exited fullscreen mode');
            }
        } catch (err) {
            console.warn('⚠️ Error exiting fullscreen:', err);
        }
    }

    tryAlternativeFullscreen() {
        // Try webkit fullscreen (Safari)
        if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
        }
        // Try moz fullscreen (Firefox)
        else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        }
        // Try ms fullscreen (IE/Edge)
        else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        }
    }    handleFullscreenChange() {
        this.isFullscreen = !!document.fullscreenElement;
        
        // Handle persistent fullscreen message visibility
        const fullscreenMessage = document.getElementById('fullscreenMessage');
        if (fullscreenMessage) {
            if (this.isFullscreen) {
                fullscreenMessage.style.display = 'none';
            } else {
                fullscreenMessage.style.display = 'block';
            }
        }
        
        if (this.isFullscreen) {
            console.log('🖥️ Fullscreen activated - requesting wake lock');
            this.requestWakeLock();
        } else {
            console.log('🖥️ Fullscreen deactivated - releasing wake lock');
            this.releaseWakeLock();
        }
    }

    async requestWakeLock() {
        // Only request wake lock if we're in fullscreen mode
        if (!this.isFullscreen) return;

        try {
            // Check if Wake Lock API is supported
            if ('wakeLock' in navigator) {
                this.wakeLock = await navigator.wakeLock.request('screen');
                console.log('🔒 Wake lock activated - screen will stay on');
                
                // Handle wake lock release
                this.wakeLock.addEventListener('release', () => {
                    console.log('🔓 Wake lock released');
                    this.wakeLock = null;
                });
            } else {
                console.warn('⚠️ Wake Lock API not supported in this browser');
                this.fallbackSleepPrevention();
            }
        } catch (err) {
            console.warn('⚠️ Failed to request wake lock:', err);
            this.fallbackSleepPrevention();
        }
    }

    async releaseWakeLock() {
        if (this.wakeLock) {
            try {
                await this.wakeLock.release();
                this.wakeLock = null;
                console.log('🔓 Wake lock released manually');
            } catch (err) {
                console.warn('⚠️ Error releasing wake lock:', err);
            }
        }
        
        // Clear fallback prevention
        this.clearFallbackSleepPrevention();
    }

    fallbackSleepPrevention() {
        // Fallback method: periodic invisible video play
        // This is a less reliable method but works in older browsers
        if (!this.fallbackVideo) {
            this.fallbackVideo = document.createElement('video');
            this.fallbackVideo.setAttribute('muted', '');
            this.fallbackVideo.setAttribute('loop', '');
            this.fallbackVideo.style.display = 'none';
            this.fallbackVideo.style.position = 'fixed';
            this.fallbackVideo.style.top = '-1000px';
            document.body.appendChild(this.fallbackVideo);
            
            // Create a minimal video data URL
            this.fallbackVideo.src = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMQAAAAhmcmVlAAAAGW1kYXQAAAKuBgX//wrcRem95tlIt5Ys2CDZI';
        }
        
        // Play video periodically to prevent sleep
        this.fallbackInterval = setInterval(() => {
            if (this.isFullscreen && this.fallbackVideo) {
                this.fallbackVideo.play().catch(() => {
                    // Silent fail - some browsers block autoplay
                });
            }
        }, 30000); // Every 30 seconds
        
        console.log('🔄 Fallback sleep prevention activated');
    }

    clearFallbackSleepPrevention() {
        if (this.fallbackInterval) {
            clearInterval(this.fallbackInterval);
            this.fallbackInterval = null;
        }
        
        if (this.fallbackVideo) {
            this.fallbackVideo.pause();
            this.fallbackVideo.remove();
            this.fallbackVideo = null;
        }
        
        console.log('🔄 Fallback sleep prevention cleared');
    }    // Handle window visibility changes (pause when hidden)
    handleVisibilityChange() {
        if (document.hidden) {
            this.stopRenderLoop();
            // Release wake lock when page is hidden
            if (this.wakeLock) {
                this.releaseWakeLock();
            }
        } else {
            this.startRenderLoop();
            // Re-request wake lock if we're still in fullscreen
            if (this.isFullscreen) {
                this.requestWakeLock();
            }
        }
    }

    // Cleanup when page unloads
    cleanup() {
        this.stopRenderLoop();
        this.releaseWakeLock();
        this.clearFallbackSleepPrevention();
    }    setupFullscreenHint() {
        const hint = document.getElementById('fullscreenHint');
        if (hint) {
            // Show hint for 5 seconds, then fade out
            setTimeout(() => {
                hint.classList.add('fade-out');
                // Remove from DOM after fade completes
                setTimeout(() => {
                    if (hint.parentNode) {
                        hint.parentNode.removeChild(hint);
                    }
                }, 500);
            }, 5000);
        }
        
        // Setup persistent fullscreen message
        const fullscreenMessage = document.getElementById('fullscreenMessage');
        if (fullscreenMessage) {
            // Show the message initially if not in fullscreen
            if (!this.isFullscreen) {
                fullscreenMessage.style.display = 'block';
            } else {
                fullscreenMessage.style.display = 'none';
            }
        }
    }
}

// Handle page visibility
document.addEventListener('visibilitychange', () => {
    if (window.screensaver) {
        window.screensaver.handleVisibilityChange();
    }
});

// Handle page unload - cleanup resources
window.addEventListener('beforeunload', () => {
    if (window.screensaver) {
        window.screensaver.cleanup();
    }
});

// Initialize the screensaver when the page loads
window.screensaver = new GolfScreensaver();
