// Animation management and coordination

class AnimationManager {
    constructor() {
        this.animations = new Map();
        this._lastUpdateTime = null;
        
        // Initialize individual animation instances
        this.terrainAnimation = new TerrainAnimation();
        this.elementAnimation = new ElementAnimation();
        this.fadeOutAnimation = new FadeOutAnimation();
        this.seagullAnimation = {
            active: false,
            startTime: null,
            duration: 30000, // 30 seconds flight duration
            flock: [],
            flockSize: 1,
            formation: 'single',
            leadBird: null
        };
    }

    // Register an animation
    addAnimation(name, animation) {
        this.animations.set(name, animation);
    }

    // Remove an animation
    removeAnimation(name) {
        this.animations.delete(name);
    }

    // Get animation by name
    getAnimation(name) {
        return this.animations.get(name);
    }

    // Update all active animations
    updateAll() {
        const now = Date.now();
        
        this.updateTerrainAnimation(now);
        this.updateElementAnimation(now);
        this.updateFadeOutAnimation(now);
        this.updateSeagullAnimation(now);
        
        for (const [name, animation] of this.animations) {
            if (animation.active) {
                animation.update(now);
            }
        }
    }

    // Stop all animations
    stopAll() {
        this.terrainAnimation.stop();
        this.elementAnimation.stop();
        this.fadeOutAnimation.stop();
        this.stopSeagullAnimation();
        
        for (const [name, animation] of this.animations) {
            animation.stop();
        }
    }

    // Check if any animations are active
    hasActiveAnimations() {
        if (this.terrainAnimation.active || this.elementAnimation.active || 
            this.fadeOutAnimation.active || this.seagullAnimation.active) {
            return true;
        }
        
        for (const [name, animation] of this.animations) {
            if (animation.active) return true;
        }
        return false;
    }    // Terrain Animation Methods
    startTerrainAnimation(hole, onComplete = null) {
        console.log('🌍 Starting terrain tile flip animation...');
        console.log('📏 Hole dimensions:', hole.width, 'x', hole.height);
        this.terrainAnimation.start(() => {
            console.log('✅ Terrain animation completed - starting element slide animation');
            this.startElementAnimation(hole, onComplete);
        });
    }

    updateTerrainAnimation(currentTime) {
        this.terrainAnimation.update(currentTime);
    }

    // Element Animation Methods  
    startElementAnimation(hole, onComplete = null) {
        console.log('🌟 Starting element slide-from-above animation...');
        this.elementAnimation.start(hole, () => {
            console.log('✅ Element slide animation completed');
            if (onComplete) onComplete();
        });
    }

    updateElementAnimation(currentTime) {
        this.elementAnimation.update(currentTime);
    }

    // Fade-out Animation Methods
    startFadeOutAnimation(hole, onComplete = null) {
        console.log('🎭 Starting element fade-out animation...');
        this.fadeOutAnimation.start(hole, onComplete);
    }

    updateFadeOutAnimation(currentTime) {
        this.fadeOutAnimation.update(currentTime);
    }

    clearFadeOutAnimation() {
        this.fadeOutAnimation.stop();
    }

    // Helper methods for element visibility and positioning
    shouldRenderElement(elementKey) {
        // Prioritize fade-out animation if active
        if (this.fadeOutAnimation.active) {
            return this.fadeOutAnimation.shouldRenderElementDuringFadeOut(elementKey);
        }

        // If terrain animation is active, elements should be hidden
        if (this.terrainAnimation.active) return false;
        
        // Use element animation visibility logic
        return this.elementAnimation.shouldRenderElement(elementKey);
    }

    getElementSlideOffset(elementKey) {
        // Use fade-out offset if active
        if (this.fadeOutAnimation.active) {
            return this.fadeOutAnimation.getFadeOutSlideOffset(elementKey);
        }
        
        // Use element slide offset
        return this.elementAnimation.getElementSlideOffset(elementKey);
    }

    // Seagull Animation Methods
    startSeagullAnimation(hole) {
        if (!hole) return;
        
        console.log('🐦 Starting seagull flock animation...');
        
        this.seagullAnimation.active = true;
        this.seagullAnimation.startTime = Date.now();
        
        // Randomly determine flock size (1-7 birds)
        this.seagullAnimation.flockSize = Math.floor(Math.random() * 7) + 1;
        
        // Select formation based on flock size with realistic probabilities
        const flockSize = this.seagullAnimation.flockSize;
        if (flockSize === 1) {
            this.seagullAnimation.formation = 'single';
        } else if (flockSize <= 3) {
            // Small flocks: mostly line formation with some loose
            this.seagullAnimation.formation = Math.random() < 0.7 ? 'line' : 'loose';
        } else {
            // Larger flocks: mostly V-formation (80%) with some line and loose
            const rand = Math.random();
            if (rand < 0.8) {
                this.seagullAnimation.formation = 'v-formation';
            } else if (rand < 0.9) {
                this.seagullAnimation.formation = 'line';
            } else {
                this.seagullAnimation.formation = 'loose';
            }
        }
        
        console.log(`🐦 Created flock of ${this.seagullAnimation.flockSize} birds in ${this.seagullAnimation.formation} formation`);
        
        // Set flight path across the terrain
        const margin = 20; // Off-screen margin
        
        // Define flight patterns with better visibility balance
        const flightPatterns = [
            // Left-to-right horizontal flights
            {
                name: 'left-to-right-high',
                startX: -margin,
                endX: hole.width + margin,
                startY: hole.height * 0.35,
                endY: hole.height * 0.35 + Math.random() * (hole.height * 0.08)
            },
            {
                name: 'left-to-right-middle',
                startX: -margin,
                endX: hole.width + margin,
                startY: hole.height * 0.5,
                endY: hole.height * 0.5 + Math.random() * (hole.height * 0.08)
            },
            {
                name: 'left-to-right-low',
                startX: -margin,
                endX: hole.width + margin,
                startY: hole.height * 0.65,
                endY: hole.height * 0.65 + Math.random() * (hole.height * 0.08)
            },
            // Right-to-left horizontal flights
            {
                name: 'right-to-left-high',
                startX: hole.width + margin,
                endX: -margin,
                startY: hole.height * 0.35,
                endY: hole.height * 0.35 + Math.random() * (hole.height * 0.08)
            },
            {
                name: 'right-to-left-middle',
                startX: hole.width + margin,
                endX: -margin,
                startY: hole.height * 0.5,
                endY: hole.height * 0.5 + Math.random() * (hole.height * 0.08)
            },
            {
                name: 'right-to-left-low',
                startX: hole.width + margin,
                endX: -margin,
                startY: hole.height * 0.65,
                endY: hole.height * 0.65 + Math.random() * (hole.height * 0.08)
            }
        ];
        
        // Randomly select a flight pattern for the lead bird
        const selectedPattern = flightPatterns[Math.floor(Math.random() * flightPatterns.length)];
        
        // Create the flock
        this.seagullAnimation.flock = [];
        this.createFlock(selectedPattern);
        
        console.log(`🐦 Created flock of ${this.seagullAnimation.flockSize} birds in ${this.seagullAnimation.formation} formation: ${selectedPattern.name}`);
    }

    createFlock(leadPattern) {
        const flock = this.seagullAnimation.flock;
        const flockSize = this.seagullAnimation.flockSize;
        const formation = this.seagullAnimation.formation;
        
        // Create lead bird
        const leadBird = {
            id: 0,
            isLead: true,
            startX: leadPattern.startX,
            endX: leadPattern.endX,
            startY: leadPattern.startY,
            endY: leadPattern.endY,
            currentX: leadPattern.startX,
            currentY: leadPattern.startY,
            size: 2.5,
            wingOffset: 0
        };
        
        flock.push(leadBird);
        this.seagullAnimation.leadBird = leadBird;
        
        // Create formation positions for follower birds
        if (flockSize > 1) {
            this.createFormationPositions(leadPattern, formation, flockSize);
        }
    }

    createFormationPositions(leadPattern, formation, flockSize) {
        const flock = this.seagullAnimation.flock;
        
        for (let i = 1; i < flockSize; i++) {
            let offsetX = 0;
            let offsetY = 0;
            
            if (formation === 'v-formation') {
                // V-formation: birds arranged in a V behind the leader
                const side = i % 2 === 1 ? -1 : 1; // Alternate sides
                const rank = Math.ceil(i / 2); // How far back in the V
                offsetX = side * rank * 8;
                offsetY = rank * 6;
            } else if (formation === 'line') {
                // Line formation: birds in a diagonal line
                offsetX = i * 6;
                offsetY = i * 4;
            } else if (formation === 'loose') {
                // Loose formation: random positions around the leader
                offsetX = (Math.random() - 0.5) * 20;
                offsetY = Math.random() * 15 + 5;
            }
            
            const followerBird = {
                id: i,
                isLead: false,
                startX: leadPattern.startX + offsetX,
                endX: leadPattern.endX + offsetX,
                startY: leadPattern.startY + offsetY,
                endY: leadPattern.endY + offsetY,
                currentX: leadPattern.startX + offsetX,
                currentY: leadPattern.startY + offsetY,
                size: 2.0 + Math.random() * 0.8,
                wingOffset: Math.random() * Math.PI * 2
            };
            
            flock.push(followerBird);
        }
    }

    updateSeagullAnimation(currentTime) {
        if (!this.seagullAnimation.active) return;
        
        const elapsed = currentTime - this.seagullAnimation.startTime;
        const progress = elapsed / this.seagullAnimation.duration;
        
        // Update position for each bird in the flock
        this.seagullAnimation.flock.forEach(bird => {
            const totalDistanceX = bird.endX - bird.startX;
            const totalDistanceY = bird.endY - bird.startY;
            
            bird.currentX = bird.startX + (totalDistanceX * progress);
            bird.currentY = bird.startY + (totalDistanceY * progress);
        });
    }

    stopSeagullAnimation() {
        this.seagullAnimation.active = false;
        this.seagullAnimation.flock = [];
        this.seagullAnimation.leadBird = null;
    }

    // Getters for animation states
    get isTerrainAnimationActive() {
        return this.terrainAnimation.active;
    }

    get isElementAnimationActive() {
        return this.elementAnimation.active;
    }

    get isFadeOutAnimationActive() {
        return this.fadeOutAnimation.active;
    }

    get isSeagullAnimationActive() {
        return this.seagullAnimation.active;
    }

    // Get terrain tile flip progress
    getTileFlipProgress(tileX, tileY) {
        return this.terrainAnimation.getTileFlipProgress(tileX, tileY);
    }
}

// Base animation class
class BaseAnimation {
    constructor(duration = 1000) {
        this.active = false;
        this.startTime = null;
        this.duration = duration;
        this.onComplete = null;
    }

    start(onComplete = null) {
        this.active = true;
        this.startTime = Date.now();
        this.onComplete = onComplete;
    }

    stop() {
        this.active = false;
        this.startTime = null;
    }

    update(currentTime) {
        if (!this.active || !this.startTime) return;

        const elapsed = currentTime - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);

        this.onUpdate(progress, elapsed);

        if (progress >= 1) {
            this.active = false;
            if (this.onComplete) {
                this.onComplete();
            }
        }
    }

    // Override this method in subclasses
    onUpdate(progress, elapsed) {
        // Default implementation - do nothing
    }
}

// Terrain tile flip animation
class TerrainAnimation extends BaseAnimation {    constructor() {
        super(3000); // 3 seconds total duration for more dramatic effect
        this.individualFlipDuration = 800; // 0.8 seconds per tile
        this.tiles = new Map();
        this.gridSize = 8;
    }    start(onComplete = null) {
        super.start(onComplete);
        this.tiles.clear();
        console.log('🌍 TerrainAnimation.start() called - animation active:', this.active);
        console.log('⏱️ Animation duration:', this.duration, 'ms, tile duration:', this.individualFlipDuration, 'ms');
    }

    onUpdate(progress, elapsed) {
        // Animation logic handled when tiles are rendered
        // This just tracks the overall animation state
    }

    getTileFlipProgress(tileX, tileY) {
        const tileKey = `${tileX}-${tileY}`;
          if (!this.tiles.has(tileKey)) {
            // Generate random start time for this tile within the animation window
            const maxDelay = this.duration - this.individualFlipDuration;
            const tileStartTime = this.startTime + Math.random() * maxDelay;
            const rotationAxis = Math.random() > 0.5 ? 'x' : 'y'; // Random rotation axis
            this.tiles.set(tileKey, { 
                startTime: tileStartTime,
                rotationAxis: rotationAxis,
                clockwise: Math.random() > 0.5 // Random rotation direction
            });
        }
        
        const tileData = this.tiles.get(tileKey);
        const now = Date.now();
        const tileElapsed = now - tileData.startTime;
          if (tileElapsed < 0) return 0; // Not started yet
        if (tileElapsed >= this.individualFlipDuration) return 1; // Complete
        
        // Apply easing for more natural spinning motion
        const rawProgress = tileElapsed / this.individualFlipDuration;
        return this.easeInOutCubic(rawProgress);
    }
    
    // Smooth easing function for natural tile spinning
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
}

// Element slide-from-above animation
class ElementAnimation extends BaseAnimation {
    constructor() {
        super(1500); // 1.5 seconds total duration
        this.individualSlideDuration = 800;
        this.elements = new Map();
        this.slideDistance = 60;
    }

    start(hole, onComplete = null) {
        super.start(onComplete);
        this.elements.clear();
        
        console.log('🌟 Starting element slide-from-above animation...');
        
        // Register all course elements with staggered start times
        const elementTypes = [
            { type: 'green', x: hole.green.x, y: hole.green.y },
            { type: 'tee', x: hole.tee.x, y: hole.tee.y },
            { type: 'pin', x: hole.green.pin.x, y: hole.green.pin.y }
        ];
        
        // Add bunkers
        hole.bunkers.forEach((bunker, index) => {
            elementTypes.push({ type: `bunker-${index}`, x: bunker.x, y: bunker.y });
        });
        
        // Add water hazards
        hole.water.forEach((water, index) => {
            elementTypes.push({ type: `water-${index}`, x: water.x, y: water.y });
        });
        
        // Add trees
        hole.trees.forEach((tree, index) => {
            elementTypes.push({ type: `tree-${index}`, x: tree.x, y: tree.y });
        });
        
        // Add fairway segments
        hole.fairway.forEach((segment, index) => {
            elementTypes.push({ type: `fairway-${index}`, x: segment.x, y: segment.y });
        });
        
        // Assign staggered start times
        elementTypes.forEach(element => {
            const maxDelay = this.duration - this.individualSlideDuration;
            const elementStartTime = this.startTime + Math.random() * maxDelay;
            this.elements.set(element.type, { startTime: elementStartTime });
        });
    }

    shouldRenderElement(elementKey) {
        if (!this.active) return true;
        
        const elementData = this.elements.get(elementKey);
        if (!elementData) return true;
        
        return Date.now() >= elementData.startTime;
    }

    getElementSlideOffset(elementKey) {
        if (!this.active) return 0;
        
        const elementData = this.elements.get(elementKey);
        if (!elementData) return 0;
        
        const now = Date.now();
        const elementElapsed = now - elementData.startTime;
        
        if (elementElapsed < 0) return this.slideDistance;
        if (elementElapsed >= this.individualSlideDuration) return 0;
        
        const progress = elementElapsed / this.individualSlideDuration;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        return this.slideDistance * (1 - easeOut);
    }
}

// Fade-out animation (reverse of slide-in)
class FadeOutAnimation extends BaseAnimation {
    constructor() {
        super(1200); // 1.2 seconds total duration
        this.individualFadeDuration = 600;
        this.elements = new Map();
        this.slideDistance = 60;
    }

    start(hole, onComplete = null) {
        super.start(onComplete);
        this.elements.clear();
        
        console.log('🎭 Starting element fade-out animation...');
        
        // Register all current course elements
        const elementTypes = [
            { type: 'green', x: hole.green.x, y: hole.green.y },
            { type: 'tee', x: hole.tee.x, y: hole.tee.y },
            { type: 'pin', x: hole.green.pin.x, y: hole.green.pin.y }
        ];
        
        // Add bunkers
        hole.bunkers.forEach((bunker, index) => {
            elementTypes.push({ type: `bunker-${index}`, x: bunker.x, y: bunker.y });
        });
        
        // Add water hazards
        hole.water.forEach((water, index) => {
            elementTypes.push({ type: `water-${index}`, x: water.x, y: water.y });
        });
        
        // Add trees
        hole.trees.forEach((tree, index) => {
            elementTypes.push({ type: `tree-${index}`, x: tree.x, y: tree.y });
        });
        
        // Add fairway segments
        hole.fairway.forEach((segment, index) => {
            elementTypes.push({ type: `fairway-${index}`, x: segment.x, y: segment.y });
        });
        
        // Assign staggered start times
        elementTypes.forEach(element => {
            const maxDelay = this.duration - this.individualFadeDuration;
            const elementStartTime = this.startTime + Math.random() * maxDelay;
            this.elements.set(element.type, { startTime: elementStartTime });
        });
    }

    shouldRenderElementDuringFadeOut(elementKey) {
        if (!this.active) return false;
        
        const elementData = this.elements.get(elementKey);
        if (!elementData) return false;
        
        const now = Date.now();
        const elementElapsed = now - elementData.startTime;
        
        return elementElapsed < this.individualFadeDuration;
    }

    getFadeOutSlideOffset(elementKey) {
        if (!this.active) return 0;
        
        const elementData = this.elements.get(elementKey);
        if (!elementData) return 0;
        
        const now = Date.now();
        const elementElapsed = now - elementData.startTime;
        
        if (elementElapsed < 0) return 0;
        if (elementElapsed >= this.individualFadeDuration) return this.slideDistance;
        
        const progress = elementElapsed / this.individualFadeDuration;
        const easeIn = Math.pow(progress, 3);
        return this.slideDistance * easeIn;
    }
}
