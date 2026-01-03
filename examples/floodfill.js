kaplay();

class Grid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    _getXY(node) {
        return vec2(node % this.width, Math.floor(node / this.width));
    }

    getNeighbors(node) {
        const neighbors = [];
        const x = node % this.width;
        if (node >= this.width) {
            neighbors.push(node - this.width);
        }
        if (x > 0) {
            neighbors.push(node - 1);
        }
        if (x < this.width - 1) {
            neighbors.push(node + 1);
        }
        if (node < this.width * (this.height - 1)) {
            neighbors.push(node + this.width);
        }
        return neighbors;
    }
}

const grid = new Grid(2, 3);

debug.log(floodFill(grid, 1, node => node & 1));
