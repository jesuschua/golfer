// Course generation and layout management

class CourseGenerator {
    constructor() {
        this.heightMap = [];
    }

    generateNewHole() {
        // Define the playable area - doubled in size for more expansive courses
        const width = 160;
        const height = 120;
        
        // Generate hole characteristics
        const par = this.randomInt(3, 5);
        const difficulty = this.random(0.3, 0.8);
        
        const hole = {
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
        };        // Generate course features in logical order
        hole.tee = this.generateTeeArea(width, height);
        hole.green = this.generateGreen(width, height, hole.tee);
        hole.fairway = this.generateFairway(hole.tee, hole.green);
        this.generateHazards(hole);
        this.generateTrees(hole);
        this.generateTerrain(hole);

        return hole;
    }

    generateTeeArea(width, height) {
        // Tee area is usually at one end
        const side = this.randomInt(0, 3); // 0=top, 1=right, 2=bottom, 3=left
        let teeX, teeY;

        switch(side) {
            case 0: // top
                teeX = this.random(width * 0.3, width * 0.7);
                teeY = height * 0.9;
                break;
            case 1: // right
                teeX = width * 0.9;
                teeY = this.random(height * 0.3, height * 0.7);
                break;
            case 2: // bottom
                teeX = this.random(width * 0.3, width * 0.7);
                teeY = height * 0.1;
                break;
            case 3: // left
                teeX = width * 0.1;
                teeY = this.random(height * 0.3, height * 0.7);
                break;
        }

        return {
            x: teeX,
            y: teeY,
            radius: this.random(4, 8),
            elevation: this.random(2, 6)
        };
    }

    generateGreen(width, height, tee) {
        // Green is usually opposite to tee
        let greenX, greenY;

        if (tee.x < width * 0.5) {
            greenX = this.random(width * 0.6, width * 0.9);
        } else {
            greenX = this.random(width * 0.1, width * 0.4);
        }

        if (tee.y < height * 0.5) {
            greenY = this.random(height * 0.6, height * 0.9);
        } else {
            greenY = this.random(height * 0.1, height * 0.4);
        }

        return {
            x: greenX,
            y: greenY,
            radius: this.random(8, 15),
            elevation: this.random(0, 3),
            pin: {
                x: greenX + this.random(-3, 3),
                y: greenY + this.random(-3, 3)
            }
        };
    }

    generateFairway(tee, green) {
        // Create a curved fairway from tee to green
        const numSegments = 8;
        const fairway = [];

        for (let i = 0; i <= numSegments; i++) {
            const t = i / numSegments;
            
            // Add some curves to make it interesting
            const midpointX = (tee.x + green.x) / 2 + this.random(-20, 20);
            const midpointY = (tee.y + green.y) / 2 + this.random(-15, 15);
            
            const x = this.cubicBezier(t, tee.x, midpointX, midpointX, green.x);
            const y = this.cubicBezier(t, tee.y, midpointY, midpointY, green.y);
            
            // Vary the width along the fairway
            const width = this.lerp(12, 18, Math.sin(t * Math.PI) + this.random(-2, 2));
            
            fairway.push({
                x: x,
                y: y,
                width: width,
                elevation: this.random(-1, 2)
            });
        }

        return fairway;
    }    generateHazards(hole) {
        // Minimal hazards for serene aesthetic
        const numBunkers = this.randomInt(0, 2);
        const numWater = this.random(0, 1) > 0.8 ? 1 : 0;

        // Generate sand bunkers
        for (let i = 0; i < numBunkers; i++) {
            hole.bunkers.push({
                x: this.random(20, hole.width - 20),
                y: this.random(20, hole.height - 20),
                radius: this.random(6, 10),
                depth: this.random(0.5, 1.5),
                shape: 0 // Always round for simplicity
            });
        }

        // Generate water hazards
        for (let i = 0; i < numWater; i++) {
            hole.water.push({
                x: this.random(25, hole.width - 25),
                y: this.random(25, hole.height - 25),
                radius: this.random(12, 18),
                depth: this.random(2, 4)
            });
        }
    }

    generateTrees(hole) {
        // Minimal trees for clean, open aesthetic
        const numTrees = this.randomInt(2, 6);
        
        for (let i = 0; i < numTrees; i++) {
            hole.trees.push({
                x: this.random(10, hole.width - 10),
                y: this.random(10, hole.height - 10),
                height: this.random(10, 16),
                radius: this.random(4, 7),
                type: 0 // Single tree type for consistency
            });
        }
    }

    generateTerrain(hole) {
        // Generate smoother, more gentle height variations
        this.heightMap = [];
        const resolution = 4; // Finer resolution for detailed terrain at higher zoom
        
        for (let x = 0; x <= hole.width; x += resolution) {
            this.heightMap[x] = {};
            for (let y = 0; y <= hole.height; y += resolution) {
                // Much gentler terrain variation
                this.heightMap[x][y] = this.smoothNoise(x, y, 0.02) * 1.5;
            }
        }
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

    // Utility methods
    random(min, max) {
        return Math.random() * (max - min) + min;
    }

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    lerp(a, b, t) {
        return a + (b - a) * t;
    }

    cubicBezier(t, p0, p1, p2, p3) {
        const oneMinusT = 1 - t;
        return oneMinusT * oneMinusT * oneMinusT * p0 +
               3 * oneMinusT * oneMinusT * t * p1 +
               3 * oneMinusT * t * t * p2 +
               t * t * t * p3;
    }

    smoothNoise(x, y, scale) {
        // Simple noise function for terrain generation
        return Math.sin(x * scale) * Math.cos(y * scale) * 0.5 + 
               Math.sin(x * scale * 2) * Math.cos(y * scale * 2) * 0.25 +
               Math.sin(x * scale * 4) * Math.cos(y * scale * 4) * 0.125;
    }
}
