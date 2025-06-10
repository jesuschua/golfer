// Centralized rendering pipeline for golf course elements

class CourseRenderer {
    constructor(canvasRenderer) {
        this.renderer = canvasRenderer;
        this.renderQueue = [];
    }

    // Clear the render queue
    clearQueue() {
        this.renderQueue = [];
    }

    // Add item to render queue
    queueRender(renderFunction, zIndex = 0) {
        this.renderQueue.push({ renderFunction, zIndex });
    }

    // Execute all queued renders in z-order
    executeQueue() {
        // Sort by z-index (lower values render first/behind)
        this.renderQueue.sort((a, b) => a.zIndex - b.zIndex);
        
        // Execute each render function
        this.renderQueue.forEach(item => {
            try {
                item.renderFunction();
            } catch (error) {
                console.error('Render error:', error);
            }
        });
        
        this.clearQueue();
    }    renderTerrain(hole, terrainAnimation, courseGenerator) {
        this.queueRender(() => {            const gridSize = 8;
            const now = Date.now();
            
            for (let x = 0; x < hole.width; x += gridSize) {
                for (let y = 0; y < hole.height; y += gridSize) {
                    const elevation = courseGenerator.getElevation(x, y);
                    
                    const points = [
                        { x: x, y: y, z: elevation },
                        { x: x + gridSize, y: y, z: courseGenerator.getElevation(x + gridSize, y) },
                        { x: x + gridSize, y: y + gridSize, z: courseGenerator.getElevation(x + gridSize, y + gridSize) },
                        { x: x, y: y + gridSize, z: courseGenerator.getElevation(x, y + gridSize) }
                    ];                    let grassColor = getBaseGreen();                    if (terrainAnimation.active) {
                        const tileX = Math.floor(x / gridSize);
                        const tileY = Math.floor(y / gridSize);
                        const flipProgress = terrainAnimation.getTileFlipProgress(tileX, tileY);
                        
                        if (flipProgress < 1) {
                            // Create 3D tile spinning effect
                            const tileData = terrainAnimation.tiles.get(`${tileX}-${tileY}`);
                            this.renderSpinningTile(points, flipProgress, gridSize, tileData);
                        } else {
                            this.renderer.drawPolygon(points, grassColor, null, 0);
                        }
                    } else {
                        this.renderer.drawPolygon(points, grassColor, null, 0);
                    }
                }
            }
        }, 0); // Terrain renders first (lowest z-index)
    }

    renderWater(hole, elementAnimation) {
        hole.water.forEach((water, index) => {
            this.queueRender(() => {
                if (!elementAnimation.shouldRenderElement(`water-${index}`)) return;
                
                const slideOffset = elementAnimation.getElementSlideOffset(`water-${index}`);
                
                this.renderer.drawCircle(
                    water.x, 
                    water.y, 
                    water.radius, 
                    getWaterColor(),
                    null, 
                    slideOffset
                );
            }, 1);
        });
    }

    renderFairway(hole, elementAnimation) {
        const fairway = hole.fairway;
        
        for (let i = 0; i < fairway.length - 1; i++) {
            this.queueRender(() => {
                if (!elementAnimation.shouldRenderElement(`fairway-${i}`)) return;
                
                const current = fairway[i];
                const next = fairway[i + 1];
                const slideOffset = elementAnimation.getElementSlideOffset(`fairway-${i}`);
                
                const angle = Math.atan2(next.y - current.y, next.x - current.x);
                const perpAngle = angle + Math.PI / 2;
                
                const points = [
                    { 
                        x: current.x + Math.cos(perpAngle) * current.width / 2, 
                        y: current.y + Math.sin(perpAngle) * current.width / 2,
                        z: current.elevation + slideOffset
                    },
                    { 
                        x: current.x - Math.cos(perpAngle) * current.width / 2, 
                        y: current.y - Math.sin(perpAngle) * current.width / 2,
                        z: current.elevation + slideOffset
                    },
                    { 
                        x: next.x - Math.cos(perpAngle) * next.width / 2, 
                        y: next.y - Math.sin(perpAngle) * next.width / 2,
                        z: next.elevation + slideOffset
                    },
                    { 
                        x: next.x + Math.cos(perpAngle) * next.width / 2, 
                        y: next.y + Math.sin(perpAngle) * next.width / 2,
                        z: next.elevation + slideOffset
                    }
                ];
                
                this.renderer.drawPolygon(points, getFairwayGreen(), null, 0);
            }, 2);
        }
    }

    renderBunkers(hole, elementAnimation) {
        hole.bunkers.forEach((bunker, index) => {
            this.queueRender(() => {
                if (!elementAnimation.shouldRenderElement(`bunker-${index}`)) return;
                
                const slideOffset = elementAnimation.getElementSlideOffset(`bunker-${index}`);
                
                this.renderer.drawCircle(
                    bunker.x, 
                    bunker.y, 
                    bunker.radius, 
                    getSandColor(),
                    null, 
                    slideOffset
                );
            }, 3);
        });
    }

    renderGreen(hole, elementAnimation) {
        this.queueRender(() => {
            if (!elementAnimation.shouldRenderElement('green')) return;
            
            const green = hole.green;
            const slideOffset = elementAnimation.getElementSlideOffset('green');
            
            this.renderer.drawCircle(
                green.x, 
                green.y, 
                green.radius, 
                getGreenColor(),
                null, 
                slideOffset
            );
        }, 4);
    }

    renderTee(hole, elementAnimation) {
        this.queueRender(() => {
            if (!elementAnimation.shouldRenderElement('tee')) return;
            
            const tee = hole.tee;
            const slideOffset = elementAnimation.getElementSlideOffset('tee');
            
            this.renderer.drawCircle(
                tee.x, 
                tee.y, 
                tee.radius, 
                '#a0a080',
                null, 
                slideOffset
            );
        }, 5);
    }

    renderTrees(hole, elementAnimation) {
        hole.trees.forEach((tree, index) => {
            this.queueRender(() => {
                if (!elementAnimation.shouldRenderElement(`tree-${index}`)) return;
                
                const slideOffset = elementAnimation.getElementSlideOffset(`tree-${index}`);
                
                // Draw tree trunk
                this.renderer.drawCircle(
                    tree.x, 
                    tree.y, 
                    1, 
                    '#8b7355',
                    null,
                    slideOffset
                );
                
                // Draw tree canopy
                this.renderer.drawCircle(
                    tree.x, 
                    tree.y - tree.height * 0.3, 
                    tree.radius, 
                    getTreeColor(),
                    null, 
                    slideOffset
                );
            }, 6);
        });
    }

    renderPin(hole, elementAnimation) {
        this.queueRender(() => {
            if (!elementAnimation.shouldRenderElement('pin')) return;
            
            const pin = hole.green.pin;
            const pinHeight = 8;
            const slideOffset = elementAnimation.getElementSlideOffset('pin');
            
            // Pin pole
            const poleStart = this.renderer.transformPoint(pin.x, pin.y, slideOffset);
            const poleEnd = this.renderer.transformPoint(pin.x, pin.y, pinHeight + slideOffset);
            
            this.renderer.ctx.save();
            this.renderer.ctx.strokeStyle = '#d4b896';
            this.renderer.ctx.lineWidth = 2;
            this.renderer.ctx.beginPath();
            this.renderer.ctx.moveTo(poleStart.x, poleStart.y);
            this.renderer.ctx.lineTo(poleEnd.x, poleEnd.y);
            this.renderer.ctx.stroke();
            
            // Animated flag
            const currentTime = Date.now();
            const flutter1 = Math.sin(currentTime * 0.003) * 1.5;
            const flutter2 = Math.sin(currentTime * 0.005 + 1) * 0.8;
            const totalFlutter = flutter1 + flutter2;
            
            this.renderer.ctx.fillStyle = '#FF7F00';
            this.renderer.ctx.beginPath();
            this.renderer.ctx.moveTo(poleEnd.x, poleEnd.y - 2);
            this.renderer.ctx.lineTo(poleEnd.x + 8 + totalFlutter * 0.3, poleEnd.y - 2 + totalFlutter * 0.2);
            this.renderer.ctx.lineTo(poleEnd.x + 8 + totalFlutter * 0.5, poleEnd.y + 2 + totalFlutter * 0.3);
            this.renderer.ctx.lineTo(poleEnd.x, poleEnd.y + 2);
            this.renderer.ctx.closePath();
            this.renderer.ctx.fill();
            
            this.renderer.ctx.restore();
        }, 7);
    }    renderBall(ball, ballAnimation, hole) {
        if (!ball) return;
        
        this.queueRender(() => {
            const now = Date.now();
            const effectDuration = 3000; // Show effects for 3 seconds
            
            // Handle special effects (show for a duration after they start)
            if (ballAnimation) {
                if (ballAnimation.holeInOne && ballAnimation.effectStartTime && 
                    (now - ballAnimation.effectStartTime) < effectDuration) {
                    this.renderHoleInOneCelebration(ballAnimation);
                    return;
                } else if (ballAnimation.waterHazard && ballAnimation.effectStartTime && 
                           (now - ballAnimation.effectStartTime) < effectDuration) {
                    this.renderWaterSplashEffect(ballAnimation);
                    return;
                }
            }
            
            // Handle regular disappearing state
            if (ballAnimation && ballAnimation.isDisappearing) {
                return; // Ball faded away naturally
            }
            
            // Don't render if out of bounds and fallen too far
            const isOutOfBounds = (
                ball.x < 0 || ball.x > hole.width || 
                ball.y < 0 || ball.y > hole.height
            );
            
            if (ball.z < -5) return;
            if (isOutOfBounds && ballAnimation && ballAnimation.outOfBounds && ball.z < -2) return;
            
            // Draw shadow when ball is in air
            if (ball.z > 0.1) {
                const shadowRadius = ball.radius * (1 + ball.z * 0.03);
                const shadowScreen = this.renderer.transformPoint(ball.x, ball.y, 0);
                
                this.renderer.ctx.save();
                this.renderer.ctx.globalAlpha = 0.3;
                this.renderer.ctx.fillStyle = '#000000';
                this.renderer.ctx.beginPath();
                this.renderer.ctx.arc(shadowScreen.x, shadowScreen.y, shadowRadius * this.renderer.scale, 0, Math.PI * 2);
                this.renderer.ctx.fill();
                this.renderer.ctx.restore();
            }
            
            // Render the golf ball
            const ballScreen = this.renderer.transformPoint(ball.x, ball.y, ball.z || 0);
            this.renderer.ctx.save();
            this.renderer.ctx.fillStyle = '#ffffff';
            this.renderer.ctx.strokeStyle = '#e0e0e0';
            this.renderer.ctx.lineWidth = 0.5;
            this.renderer.ctx.beginPath();
            this.renderer.ctx.arc(
                ballScreen.x, 
                ballScreen.y,
                ball.radius * this.renderer.scale,
                0, 
                Math.PI * 2
            );
            this.renderer.ctx.fill();
            this.renderer.ctx.stroke();
            
            // Add dimples for realism
            this.renderer.ctx.fillStyle = '#f0f0f0';
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const radiusX = ball.radius * this.renderer.scale * 0.6;
                const radiusY = radiusX * 0.7;
                const dimpleX = ballScreen.x + Math.cos(angle) * radiusX;
                const dimpleY = ballScreen.y + Math.sin(angle) * radiusY;
                
                this.renderer.ctx.beginPath();
                this.renderer.ctx.arc(dimpleX, dimpleY, 0.7, 0, Math.PI * 2);
                this.renderer.ctx.fill();
            }
            
            // Add highlight
            this.renderer.ctx.globalAlpha = 0.6;
            this.renderer.ctx.fillStyle = '#ffffff';
            this.renderer.ctx.beginPath();
            this.renderer.ctx.arc(ballScreen.x - 1, ballScreen.y - 1, 1.5, 0, Math.PI * 2);
            this.renderer.ctx.fill();
            
            this.renderer.ctx.restore();
        }, 8);    }    renderHoleInOneCelebration(ballAnimation) {
        // Create a celebration effect with sparkles and text
        const currentTime = Date.now();
        const elapsed = currentTime - ballAnimation.effectStartTime;
        const progress = Math.min(elapsed / 3000, 1); // 3 second duration
        const sparkleCount = 12;
        
        this.renderer.ctx.save();
        
        // Draw sparkles around the screen
        for (let i = 0; i < sparkleCount; i++) {
            const angle = (i / sparkleCount) * Math.PI * 2;
            const radius = 50 + Math.sin(currentTime * 0.01 + i) * 20;
            const sparkleX = this.renderer.centerX + Math.cos(angle) * radius;
            const sparkleY = this.renderer.centerY + Math.sin(angle) * radius;
            
            const sparkleSize = (2 + Math.sin(currentTime * 0.02 + i) * 1) * (1 - progress * 0.5);
            
            this.renderer.ctx.fillStyle = `hsl(${(currentTime * 0.1 + i * 30) % 360}, 70%, 60%)`;
            this.renderer.ctx.globalAlpha = 1 - progress;
            this.renderer.ctx.beginPath();
            this.renderer.ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
            this.renderer.ctx.fill();
        }
        
        // Draw celebration text
        const textAlpha = Math.max(0, 1 - progress);
        this.renderer.ctx.globalAlpha = textAlpha;
        this.renderer.ctx.fillStyle = '#FFD700';
        this.renderer.ctx.font = 'bold 24px Arial';
        this.renderer.ctx.textAlign = 'center';
        this.renderer.ctx.strokeStyle = '#FF8C00';
        this.renderer.ctx.lineWidth = 2;
        this.renderer.ctx.strokeText('HOLE IN ONE!', this.renderer.centerX, this.renderer.centerY - 20);        this.renderer.ctx.fillText('HOLE IN ONE!', this.renderer.centerX, this.renderer.centerY - 20);
          this.renderer.ctx.restore();
    }

    renderWaterSplashEffect(ballAnimation) {
        if (!ballAnimation || !ballAnimation.effectStartTime) return;
        
        const currentTime = Date.now();
        const animationDuration = 3000; // 3 seconds total
        const elapsed = currentTime - ballAnimation.effectStartTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        
        this.renderer.ctx.save();
        
        // Create multiple water droplets
        const dropletCount = 20;
        for (let i = 0; i < dropletCount; i++) {
            const angle = (i / dropletCount) * Math.PI * 2;
            const baseRadius = 30;
            const animatedRadius = baseRadius * (1 + progress * 2);
            
            const dropletX = this.renderer.centerX + Math.cos(angle) * animatedRadius;
            const dropletY = this.renderer.centerY + Math.sin(angle) * animatedRadius * 0.7; // Flatten for isometric
            
            // Make droplets fade out as they expand
            const alpha = Math.max(0, 1 - progress);
            const dropletSize = 1 + progress * 3;
            
            this.renderer.ctx.globalAlpha = alpha;
            this.renderer.ctx.fillStyle = '#4682B4'; // Water blue color
            this.renderer.ctx.beginPath();
            this.renderer.ctx.arc(dropletX, dropletY, dropletSize, 0, Math.PI * 2);
            this.renderer.ctx.fill();
        }
        
        // Create concentric water ripples
        for (let ring = 0; ring < 3; ring++) {
            const ringRadius = (20 + ring * 15) * (1 + progress);
            const ringAlpha = Math.max(0, 0.3 - progress - ring * 0.1);
            
            this.renderer.ctx.globalAlpha = ringAlpha;
            this.renderer.ctx.strokeStyle = '#4682B4';
            this.renderer.ctx.lineWidth = 2;
            this.renderer.ctx.beginPath();
            this.renderer.ctx.ellipse(
                this.renderer.centerX, 
                this.renderer.centerY, 
                ringRadius, 
                ringRadius * 0.5, // Flatten for isometric view
                0, 0, Math.PI * 2
            );
            this.renderer.ctx.stroke();
        }
        
        // Add splash text
        if (progress < 0.5) {
            this.renderer.ctx.globalAlpha = 1 - progress * 2;
            this.renderer.ctx.fillStyle = '#4682B4';
            this.renderer.ctx.font = 'bold 18px Arial';
            this.renderer.ctx.textAlign = 'center';
            this.renderer.ctx.fillText('SPLASH!', this.renderer.centerX, this.renderer.centerY - 40);
        }
        
        this.renderer.ctx.restore();
    }

    renderSeagulls(animationManager) {
        if (!animationManager.isSeagullAnimationActive || 
            animationManager.seagullAnimation.flock.length === 0) return;
        
        this.queueRender(() => {
            const flightHeight = 15; // Flying at moderate height above ground
            
            // Render each bird in the flock
            animationManager.seagullAnimation.flock.forEach(bird => {
                // Basic visibility check - only render if bird is reasonably close to screen
                const margin = 200; // Pixels beyond screen edge to still render
                if (bird.currentX >= -margin && bird.currentX <= this.renderer.getWidth() + margin &&
                    bird.currentY >= -margin && bird.currentY <= this.renderer.getHeight() + margin) {
                    this.renderSingleSeagull(bird, flightHeight, animationManager.seagullAnimation);
                }
            });
        }, 9); // High z-index so seagulls render on top
    }

    renderSingleSeagull(bird, flightHeight, seagullAnimation) {
        // Transform to screen coordinates
        const seagullScreen = this.renderer.transformPoint(bird.currentX, bird.currentY, flightHeight);
        
        this.renderer.ctx.save();
        const size = bird.size * this.renderer.scale;
        
        // Calculate flight direction - ALL birds in V-formation face the same direction as the leader
        let deltaX, deltaY;
        if (seagullAnimation.formation === 'v-formation' && !bird.isLead) {
            // V-formation birds use the LEADER'S flight direction, not their own
            const leader = seagullAnimation.leadBird;
            deltaX = leader.endX - leader.startX;
            deltaY = leader.endY - leader.startY;
        } else {
            // Lead bird and non-V formations use their own flight direction
            deltaX = bird.endX - bird.startX;
            deltaY = bird.endY - bird.startY;
        }
        
        const flightAngle = Math.atan2(deltaY, deltaX); // Angle of flight in radians
        
        // Move to seagull position and rotate to face flight direction
        this.renderer.ctx.translate(seagullScreen.x, seagullScreen.y);
        
        // Check if this is a bottom-left-to-top-right flight (going up and right)
        // These flights look wrong, so flip the seagull horizontally
        const isUpwardFlight = deltaX > 0 && deltaY < 0; // Going right and up
        
        if (isUpwardFlight) {
            // Flip horizontally by scaling X by -1
            this.renderer.ctx.scale(-1, 1);
        }
        
        this.renderer.ctx.rotate(flightAngle);
        
        // Simple animated seagull - classic bird silhouette with aperiodic wing flapping
        const time = Date.now() * 0.006 + bird.wingOffset; // Add bird-specific wing offset
        
        // Create aperiodic wing flapping using multiple frequencies and phase offsets
        const baseFlap = Math.sin(time) * 0.4;
        const fastFlap = Math.sin(time * 2.3) * 0.15;
        const slowFlap = Math.sin(time * 0.7) * 0.2;
        const microFlap = Math.sin(time * 4.1 + 1.5) * 0.08;
        
        // Combine different frequencies for irregular pattern
        const wingFlap = baseFlap + fastFlap + slowFlap + microFlap;
        
        // Add slight asymmetry between left and right wings
        const leftWingFlap = wingFlap + Math.sin(time * 1.8 + 0.3) * 0.05;
        const rightWingFlap = wingFlap + Math.sin(time * 2.1 + 2.1) * 0.05;
        
        this.renderer.ctx.strokeStyle = '#ffffff';
        this.renderer.ctx.fillStyle = '#ffffff';
        this.renderer.ctx.lineWidth = size * 0.15;
        this.renderer.ctx.lineCap = 'round';
        
        // Draw simple seagull body (small oval)
        this.renderer.ctx.beginPath();
        this.renderer.ctx.ellipse(0, 0, size * 0.3, size * 0.1, 0, 0, Math.PI * 2);
        this.renderer.ctx.fill();
        
        // Draw seagull wings (simple V shape that flaps) - wings angled forward with asymmetric movement
        this.renderer.ctx.beginPath();
        
        // Left wing - angled forward and up with independent flapping
        this.renderer.ctx.moveTo(-size * 0.1, 0);
        this.renderer.ctx.lineTo(-size * 0.6, -size * 0.3 + leftWingFlap * size * 0.25);
        // Right wing - angled forward and up with independent flapping
        this.renderer.ctx.moveTo(size * 0.1, 0);
        this.renderer.ctx.lineTo(size * 0.6, -size * 0.3 + rightWingFlap * size * 0.25);
        this.renderer.ctx.stroke();
        
        this.renderer.ctx.restore();
    }    renderSpinningTile(originalPoints, flipProgress, gridSize, tileData = {}) {
        // Create spinning/flipping tile effect with 3D rotation
        const rotationAxis = tileData.rotationAxis || 'x';
        const clockwise = tileData.clockwise !== undefined ? tileData.clockwise : true;
        const spinAngle = flipProgress * Math.PI * (clockwise ? 1 : -1); // 180-degree flip
        
        // Calculate tile center for rotation
        const centerX = (originalPoints[0].x + originalPoints[2].x) / 2;
        const centerY = (originalPoints[0].y + originalPoints[2].y) / 2;
        const centerZ = (originalPoints[0].z + originalPoints[1].z + originalPoints[2].z + originalPoints[3].z) / 4;
        
        // Create rotation around specified axis
        const points = originalPoints.map(point => {
            if (rotationAxis === 'x') {
                // Rotate around X-axis (horizontal flip)
                let localY = point.y - centerY;
                let localZ = point.z - centerZ;
                
                const rotatedY = localY * Math.cos(spinAngle) - localZ * Math.sin(spinAngle);
                const rotatedZ = localY * Math.sin(spinAngle) + localZ * Math.cos(spinAngle);
                
                return {
                    x: point.x,
                    y: centerY + rotatedY,
                    z: centerZ + rotatedZ
                };
            } else {
                // Rotate around Y-axis (vertical flip)
                let localX = point.x - centerX;
                let localZ = point.z - centerZ;
                
                const rotatedX = localX * Math.cos(spinAngle) + localZ * Math.sin(spinAngle);
                const rotatedZ = -localX * Math.sin(spinAngle) + localZ * Math.cos(spinAngle);
                
                return {
                    x: centerX + rotatedX,
                    y: point.y,
                    z: centerZ + rotatedZ
                };
            }
        });
        
        // Determine colors based on flip progress
        const grassColor = getBaseGreen();
        const backColor = '#8B4513'; // Brown back of tile
        
        // First half of spin shows the brown "back" of the tile
        // Second half shows the green "front" of the tile
        let currentColor;
        if (flipProgress < 0.5) {
            // Fading from grass to brown (tile flipping away)
            const fadeAmount = flipProgress * 2; // 0 to 1 in first half
            currentColor = this.interpolateColor(grassColor, backColor, fadeAmount);
        } else {
            // Fading from brown to grass (tile flipping back)
            const fadeAmount = (flipProgress - 0.5) * 2; // 0 to 1 in second half
            currentColor = this.interpolateColor(backColor, grassColor, fadeAmount);
        }
        
        // Add scale effect to simulate perspective during flip
        const scaleAmount = Math.abs(Math.cos(spinAngle));
        if (scaleAmount > 0.1) { // Only render if tile is somewhat visible
            // Scale the tile to simulate perspective
            const scaledPoints = points.map(point => {
                if (rotationAxis === 'x') {
                    return {
                        x: point.x,
                        y: centerY + (point.y - centerY) * scaleAmount,
                        z: point.z
                    };
                } else {
                    return {
                        x: centerX + (point.x - centerX) * scaleAmount,
                        y: point.y,
                        z: point.z
                    };
                }
            });
            
            this.renderer.drawPolygon(scaledPoints, currentColor, null, 0);
        }
    }

    // Utility method to interpolate between colors
    interpolateColor(color1, color2, factor) {
        // Simple color interpolation - could be enhanced
        return factor > 0.5 ? color2 : color1;
    }
}
