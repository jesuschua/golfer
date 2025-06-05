// Golf course generation and rendering

class GolfCourse {
    constructor(renderer) {
        this.renderer = renderer;
        this.holes = [];
        this.currentHole = null;
        this.generateNewHole();
    }    generateNewHole() {
        // Define the playable area - reduced size since we're zooming in more
        const width = 80;
        const height = 60;
        
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
        this.generateTrees();
        this.generateTerrain();
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
    }    generateGreen(width, height) {
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
    }    generateHazards() {
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
    }    generateTrees() {
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
        }
    }

    render() {
        this.renderer.clear();
        
        if (!this.currentHole) return;

        // Render in order: terrain, water, fairway, rough, bunkers, green, tee, trees
        this.renderTerrain();
        this.renderWater();
        this.renderFairway();
        this.renderBunkers();
        this.renderGreen();
        this.renderTee();
        this.renderTrees();
        this.renderPin();
    }    renderTerrain() {
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
    }

    renderGreen() {
        const green = this.currentHole.green;        this.renderer.drawCircle(
            green.x, 
            green.y, 
            green.radius, 
            getGreenColor(),
            null, 
            0
        );
    }

    renderTee() {
        const tee = this.currentHole.tee;        this.renderer.drawCircle(
            tee.x, 
            tee.y, 
            tee.radius, 
            '#a0a080',
            null, 
            0
        );
    }

    renderBunkers() {        this.currentHole.bunkers.forEach(bunker => {
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

    renderWater() {        this.currentHole.water.forEach(water => {
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

    renderTrees() {        this.currentHole.trees.forEach(tree => {
            // Draw tree trunk
            this.renderer.drawCircle(
                tree.x, 
                tree.y, 
                1, 
                '#8b7355'
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
    }

    renderPin() {
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
        
        // Flag
        this.renderer.ctx.fillStyle = '#c8a882';
        this.renderer.ctx.fillRect(poleEnd.x, poleEnd.y - 2, 8, 4);
        this.renderer.ctx.restore();
    }    getElevation(x, y) {
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
