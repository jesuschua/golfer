// Golf course generation and rendering

class GolfCourse {
    constructor(renderer) {
        this.renderer = renderer;
        this.holes = [];
        this.currentHole = null;
        this.golfBall = null;

        // Initialize subsystem classes
        this.courseGenerator = new CourseGenerator();
        this.animationManager = new AnimationManager();
        this.physicsEngine = new PhysicsEngine();
        this.courseRenderer = new CourseRenderer(renderer);

        this._lastUpdateTime = null;
        this.generateNewHole();
    }    generateNewHole() {
        // If there's an existing hole, start fade-out animation first
        if (this.currentHole && !this.animationManager.fadeOutAnimation.active) {
            this.animationManager.startFadeOutAnimation(this.currentHole, () => {
                // Callback executed when fade-out is complete
                this._generateNewHoleContent();
            });
            return; // Exit early, _generateNewHoleContent will be called via callback
        }
        
        // If no existing hole or fade-out already active, generate directly
        this._generateNewHoleContent();
    }_generateNewHoleContent() {
        // Clean up any existing elements
        this._cleanup();
        
        // Generate new hole using CourseGenerator
        this.currentHole = this.courseGenerator.generateNewHole();
        
        // Set terrain dimensions for centering in the renderer
        this.renderer.setTerrainDimensions(this.currentHole.width, this.currentHole.height);
        
        // Start animation sequence with proper callbacks
        this.animationManager.startTerrainAnimation(this.currentHole, () => {
            // Ball animation starts when element animation completes
            this.startBallAnimation();
        });
        this.animationManager.startSeagullAnimation(this.currentHole);
    }    _cleanup() {
        // Clean up any existing balls from the previous course
        if (this.golfBall) {
            this.golfBall = null;
        }

        // Stop active animations
        this.physicsEngine.stopBallAnimation();
        this.animationManager.stopSeagullAnimation();
        this.animationManager.clearFadeOutAnimation();
    }

    generateTeeArea(width, height) {
        // Tee area is usually at one end
        const side = randomInt(0, 3); // 0=top, 1=right, 2=bottom, 3=left
        let teeX, teeY;

        switch(side) {
            case 0: // top
                teeX = random(width * 0.3, width * 0.7);
                teeY = height * 0.9;
                break;
            case 1: // right
                teeX = width * 0.9;
                teeY = random(height * 0.3, height * 0.7);
                break;
            case 2: // bottom
                teeX = random(width * 0.3, width * 0.7);
                teeY = height * 0.1;
                break;
            case 3: // left
                teeX = width * 0.1;
                teeY = random(height * 0.3, height * 0.7);
                break;
        }

        return {
            x: teeX,
            y: teeY,
            radius: random(4, 8),
            elevation: random(2, 6)
        };
    }

    generateGreen(width, height) {
        // Green is usually opposite to tee
        const tee = this.currentHole.tee;
        let greenX, greenY;

        if (tee.x < width * 0.5) {
            greenX = random(width * 0.6, width * 0.9);
        } else {
            greenX = random(width * 0.1, width * 0.4);
        }

        if (tee.y < height * 0.5) {
            greenY = random(height * 0.6, height * 0.9);
        } else {
            greenY = random(height * 0.1, height * 0.4);
        }

        return {
            x: greenX,
            y: greenY,
            radius: random(8, 15),
            elevation: random(0, 3),
            pin: {
                x: greenX + random(-3, 3),
                y: greenY + random(-3, 3)
            }
        };
    }

    generateFairway() {
        const tee = this.currentHole.tee;
        const green = this.currentHole.green;
        
        // Create a curved fairway from tee to green
        const numSegments = 8;
        const fairway = [];

        for (let i = 0; i <= numSegments; i++) {
            const t = i / numSegments;
            
            // Add some curves to make it interesting
            const midpointX = (tee.x + green.x) / 2 + random(-20, 20);
            const midpointY = (tee.y + green.y) / 2 + random(-15, 15);
            
            const x = cubicBezier(t, tee.x, midpointX, midpointX, green.x);
            const y = cubicBezier(t, tee.y, midpointY, midpointY, green.y);
            
            // Vary the width along the fairway
            const width = lerp(12, 18, Math.sin(t * Math.PI) + random(-2, 2));
            
            fairway.push({
                x: x,
                y: y,
                width: width,
                elevation: random(-1, 2)
            });
        }

        this.currentHole.fairway = fairway;
    }

    generateHazards() {
        // Minimal hazards for serene aesthetic
        const numBunkers = randomInt(0, 2); // Fewer bunkers
        const numWater = random(0, 1) > 0.8 ? 1 : 0; // Very rare water

        // Generate sand bunkers
        for (let i = 0; i < numBunkers; i++) {
            this.currentHole.bunkers.push({
                x: random(20, this.currentHole.width - 20),
                y: random(20, this.currentHole.height - 20),
                radius: random(6, 10),
                depth: random(0.5, 1.5),
                shape: 0 // Always round for simplicity
            });
        }

        // Generate water hazards
        for (let i = 0; i < numWater; i++) {
            this.currentHole.water.push({
                x: random(25, this.currentHole.width - 25),
                y: random(25, this.currentHole.height - 25),
                radius: random(12, 18),
                depth: random(2, 4)
            });
        }
    }

    generateTrees() {
        // Minimal trees for clean, open aesthetic
        const numTrees = randomInt(2, 6); // Fewer trees
        
        for (let i = 0; i < numTrees; i++) {
            this.currentHole.trees.push({
                x: random(10, this.currentHole.width - 10),
                y: random(10, this.currentHole.height - 10),
                height: random(10, 16),
                radius: random(4, 7),
                type: 0 // Single tree type for consistency
            });
        }
    }    generateTerrain() {
        // Generate smoother, more gentle height variations
        this.heightMap = [];
        const resolution = 4; // Finer resolution for detailed terrain at higher zoom
        
        for (let x = 0; x <= this.currentHole.width; x += resolution) {
            this.heightMap[x] = {};
            for (let y = 0; y <= this.currentHole.height; y += resolution) {
                // Much gentler terrain variation
                this.heightMap[x][y] = smoothNoise(x, y, 0.02) * 1.5;
            }
        }    }startBallAnimation() {
        // Delegate ball animation creation to PhysicsEngine
        if (!this.currentHole) return;
          // Check if a ball is actually still flying
        if (this.physicsEngine.isBallFlying(this.golfBall, this.ballAnimation)) {
            return;
        }
        
        // Get playable targets from course
        const playableTargets = this.getPlayableTargets();
        if (playableTargets.length === 0) {
            return;
        }
        
        // Let PhysicsEngine create the ball animation with target selection
        const result = this.physicsEngine.createBallAnimationWithTargets(playableTargets, this.currentHole);
          if (result) {
            this.ballAnimation = result.animation;
            this.golfBall = result.ball;
        }
    }getPlayableTargets() {
        // Collect all actual terrain grid squares AND course features that the ball can land on
        const targets = [];
        
        // *** CRITICAL FIX: Add actual terrain grid squares (8x8 grid from renderTerrain) ***
        const gridSize = 8; // Must match the gridSize in renderTerrain()
        const hole = this.currentHole;
        
        // Add the center of each terrain grid square
        for (let x = gridSize/2; x < hole.width; x += gridSize) {
            for (let y = gridSize/2; y < hole.height; y += gridSize) {
                // Skip if too close to edges
                if (x >= 10 && x <= hole.width - 10 && y >= 10 && y <= hole.height - 10) {
                    targets.push({
                        x: x,
                        y: y,
                        type: `terrain-grid-${Math.floor(x/gridSize)}-${Math.floor(y/gridSize)}`
                    });
                }
            }
        }
        
        // Add the green (highest priority)
        targets.push({
            x: this.currentHole.green.x,
            y: this.currentHole.green.y,
            type: 'green'
        });
        
        // Add multiple points along the fairway
        this.currentHole.fairway.forEach((segment, index) => {
            targets.push({
                x: segment.x,
                y: segment.y,
                type: `fairway-${index + 1}`
            });
            
            // Add some variation around each fairway segment
            for (let i = 0; i < 2; i++) {
                const angle = random(0, Math.PI * 2);
                const distance = random(2, segment.width / 3);
                targets.push({
                    x: segment.x + Math.cos(angle) * distance,
                    y: segment.y + Math.sin(angle) * distance,
                    type: `fairway-${index + 1}-var`
                });
            }
        });
        
        // Add the tee area
        targets.push({
            x: this.currentHole.tee.x,
            y: this.currentHole.tee.y,
            type: 'tee'
        });
        
        // Add bunkers (if any)
        this.currentHole.bunkers.forEach((bunker, index) => {
            targets.push({
                x: bunker.x,
                y: bunker.y,
                type: `bunker-${index + 1}`
            });
        });
        
        // Add water hazards (if any)
        this.currentHole.water.forEach((water, index) => {
            targets.push({
                x: water.x,
                y: water.y,
                type: `water-${index + 1}`
            });
        });
        
        // Add some strategic rough areas around major features
        const strategic_rough = [];
        
        // Around the green
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const distance = this.currentHole.green.radius + random(5, 12);
            strategic_rough.push({
                x: this.currentHole.green.x + Math.cos(angle) * distance,
                y: this.currentHole.green.y + Math.sin(angle) * distance,
                type: 'rough-green'
            });
        }
        
        // Around the tee
        for (let i = 0; i < 2; i++) {
            const angle = random(0, Math.PI * 2);
            const distance = this.currentHole.tee.radius + random(8, 15);
            strategic_rough.push({
                x: this.currentHole.tee.x + Math.cos(angle) * distance,
                y: this.currentHole.tee.y + Math.sin(angle) * distance,
                type: 'rough-tee'
            });
        }
        
        targets.push(...strategic_rough);
        
        // Filter out any targets that are outside course bounds
        const validTargets = targets.filter(target => 
            target.x >= 5 && target.x <= hole.width - 5 &&
            target.y >= 5 && target.y <= hole.height - 5
        );
          // Count terrain grid squares vs other targets
        const terrainTargets = validTargets.filter(t => t.type.startsWith('terrain-grid'));
        const featureTargets = validTargets.filter(t => !t.type.startsWith('terrain-grid'));
          return validTargets;
    }    identifyHitFeature(x, y) {
        // Check what specific course feature the ball landed on
        const hole = this.currentHole;
        
        // First check if it's even on the course
        if (x < 0 || x > hole.width || y < 0 || y > hole.height) {
            return { type: 'off-course' };
        }        // Check hole first (highest priority - very small target)
        const distanceToHole = Math.sqrt((x - hole.green.pin.x) ** 2 + (y - hole.green.pin.y) ** 2);
        if (distanceToHole <= 0.5) { // Hole radius is very small (0.5 units)
            return { type: 'hole', distance: distanceToHole };
        }
        
        // Check green (second priority)
        const distanceToGreen = Math.sqrt((x - hole.green.x) ** 2 + (y - hole.green.y) ** 2);
        if (distanceToGreen <= hole.green.radius) {
            return { type: 'green' };
        }
        
        // Check tee area
        const distanceToTee = Math.sqrt((x - hole.tee.x) ** 2 + (y - hole.tee.y) ** 2);
        if (distanceToTee <= hole.tee.radius) {
            return { type: 'tee' };
        }
        
        // Check bunkers
        for (const bunker of hole.bunkers) {
            const distanceToBunker = Math.sqrt((x - bunker.x) ** 2 + (y - bunker.y) ** 2);
            if (distanceToBunker <= bunker.radius) {
                return { type: 'bunker' };
            }
        }
        
        // Check water hazards
        for (const water of hole.water) {
            const distanceToWater = Math.sqrt((x - water.x) ** 2 + (y - water.y) ** 2);
            if (distanceToWater <= water.radius) {
                return { type: 'water' };
            }
        }
        
        // Check fairway (line segments with width)
        for (const fairwaySegment of hole.fairway) {
            const distanceToFairway = Math.sqrt((x - fairwaySegment.x) ** 2 + (y - fairwaySegment.y) ** 2);
            if (distanceToFairway <= fairwaySegment.width / 2) {
                return { type: 'fairway' };
            }
        }
        
        // Check if it hit a terrain grid square (8x8 grid from renderTerrain)
        const gridSize = 8;
        const gridX = Math.floor(x / gridSize);
        const gridY = Math.floor(y / gridSize);
        
        // If within the terrain grid bounds, it hit a terrain square
        if (gridX >= 0 && gridX < Math.floor(hole.width / gridSize) && 
            gridY >= 0 && gridY < Math.floor(hole.height / gridSize)) {
            return { type: 'terrain-square', gridX: gridX, gridY: gridY };
        }
        
        // If not in any specific feature, it's rough
        return { type: 'rough' };
    }    updateBallAnimation() {
        // Delegate ball physics update to PhysicsEngine
        if (this.ballAnimation && this.golfBall) {
            const result = this.physicsEngine.updateBallPhysics(this.ballAnimation, this.golfBall, this.currentHole);
              // Handle special physics results if needed
            if (!result.shouldContinue && result.result) {
                // Physics result received
            }
        }
    }

    placeBallNearHole() {
        // Fallback method - create a golf ball positioned near the hole (static)
        const green = this.currentHole.green;
        const pin = green.pin;
        
        // Place ball near the hole but not in it
        const distance = random(2, 8); // 2-8 units from hole
        const angle = random(0, Math.PI * 2);
        
        this.golfBall = {
            x: pin.x + Math.cos(angle) * distance,
            y: pin.y + Math.sin(angle) * distance,
            z: 0, // On the ground
            radius: 0.8
        };
    }    render() {
        this.renderer.clear();
        
        if (!this.currentHole) return;

        // Update all animations through AnimationManager
        this.animationManager.updateAll();

        // Update ball physics through PhysicsEngine
        this.updateBallAnimation();

        // Render all elements through CourseRenderer with proper z-ordering
        this.courseRenderer.clearQueue();
          // Queue all render operations 
        this.courseRenderer.renderTerrain(this.currentHole, this.animationManager.terrainAnimation, this.courseGenerator);
        this.courseRenderer.renderWater(this.currentHole, this.animationManager);
        this.courseRenderer.renderFairway(this.currentHole, this.animationManager);
        this.courseRenderer.renderBunkers(this.currentHole, this.animationManager);
        this.courseRenderer.renderGreen(this.currentHole, this.animationManager);
        this.courseRenderer.renderTee(this.currentHole, this.animationManager);
        this.courseRenderer.renderTrees(this.currentHole, this.animationManager);
        this.courseRenderer.renderPin(this.currentHole, this.animationManager);        this.courseRenderer.renderBall(this.golfBall, this.ballAnimation, this.currentHole);
        this.courseRenderer.renderSeagulls(this.animationManager);
        
        // Execute all queued renders in z-order
        this.courseRenderer.executeQueue();
    }    getElevation(x, y) {
        const resolution = 4;
        const gridX = Math.floor(x / resolution) * resolution;
        const gridY = Math.floor(y / resolution) * resolution;
        
        if (this.heightMap[gridX] && this.heightMap[gridX][gridY] !== undefined) {
            return this.heightMap[gridX][gridY];
        }
        
        return 0;
    }    getHoleInfo() {
        if (!this.currentHole) return "No hole generated";
        
        const yardage = Math.floor(distance(
            this.currentHole.tee.x, 
            this.currentHole.tee.y,
            this.currentHole.green.x, 
            this.currentHole.green.y
        ) * 3); // Convert to approximate yards
          return `Par ${this.currentHole.par} - ${yardage} yards`;
    }
}
