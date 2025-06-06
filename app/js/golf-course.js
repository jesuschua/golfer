// Golf course generation and rendering

class GolfCourse {    constructor(renderer) {
        this.renderer = renderer;
        this.holes = [];
        this.currentHole = null;
        this.golfBall = null;        this.ballAnimation = {
            active: false,
            startTime: null,
            duration: 15000, // 15 seconds max duration
            bounces: 0,
            maxBounces: 8, // More realistic max bounce count for golf ball
            bounceDecay: 0.65, // More realistic bounce decay (golf balls lose more energy)
            gravity: 20, // Higher gravity for faster descent
            spin: 0,
            spinRate: 0,
            lastGroundTime: 0,
            restTime: null // Track when ball comes to rest for disappearing
        };
        this._lastUpdateTime = null;
        this.generateNewHole();
    }    generateNewHole() {
        // Define the playable area - doubled in size for more expansive courses
        const width = 160;
        const height = 120;
        
        // Set terrain dimensions for centering in the renderer
        this.renderer.setTerrainDimensions(width, height);
        
        // Generate hole characteristics
        const par = randomInt(3, 5);
        const difficulty = random(0.3, 0.8);
        
        this.currentHole = {
            par: par,
            difficulty: difficulty,
            width: width,
            height: height,
            tee: null,
            green: null,
            fairway: [],
            rough: [],
            bunkers: [],
            water: [],
            trees: []
        };

        // Generate tee first, then green based on tee position
        this.currentHole.tee = this.generateTeeArea(width, height);
        this.currentHole.green = this.generateGreen(width, height);
        this.generateFairway();
        this.generateHazards();
        this.generateTrees();        this.generateTerrain();
        
        // Start golf ball animation
        this.startBallAnimation();
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
    }

    generateTerrain() {
        // Generate smoother, more gentle height variations
        this.heightMap = [];
        const resolution = 4; // Finer resolution for detailed terrain at higher zoom
        
        for (let x = 0; x <= this.currentHole.width; x += resolution) {
            this.heightMap[x] = {};
            for (let y = 0; y <= this.currentHole.height; y += resolution) {
                // Much gentler terrain variation
                this.heightMap[x][y] = smoothNoise(x, y, 0.02) * 1.5;
            }
        }
    }    startBallAnimation() {
        // Check if a ball is actually still flying using physics-based logic
        let ballCurrentlyFlying = false;
        if (this.golfBall && this.ballAnimation && this.ballAnimation.velocity) {
            const ball = this.golfBall;
            const animation = this.ballAnimation;
            
            const ballVisible = ball.z >= -2;
            const hasVelocity = (
                Math.abs(animation.velocity.x) > 1 || 
                Math.abs(animation.velocity.y) > 1 || 
                Math.abs(animation.velocity.z) > 1
            );
            const inAir = ball.z > 0.1;
            
            ballCurrentlyFlying = ballVisible && (inAir || hasVelocity);
        }
        
        // Don't start a new animation if a ball is actually still flying
        if (ballCurrentlyFlying) {
            console.log('🚫 Ball is still flying (physics-based check), skipping new animation');
            return;
        } else if (this.ballAnimation && this.ballAnimation.active) {
            console.log('🔄 Overriding stuck animation.active flag - ball is not actually flying');
        }// Collect all actual playable targets from course features AND terrain grid
        const playableTargets = this.getPlayableTargets();
        
        // Add weighting to make some features more likely targets
        const weightedTargets = [];
        playableTargets.forEach(target => {
            let weight = 1;
            
            // Make green and fairway more likely targets
            if (target.type === 'green') weight = 8; // Green is most likely
            else if (target.type.startsWith('fairway')) weight = 5; // Fairway is second most likely
            else if (target.type === 'tee') weight = 2; // Tee is less likely but still possible
            else if (target.type.startsWith('rough')) weight = 3; // Rough areas are moderately likely
            else if (target.type.startsWith('bunker')) weight = 1; // Bunkers are least likely
            else if (target.type.startsWith('water')) weight = 1; // Water is least likely
            else if (target.type.startsWith('terrain-grid')) weight = 4; // Terrain grid squares are common targets
            
            // Add the target multiple times based on weight
            for (let i = 0; i < weight; i++) {
                weightedTargets.push(target);
            }
        });
          // Pick a random target from weighted course features and terrain
        const targetFeature = weightedTargets[randomInt(0, weightedTargets.length - 1)];
        const finalX = targetFeature.x;
        const finalY = targetFeature.y;
        
        // Calculate starting position - ALWAYS from outside terrain, moving toward hole
        const hole = this.currentHole;
        const pin = hole.green.pin;
        
        // Calculate direction from pin to target (this will be roughly the trajectory direction)
        const pinToTargetAngle = Math.atan2(finalY - pin.y, finalX - pin.x);
        
        // Start from outside terrain, opposite to the pin-to-target direction
        // This makes the ball come from "behind" the target, moving toward the pin area
        const startAngle = pinToTargetAngle + Math.PI + random(-0.3, 0.3); // Some randomness
        
        // Calculate starting position outside terrain boundaries
        const terrainCenterX = hole.width / 2;
        const terrainCenterY = hole.height / 2;
        const maxTerrainRadius = Math.sqrt(hole.width * hole.width + hole.height * hole.height) / 2;
        const startDistance = maxTerrainRadius + random(20, 40); // Start well outside terrain
        
        const startX = terrainCenterX + Math.cos(startAngle) * startDistance;
        const startY = terrainCenterY + Math.sin(startAngle) * startDistance;console.log(`🎯 Ball targeted to ${targetFeature.type} at (${finalX.toFixed(1)}, ${finalY.toFixed(1)}) - Coming from direction toward hole at (${pin.x.toFixed(1)}, ${pin.y.toFixed(1)})`);        console.log(`📊 Target distribution: Green hits likely, fairway hits common, terrain grid squares common, other features possible`);

        // Calculate random starting height for variety
        const startHeight = random(6, 50);        this.ballAnimation = {
            active: true,
            startTime: Date.now(),
            duration: 15000, // 15 seconds max (but physics can end it sooner)
            startPos: { x: startX, y: startY, z: startHeight },
            endPos: { x: finalX, y: finalY, z: 0 }, // End on the ground
            currentPos: { x: startX, y: startY, z: startHeight },
            velocity: { x: 0, y: 0, z: 0 }, // Will be calculated
            bounces: 0,
            maxBounces: 8, // Realistic max bounce count for golf ball  
            bounceDecay: 0.65, // Realistic bounce energy loss (35% energy lost per bounce)
            gravity: 20, // Higher gravity for faster descent
            spin: random(0, Math.PI * 2), // Initial random spin
            spinRate: 0, // Spin rate will be based on velocity            lastGroundTime: 0, // Track when the ball last hit the ground
            hitGreen: false, // Track if the ball has hit the green
            outOfBounds: false, // Track if ball has left the terrain
            restTime: null, // Track when ball comes to rest for disappearing
            isRolling: false, // Track if ball is in rolling mode (no more bouncing)
            isDisappearing: false // Track if ball is in disappearing mode (falling through ground)
        };// Calculate initial velocity for realistic trajectory with randomness
        const flightTime = 2.0; // Time for initial flight
        const xDistance = finalX - startX;
        const yDistance = finalY - startY;
        const distance = Math.sqrt(xDistance * xDistance + yDistance * yDistance);
        
        // Add randomness to speed (±30% variation)
        const baseSpeed = 20;
        const speedVariation = random(2, 2.7);
        const speed = baseSpeed * speedVariation;
        
        // Add randomness to direction (±15 degree variation)
        const baseAngle = Math.atan2(yDistance, xDistance);
        const angleVariation = random(-Math.PI/12, Math.PI/12); // ±15 degrees
        const finalAngle = baseAngle + angleVariation;
        
        const directionX = Math.cos(finalAngle);
        const directionY = Math.sin(finalAngle);
        
        this.ballAnimation.velocity.x = directionX * speed;
        this.ballAnimation.velocity.y = directionY * speed;
        
        // Add randomness to vertical velocity (different trajectory arcs)
        const baseVerticalVelocity = 2;
        const verticalVariation = random(0.5, 5.0); // 0.5 to 2.0 range
        this.ballAnimation.velocity.z = baseVerticalVelocity * verticalVariation;        // Initialize the ball at starting position with random height variation
        this.golfBall = {
            x: startX,
            y: startY,
            z: startHeight,
            radius: 0.2  // Reduced from 0.8 to make it smaller
        };
        
        console.log('Ball animation started with randomness:');
        console.log(`  Speed variation: ${speedVariation.toFixed(2)}x (${speed.toFixed(1)} units/sec)`);
        console.log(`  Direction variation: ${(angleVariation * 180/Math.PI).toFixed(1)} degrees`);
        console.log(`  Vertical velocity: ${(baseVerticalVelocity * verticalVariation).toFixed(1)} units/sec`);
        console.log(`  Starting height: ${startHeight.toFixed(1)} units`);
        console.log(`  Final velocity: (${this.ballAnimation.velocity.x.toFixed(2)}, ${this.ballAnimation.velocity.y.toFixed(2)}, ${this.ballAnimation.velocity.z.toFixed(2)})`);
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
        
        console.log(`🎯 Generated ${validTargets.length} total targets: ${terrainTargets.length} terrain squares + ${featureTargets.length} course features`);
        console.log('Target types:', validTargets.map(t => t.type.split('-')[0]).reduce((acc, type) => {
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {}));
          return validTargets;
    }    identifyHitFeature(x, y) {
        // Check what specific course feature the ball landed on
        const hole = this.currentHole;
        
        // First check if it's even on the course
        if (x < 0 || x > hole.width || y < 0 || y > hole.height) {
            return { type: 'off-course' };
        }
        
        // Check green (highest priority)
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
    }updateBallAnimation() {
        if (!this.ballAnimation.active) return;
        
        const now = Date.now();
        const elapsed = now - this.ballAnimation.startTime;
          // Use actual time since last frame for smooth animation
        const deltaTime = Math.min(30, now - (this._lastUpdateTime || now)) / 1000;
        this._lastUpdateTime = now;
        
        // Apply gravity to Z velocity ONLY if not in rolling mode
        if (!this.ballAnimation.isRolling) {
            this.ballAnimation.velocity.z -= this.ballAnimation.gravity * deltaTime;
        }
          // Update position based on velocity (maintaining momentum)
        this.golfBall.x += this.ballAnimation.velocity.x * deltaTime;
        this.golfBall.y += this.ballAnimation.velocity.y * deltaTime;
        this.golfBall.z += this.ballAnimation.velocity.z * deltaTime;        // Keep ball at ground level when rolling (but not when disappearing)
        if (this.ballAnimation.isRolling && !this.ballAnimation.isDisappearing) {
            this.golfBall.z = 0;
            
            // Apply rolling friction continuously when in rolling mode
            const rollingFriction = 0.92; // Stronger friction for realistic stopping
            this.ballAnimation.velocity.x *= rollingFriction;
            this.ballAnimation.velocity.y *= rollingFriction;
        }
        
        // Calculate ball speed for spin effects
        const speed = Math.sqrt(
            this.ballAnimation.velocity.x ** 2 + 
            this.ballAnimation.velocity.y ** 2 +
            this.ballAnimation.velocity.z ** 2
        );
          // Update spin based on speed
        this.ballAnimation.spinRate = speed * 0.1;
        this.ballAnimation.spin += this.ballAnimation.spinRate * deltaTime;
        
        // Check for rolling ball stopping condition (continuous check)
        if (this.ballAnimation.isRolling) {
            const horizontalSpeed = Math.sqrt(
                this.ballAnimation.velocity.x ** 2 + 
                this.ballAnimation.velocity.y ** 2
            );
            
            if (horizontalSpeed < 1) { // Lower threshold for stopping
                // Ball has come to rest - start disappearing countdown
                if (!this.ballAnimation.restTime) {
                    this.ballAnimation.restTime = now;
                    console.log('🛑 Ball came to rest - starting disappear countdown at position:', {
                        x: this.golfBall.x.toFixed(2),
                        y: this.golfBall.y.toFixed(2),
                        z: this.golfBall.z.toFixed(2),
                        speed: horizontalSpeed.toFixed(3)
                    });
                }
                  // Check if ball has been at rest long enough to disappear
                const restDuration = now - this.ballAnimation.restTime;
                const disappearDelay = 2000; // Ball disappears after 2 seconds at rest
                  if (restDuration >= disappearDelay) {
                    // Start fade-out animation - ball just becomes invisible at rest position
                    this.ballAnimation.isDisappearing = true; // Mark as disappearing
                    this.ballAnimation.active = false; // Stop the animation immediately
                    console.log('👻 Ball fading away - animation complete at rest position');
                    console.log(`   Final ball position: (${this.golfBall.x.toFixed(1)}, ${this.golfBall.y.toFixed(1)}, ${this.golfBall.z.toFixed(1)})`);
                    return; // Exit update loop immediately
                }
            } else {
                // Ball is moving again, reset rest timer
                this.ballAnimation.restTime = null;
            }        }// Check for ground collision (bounce) - but only if ball is still on terrain AND not disappearing
        if (this.golfBall.z <= 0 && this.ballAnimation.velocity.z < 0 && !this.ballAnimation.isDisappearing) {
            // First check if we're still on the terrain
            const hole = this.currentHole;
            const onTerrain = (
                this.golfBall.x >= 0 && 
                this.golfBall.x <= hole.width && 
                this.golfBall.y >= 0 && 
                this.golfBall.y <= hole.height
            );
            
            if (!onTerrain) {
                // Ball hit ground level but is off the terrain - let it continue falling naturally
                // Don't bounce, just keep falling with gravity
                console.log(`🚫 Ball passed ground level outside terrain at (${this.golfBall.x.toFixed(1)}, ${this.golfBall.y.toFixed(1)}) - continuing to fall...`);
                // Don't set z to 0, let it continue falling below ground level
                // IMPORTANT: Don't return here - continue with rest of animation logic
            } else {
                // Record the time of ground impact
                this.ballAnimation.lastGroundTime = now;
                
                this.golfBall.z = 0; // Ensure ball doesn't go below ground when on terrain
                
                // Check what specific course feature the ball hit
                const hitFeature = this.identifyHitFeature(this.golfBall.x, this.golfBall.y);
                
                if (hitFeature.type !== 'off-course') {
                    if (hitFeature.type === 'green') {
                        const distanceToPin = Math.sqrt(
                            (this.golfBall.x - this.currentHole.green.pin.x) ** 2 + 
                            (this.golfBall.y - this.currentHole.green.pin.y) ** 2
                        );
                        console.log(`🏌️ EXCELLENT! Ball landed on GREEN! Distance from pin: ${distanceToPin.toFixed(1)} units`);
                        this.ballAnimation.hitGreen = true; // Special green effect
                    } else if (hitFeature.type === 'fairway') {
                        console.log(`⛳ GOOD! Ball landed on FAIRWAY at (${this.golfBall.x.toFixed(1)}, ${this.golfBall.y.toFixed(1)})`);
                        this.ballAnimation.hitGreen = false;
                    } else if (hitFeature.type === 'tee') {
                        console.log(`🏌️ Ball landed on TEE area at (${this.golfBall.x.toFixed(1)}, ${this.golfBall.y.toFixed(1)})`);
                        this.ballAnimation.hitGreen = false;
                    } else if (hitFeature.type === 'bunker') {
                        console.log(`🏖️ Ball landed in BUNKER at (${this.golfBall.x.toFixed(1)}, ${this.golfBall.y.toFixed(1)})`);
                        this.ballAnimation.hitGreen = false;
                    } else if (hitFeature.type === 'water') {
                        console.log(`💧 SPLASH! Ball landed in WATER at (${this.golfBall.x.toFixed(1)}, ${this.golfBall.y.toFixed(1)})`);
                        this.ballAnimation.hitGreen = false;
                    } else if (hitFeature.type === 'terrain-square') {
                        console.log(`🌱 PERFECT! Ball landed on TERRAIN SQUARE [${hitFeature.gridX},${hitFeature.gridY}] at (${this.golfBall.x.toFixed(1)}, ${this.golfBall.y.toFixed(1)})`);
                        this.ballAnimation.hitGreen = false;
                    } else {
                        console.log(`🌿 Ball landed in ROUGH at (${this.golfBall.x.toFixed(1)}, ${this.golfBall.y.toFixed(1)})`);
                        this.ballAnimation.hitGreen = false;
                    }
                } else {
                    console.log(`💨 Ball landed OFF-COURSE at (${this.golfBall.x.toFixed(1)}, ${this.golfBall.y.toFixed(1)})`);
                    this.ballAnimation.hitGreen = false;
                }                // Bouncing logic - only bounce when ball is on terrain
                if (Math.abs(this.ballAnimation.velocity.z) > 2 && this.ballAnimation.bounces < this.ballAnimation.maxBounces) {
                    // Realistic bounce with energy loss like a real golf ball
                    this.ballAnimation.velocity.z = -this.ballAnimation.velocity.z * this.ballAnimation.bounceDecay;
                    
                    // Apply realistic friction and energy loss to horizontal velocity each bounce
                    // Real golf balls lose significant momentum with each bounce
                    const bounceEnergyLoss = 0.75; // Lose 25% of horizontal energy per bounce
                    this.ballAnimation.velocity.x *= bounceEnergyLoss;
                    this.ballAnimation.velocity.y *= bounceEnergyLoss;
                    
                    this.ballAnimation.bounces++;
                    
                    // Add randomness to the bounce based on speed, but reduce with each bounce
                    const bounceRandomness = Math.min(3, speed * 0.02) * (1 - this.ballAnimation.bounces * 0.2);
                    this.ballAnimation.velocity.x += random(-bounceRandomness, bounceRandomness);
                    this.ballAnimation.velocity.y += random(-bounceRandomness, bounceRandomness);
                    
                    // Calculate total velocity for logging
                    const totalVelocity = Math.sqrt(
                        this.ballAnimation.velocity.x ** 2 + 
                        this.ballAnimation.velocity.y ** 2 + 
                        this.ballAnimation.velocity.z ** 2
                    );
                    
                    console.log(`⚽ Bounce ${this.ballAnimation.bounces}: velocity = (${this.ballAnimation.velocity.x.toFixed(2)}, ${this.ballAnimation.velocity.y.toFixed(2)}, ${this.ballAnimation.velocity.z.toFixed(2)}) | Total speed: ${totalVelocity.toFixed(2)}`);                } else {
                    // Ball has stopped bouncing - transition to rolling mode
                    console.log('🎱 Ball transition to rolling mode - eliminating all vertical movement and gravity');
                    this.ballAnimation.velocity.z = 0; // Completely stop vertical movement
                    this.ballAnimation.isRolling = true; // Disable gravity and bouncing
                }
            }
        }
          // Check if ball is outside the terrain boundaries - let it fall naturally
        const terrain = this.currentHole;
        const isOutOfBounds = (
            this.golfBall.x < 0 || 
            this.golfBall.x > terrain.width || 
            this.golfBall.y < 0 || 
            this.golfBall.y > terrain.height
        );if (isOutOfBounds) {
            // Ball has left the rendered terrain - but let it continue falling with gravity
            // Don't stop the animation, just log that it's out of bounds
            if (!this.ballAnimation.outOfBounds) {
                this.ballAnimation.outOfBounds = true;
                console.log(`⚠️ BALL OUT OF BOUNDS! Left the terrain at (${this.golfBall.x.toFixed(1)}, ${this.golfBall.y.toFixed(1)})`);
                console.log(`🌬️ Ball continues falling with gravity off the edge of the course...`);
            }
        } else {
            // Reset out of bounds flag if ball somehow comes back onto terrain
            this.ballAnimation.outOfBounds = false;
        }        // Stop the ball animation once it becomes invisible (same logic as renderBall)
        if (this.golfBall.z < -2) { // Ball has fallen too far to be visible
            this.ballAnimation.active = false;
            console.log(`👻 ANIMATION STOPPED - Ball invisible (z: ${this.golfBall.z.toFixed(2)})`);
            console.log(`   Ball position: (${this.golfBall.x.toFixed(2)}, ${this.golfBall.y.toFixed(2)}, ${this.golfBall.z.toFixed(2)})`);
            console.log(`   Animation was active: true → false`);
            console.log(`   Ball status should change: 'Flying' → 'Ready'`);
            return;
        }
        
        // Additional safety check: If ball is very far from course and falling, stop eventually
        if (isOutOfBounds && elapsed > 15000) { // 8 seconds max for out-of-bounds falling
            this.ballAnimation.active = false;
            console.log(`⏰ Ball animation timed out while falling out of bounds`);
            return;
        }
        
        // Force stop after maximum duration to prevent runaway animations
        if (elapsed > this.ballAnimation.duration) {
            this.ballAnimation.active = false;
            console.log('Ball animation stopped - maximum duration reached');
        }
        
        // Update animation position tracking
        this.ballAnimation.currentPos.x = this.golfBall.x;
        this.ballAnimation.currentPos.y = this.golfBall.y;
        this.ballAnimation.currentPos.z = this.golfBall.z;
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

        // Update ball animation if active
        this.updateBallAnimation();

        // Render in order: terrain, water, fairway, rough, bunkers, green, tee, trees, ball
        this.renderTerrain();
        this.renderWater();
        this.renderFairway();
        this.renderBunkers();
        this.renderGreen();
        this.renderTee();
        this.renderTrees();
        this.renderPin();
        this.renderBall();
    }

    renderTerrain() {
        // Render smooth, consistent terrain
        const hole = this.currentHole;
        const gridSize = 8; // Smaller grid for more detail at higher zoom
        
        for (let x = 0; x < hole.width; x += gridSize) {
            for (let y = 0; y < hole.height; y += gridSize) {
                const elevation = this.getElevation(x, y);
                
                const points = [
                    { x: x, y: y, z: elevation },
                    { x: x + gridSize, y: y, z: this.getElevation(x + gridSize, y) },
                    { x: x + gridSize, y: y + gridSize, z: this.getElevation(x + gridSize, y + gridSize) },
                    { x: x, y: y + gridSize, z: this.getElevation(x, y + gridSize) }
                ];

                // Use consistent base green color
                const grassColor = getBaseGreen();
                this.renderer.drawPolygon(points, grassColor, null, 0);
            }
        }
    }

    renderFairway() {
        const fairway = this.currentHole.fairway;
        
        for (let i = 0; i < fairway.length - 1; i++) {
            const current = fairway[i];
            const next = fairway[i + 1];
            
            // Create fairway segment
            const angle = Math.atan2(next.y - current.y, next.x - current.x);
            const perpAngle = angle + Math.PI / 2;
            
            const points = [
                { 
                    x: current.x + Math.cos(perpAngle) * current.width / 2, 
                    y: current.y + Math.sin(perpAngle) * current.width / 2,
                    z: current.elevation
                },
                { 
                    x: current.x - Math.cos(perpAngle) * current.width / 2, 
                    y: current.y - Math.sin(perpAngle) * current.width / 2,
                    z: current.elevation
                },
                { 
                    x: next.x - Math.cos(perpAngle) * next.width / 2, 
                    y: next.y - Math.sin(perpAngle) * next.width / 2,
                    z: next.elevation
                },
                { 
                    x: next.x + Math.cos(perpAngle) * next.width / 2, 
                    y: next.y + Math.sin(perpAngle) * next.width / 2,
                    z: next.elevation
                }
            ];

            this.renderer.drawPolygon(points, getFairwayGreen(), null, 0);
        }
    }    renderGreen() {
        const green = this.currentHole.green;
        this.renderer.drawCircle(
            green.x, 
            green.y, 
            green.radius, 
            getGreenColor(),
            null, 
            0
        );
    }

    renderTee() {
        const tee = this.currentHole.tee;
        this.renderer.drawCircle(
            tee.x, 
            tee.y, 
            tee.radius, 
            '#a0a080',
            null, 
            0
        );
    }

    renderBunkers() {
        this.currentHole.bunkers.forEach(bunker => {
            this.renderer.drawCircle(
                bunker.x, 
                bunker.y, 
                bunker.radius, 
                getSandColor(),
                null, 
                0
            );
        });
    }

    renderWater() {
        this.currentHole.water.forEach(water => {
            this.renderer.drawCircle(
                water.x, 
                water.y, 
                water.radius, 
                getWaterColor(),
                null, 
                0
            );
        });
    }

    renderTrees() {
        this.currentHole.trees.forEach(tree => {
            // Draw tree trunk
            this.renderer.drawCircle(
                tree.x, 
                tree.y, 
                1, 
                '#8b7355',
                null,
                0
            );
            
            // Draw tree canopy
            this.renderer.drawCircle(
                tree.x, 
                tree.y - tree.height * 0.3, 
                tree.radius, 
                getTreeColor(),
                null, 
                0
            );
        });
    }    renderPin() {
        const pin = this.currentHole.green.pin;
        const pinHeight = 8;
        
        // Pin pole
        const poleStart = this.renderer.transformPoint(pin.x, pin.y, 0);
        const poleEnd = this.renderer.transformPoint(pin.x, pin.y, pinHeight);
        
        this.renderer.ctx.save();
        this.renderer.ctx.strokeStyle = '#d4b896';
        this.renderer.ctx.lineWidth = 2;
        this.renderer.ctx.beginPath();
        this.renderer.ctx.moveTo(poleStart.x, poleStart.y);
        this.renderer.ctx.lineTo(poleEnd.x, poleEnd.y);
        this.renderer.ctx.stroke();
        
        // Animated flag with gentle flutter
        const currentTime = Date.now();
        const flutter1 = Math.sin(currentTime * 0.003) * 1.5; // Primary flutter wave
        const flutter2 = Math.sin(currentTime * 0.005 + 1) * 0.8; // Secondary wave for complexity
        const totalFlutter = flutter1 + flutter2;
        
        this.renderer.ctx.fillStyle = '#FF7F00'; // Bright orange flag
        
        // Create a path for the waving flag instead of a simple rectangle
        this.renderer.ctx.beginPath();
        this.renderer.ctx.moveTo(poleEnd.x, poleEnd.y - 2);
        this.renderer.ctx.lineTo(poleEnd.x + 8 + totalFlutter * 0.3, poleEnd.y - 2 + totalFlutter * 0.2);
        this.renderer.ctx.lineTo(poleEnd.x + 8 + totalFlutter * 0.5, poleEnd.y + 2 + totalFlutter * 0.3);
        this.renderer.ctx.lineTo(poleEnd.x, poleEnd.y + 2);
        this.renderer.ctx.closePath();
        this.renderer.ctx.fill();
        
        this.renderer.ctx.restore();
    }renderBall() {
        if (!this.golfBall) return;
        
        const ball = this.golfBall;
        const hole = this.currentHole;
        
        // Don't render ball if it's out of bounds and has fallen below visible area
        const isOutOfBounds = (
            ball.x < 0 || 
            ball.x > hole.width || 
            ball.y < 0 || 
            ball.y > hole.height
        );
        
        // Don't render if ball has fallen well below the terrain
        if (ball.z < -5) {
            return; // Ball has fallen into the void, don't render it
        }
        
        // Don't render if ball is out of bounds and animation is marked as such
        if (isOutOfBounds && this.ballAnimation && this.ballAnimation.outOfBounds) {
            // Only render if ball is still close to ground level (visible falling)
            if (ball.z < -2) {
                return; // Ball has fallen too far to be visible
            }
        }
        
        // Draw shadow on the ground when ball is in the air
        if (ball.z > 0.1) {
            const shadowRadius = ball.radius * (1 + ball.z * 0.03); // Shadow gets bigger with height
            const shadowAlpha = Math.max(0.1, 0.4 - ball.z * 0.01); // Shadow gets fainter with height
            
            this.renderer.ctx.save();
            const shadowScreen = this.renderer.transformPoint(ball.x, ball.y, 0);
            this.renderer.ctx.globalAlpha = shadowAlpha;
            this.renderer.ctx.fillStyle = '#333333';
            this.renderer.ctx.beginPath();
            this.renderer.ctx.ellipse(shadowScreen.x, shadowScreen.y, shadowRadius * this.renderer.scale, shadowRadius * this.renderer.scale * 0.5, 0, 0, Math.PI * 2);
            this.renderer.ctx.fill();
            this.renderer.ctx.restore();
        }
          // Draw impact circle effect if the ball just hit the ground
        if (this.ballAnimation && this.ballAnimation.active && this.ballAnimation.lastGroundTime) {
            const timeSinceImpact = Date.now() - this.ballAnimation.lastGroundTime;
            const impactDuration = 500; // Impact effect lasts 500ms
            
            if (timeSinceImpact < impactDuration) {
                const impactProgress = timeSinceImpact / impactDuration;
                const impactRadius = ball.radius * (2 + impactProgress * 6);
                const impactAlpha = 0.4 * (1 - impactProgress);
                
                this.renderer.ctx.save();
                const impactScreen = this.renderer.transformPoint(ball.x, ball.y, 0.1);
                this.renderer.ctx.globalAlpha = impactAlpha;
                
                // Use green color if ball hit the green, white otherwise
                if (this.ballAnimation.hitGreen) {
                    this.renderer.ctx.fillStyle = '#4CAF50'; // Green color for green hits
                } else {
                    this.renderer.ctx.fillStyle = '#ffffff'; // White for other impacts
                }
                
                this.renderer.ctx.beginPath();
                this.renderer.ctx.ellipse(
                    impactScreen.x, 
                    impactScreen.y, 
                    impactRadius * this.renderer.scale, 
                    impactRadius * this.renderer.scale * 0.5, 
                    0, 0, Math.PI * 2
                );
                this.renderer.ctx.fill();
                this.renderer.ctx.restore();
            }
        }
        
        // Render the golf ball at its current position (including height)
        // Use a more circular approach for the ball
        const ballScreen = this.renderer.transformPoint(ball.x, ball.y, ball.z || 0);
        this.renderer.ctx.save();
        this.renderer.ctx.fillStyle = '#ffffff';
        this.renderer.ctx.strokeStyle = '#e0e0e0';
        this.renderer.ctx.lineWidth = 0.5;
        this.renderer.ctx.beginPath();
        // Use a circle with equal width and height for a rounder appearance
        this.renderer.ctx.arc(
            ballScreen.x, 
            ballScreen.y,
            ball.radius * this.renderer.scale,  // Use the same size for width and height
            0, 
            Math.PI * 2
        );
        this.renderer.ctx.fill();
        this.renderer.ctx.stroke();
        this.renderer.ctx.restore();
        
        // Add golf ball dimples with proper spin
        this.renderer.ctx.save();
        this.renderer.ctx.globalAlpha = 0.3;
        this.renderer.ctx.fillStyle = '#d0d0d0';
        
        // Get spin from animation state
        let spinAngle = 0;
        if (this.ballAnimation && this.ballAnimation.active) {
            spinAngle = this.ballAnimation.spin || 0;
        }
        
        // Draw more dimples with proper rotation
        const numDimples = 8;
        for (let i = 0; i < numDimples; i++) {
            const angle = (i / numDimples) * Math.PI * 2 + spinAngle;
            
            // Create elliptical pattern for more realistic spin appearance
            const radiusX = 3;
            const radiusY = 1.5;
            const dimpleX = ballScreen.x + Math.cos(angle) * radiusX;
            const dimpleY = ballScreen.y + Math.sin(angle) * radiusY;
            
            // Make dimples smaller for a more realistic look
            const dimpleSize = 0.7;
            
            this.renderer.ctx.beginPath();
            this.renderer.ctx.arc(dimpleX, dimpleY, dimpleSize, 0, Math.PI * 2);
            this.renderer.ctx.fill();
        }
        
        // Add a highlight for more 3D effect
        this.renderer.ctx.globalAlpha = 0.6;
        this.renderer.ctx.fillStyle = '#ffffff';
        const highlightX = ballScreen.x - 1;
        const highlightY = ballScreen.y - 1;
        this.renderer.ctx.beginPath();
        this.renderer.ctx.arc(highlightX, highlightY, 1.5, 0, Math.PI * 2);
        this.renderer.ctx.fill();
        
        this.renderer.ctx.restore();
    }

    getElevation(x, y) {
        const resolution = 4;
        const gridX = Math.floor(x / resolution) * resolution;
        const gridY = Math.floor(y / resolution) * resolution;
        
        if (this.heightMap[gridX] && this.heightMap[gridX][gridY] !== undefined) {
            return this.heightMap[gridX][gridY];
        }
        
        return 0;
    }

    getHoleInfo() {
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
