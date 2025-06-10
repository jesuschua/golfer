// Golf ball physics and collision detection

class PhysicsEngine {
    constructor() {
        this.gravity = 20;
        this.bounceDecay = 0.65;
        this.maxBounces = 8;
        this._lastUpdateTime = null;
    }

    createBallAnimation(startX, startY, targetX, targetY) {
        // Calculate starting height and initial velocity
        const startHeight = this.random(6, 50);
        const flightTime = 2.0;
        const xDistance = targetX - startX;
        const yDistance = targetY - startY;
        
        // Add randomness to speed and direction
        const baseSpeed = 20;
        const speedVariation = this.random(2, 2.7);
        const speed = baseSpeed * speedVariation;
        
        const baseAngle = Math.atan2(yDistance, xDistance);
        const angleVariation = this.random(-Math.PI/12, Math.PI/12);
        const finalAngle = baseAngle + angleVariation;
        
        const directionX = Math.cos(finalAngle);
        const directionY = Math.sin(finalAngle);
        
        const baseVerticalVelocity = 2;
        const verticalVariation = this.random(0.5, 5.0);
        
        return {
            active: true,
            startTime: Date.now(),
            duration: 15000,
            startPos: { x: startX, y: startY, z: startHeight },
            endPos: { x: targetX, y: targetY, z: 0 },
            currentPos: { x: startX, y: startY, z: startHeight },
            velocity: {
                x: directionX * speed,
                y: directionY * speed,
                z: baseVerticalVelocity * verticalVariation
            },
            bounces: 0,
            maxBounces: this.maxBounces,
            bounceDecay: this.bounceDecay,
            gravity: this.gravity,
            spin: this.random(0, Math.PI * 2),
            spinRate: 0,
            lastGroundTime: 0,
            hitGreen: false,
            outOfBounds: false,
            restTime: null,
            isRolling: false,            isDisappearing: false,
            isTrapped: false,
            holeInOne: false,
            waterHazard: false,
            effectStartTime: null  // Track when special effects started
        };
    }

    updateBallPhysics(ballAnimation, ball, hole) {
        if (!ballAnimation.active) return { shouldContinue: true };

        const now = Date.now();
        const deltaTime = Math.min(30, now - (this._lastUpdateTime || now)) / 1000;
        this._lastUpdateTime = now;

        // Apply gravity if not in rolling mode
        if (!ballAnimation.isRolling) {
            ballAnimation.velocity.z -= this.gravity * deltaTime;
        }

        // Update position
        ball.x += ballAnimation.velocity.x * deltaTime;
        ball.y += ballAnimation.velocity.y * deltaTime;
        ball.z += ballAnimation.velocity.z * deltaTime;

        // Check for collisions and special events
        const collisionResult = this.checkCollisions(ball, ballAnimation, hole, now);
        
        if (collisionResult.shouldStop) {
            ballAnimation.active = false;
            ballAnimation.isDisappearing = true;
            return { shouldContinue: false, result: collisionResult };
        }

        // Check if ball should start disappearing (at rest)
        if (this.shouldBallDisappear(ballAnimation, ball, now)) {
            ballAnimation.active = false;
            ballAnimation.isDisappearing = true;
            return { shouldContinue: false, result: { type: 'rest' } };
        }

        return { shouldContinue: true };
    }    checkCollisions(ball, ballAnimation, hole, currentTime) {
        // Check for special collision detection while ball is in flight
        if (!ballAnimation.isDisappearing && !ballAnimation.isTrapped) {
            const currentFeature = this.identifyHitFeature(ball.x, ball.y, hole);
              // Check for hole collision
            if (currentFeature.type === 'hole') {
                ballAnimation.holeInOne = true;
                ballAnimation.effectStartTime = Date.now();
                return { shouldStop: true, type: 'hole-in-one' };
            }
              // Check for water collision
            if (currentFeature.type === 'water' && ball.z <= 2) {
                ballAnimation.waterHazard = true;
                ballAnimation.effectStartTime = Date.now();
                return { shouldStop: true, type: 'water-hazard' };
            }
        }

        // Ground collision detection
        if (ball.z <= 0 && ballAnimation.velocity.z <= 0) {
            const onTerrain = (
                ball.x >= 0 && ball.x <= hole.width &&
                ball.y >= 0 && ball.y <= hole.height
            );
              if (!onTerrain) {
                return { shouldStop: false };
            } else {
                ballAnimation.lastGroundTime = currentTime;
                ball.z = 0;
                
                return this.handleGroundCollision(ball, ballAnimation, hole);
            }
        }

        return { shouldStop: false };
    }handleGroundCollision(ball, ballAnimation, hole) {
        const hitFeature = this.identifyHitFeature(ball.x, ball.y, hole);
          if (hitFeature.type === 'hole') {
            ballAnimation.holeInOne = true;
            ballAnimation.effectStartTime = Date.now();
            return { shouldStop: true, type: 'hole-in-one' };
        } else if (hitFeature.type === 'water') {
            ballAnimation.waterHazard = true;
            ballAnimation.effectStartTime = Date.now();
            return { shouldStop: true, type: 'water-hazard' };
        } else if (hitFeature.type === 'bunker') {
            ballAnimation.velocity.x = 0;
            ballAnimation.velocity.y = 0;
            ballAnimation.velocity.z = 0;
            ballAnimation.isRolling = true;
            ballAnimation.isTrapped = true;
            ballAnimation.hitGreen = false;
        } else {
            // Handle bouncing
            this.handleBounce(ballAnimation, hitFeature);
        }

        return { shouldStop: false };
    }

    handleBounce(ballAnimation, hitFeature) {
        if (ballAnimation.bounces < ballAnimation.maxBounces) {
            ballAnimation.bounces++;
            ballAnimation.velocity.z = Math.abs(ballAnimation.velocity.z) * ballAnimation.bounceDecay;
            ballAnimation.velocity.x *= ballAnimation.bounceDecay;
            ballAnimation.velocity.y *= ballAnimation.bounceDecay;
            
            const totalVelocity = Math.sqrt(
                ballAnimation.velocity.x ** 2 + 
                ballAnimation.velocity.y ** 2 + 
                ballAnimation.velocity.z ** 2
            );
              if (totalVelocity < 5) {
                ballAnimation.velocity.z = 0;
                ballAnimation.isRolling = true;
            }
            
            if (hitFeature.type === 'green') {
                ballAnimation.hitGreen = true;
            }
        } else {
            ballAnimation.velocity.z = 0;
            ballAnimation.isRolling = true;
        }
    }

    shouldBallDisappear(ballAnimation, ball, currentTime) {
        // Check if ball has been at rest for too long
        const velocity = Math.sqrt(
            ballAnimation.velocity.x ** 2 + 
            ballAnimation.velocity.y ** 2 + 
            ballAnimation.velocity.z ** 2
        );
        
        if (velocity < 0.5 && ball.z <= 0.1) {
            if (!ballAnimation.restTime) {
                ballAnimation.restTime = currentTime;
            } else if (currentTime - ballAnimation.restTime > 3000) {
                return true;
            }
        } else {
            ballAnimation.restTime = null;
        }
        
        return false;
    }

    identifyHitFeature(x, y, hole) {
        // Check if off course
        if (x < 0 || x > hole.width || y < 0 || y > hole.height) {
            return { type: 'off-course' };
        }        // Check hole (highest priority)
        const distanceToHole = Math.sqrt((x - hole.green.pin.x) ** 2 + (y - hole.green.pin.y) ** 2);
        if (distanceToHole <= 0.5) {
            return { type: 'hole', distance: distanceToHole };
        }
        
        // Check green
        const distanceToGreen = Math.sqrt((x - hole.green.x) ** 2 + (y - hole.green.y) ** 2);
        if (distanceToGreen <= hole.green.radius) {
            return { type: 'green' };
        }
        
        // Check tee
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
        
        // Check water
        for (const water of hole.water) {
            const distanceToWater = Math.sqrt((x - water.x) ** 2 + (y - water.y) ** 2);
            if (distanceToWater <= water.radius) {
                return { type: 'water' };
            }
        }
        
        // Check fairway
        for (const fairwaySegment of hole.fairway) {
            const distanceToFairway = Math.sqrt((x - fairwaySegment.x) ** 2 + (y - fairwaySegment.y) ** 2);
            if (distanceToFairway <= fairwaySegment.width / 2) {
                return { type: 'fairway' };
            }
        }
        
        // Check terrain grid
        const gridSize = 8;
        const gridX = Math.floor(x / gridSize);
        const gridY = Math.floor(y / gridSize);
        
        if (gridX >= 0 && gridX < Math.floor(hole.width / gridSize) && 
            gridY >= 0 && gridY < Math.floor(hole.height / gridSize)) {
            return { type: 'terrain-grid', gridX: gridX, gridY: gridY };
        }
        
        return { type: 'rough' };
    }

    isBallFlying(ball, ballAnimation) {
        if (!ball || !ballAnimation || !ballAnimation.velocity) return false;
        
        const ballVisible = ball.z >= -2;
        const hasVelocity = (
            Math.abs(ballAnimation.velocity.x) > 1 || 
            Math.abs(ballAnimation.velocity.y) > 1 || 
            Math.abs(ballAnimation.velocity.z) > 1
        );
        const inAir = ball.z > 0.1;
        
        return ballVisible && (inAir || hasVelocity);
    }

    createBallAnimationWithTargets(playableTargets, hole) {
        if (!playableTargets || playableTargets.length === 0) return null;
        
        // Add weighting to make some features more likely targets
        const weightedTargets = [];
        playableTargets.forEach(target => {
            let weight = 1;
            
            if (target.type === 'green') weight = 8;
            else if (target.type.startsWith('fairway')) weight = 5;
            else if (target.type === 'tee') weight = 2;
            else if (target.type.startsWith('rough')) weight = 3;
            else if (target.type.startsWith('bunker')) weight = 1;
            else if (target.type.startsWith('water')) weight = 1;
            else if (target.type.startsWith('terrain-grid')) weight = 4;
            
            for (let i = 0; i < weight; i++) {
                weightedTargets.push(target);
            }
        });
        
        // Pick a random target
        const targetFeature = weightedTargets[Math.floor(this.random(0, 1) * weightedTargets.length)];
        const targetX = targetFeature.x;
        const targetY = targetFeature.y;
        
        // Calculate starting position from outside terrain
        const pin = hole.green.pin;
        const pinToTargetAngle = Math.atan2(targetY - pin.y, targetX - pin.x);
        const startAngle = pinToTargetAngle + Math.PI + this.random(-0.3, 0.3);
        
        const terrainCenterX = hole.width / 2;
        const terrainCenterY = hole.height / 2;
        const maxTerrainRadius = Math.sqrt(hole.width * hole.width + hole.height * hole.height) / 2;
        const startDistance = maxTerrainRadius + this.random(20, 40);
        
        const startX = terrainCenterX + Math.cos(startAngle) * startDistance;
        const startY = terrainCenterY + Math.sin(startAngle) * startDistance;
        
        // Create the ball animation
        const ballAnimation = this.createBallAnimation(startX, startY, targetX, targetY);
        
        // Create the ball object
        const ball = {
            x: startX,
            y: startY,
            z: ballAnimation.startPos.z,
            radius: 0.2
        };
          
        return {
            animation: ballAnimation,
            ball: ball,
            targetType: targetFeature.type
        };
    }

    stopBallAnimation() {
        // Stop any active ball animation
    }

    // Utility methods
    random(min, max) {
        return Math.random() * (max - min) + min;
    }
}
