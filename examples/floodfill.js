kaplay();

function testFill() {
    const grid = new NavGrid(2, 3, (a, b) => true);
    debug.log(floodFill(grid, 0, node => (node & 1) == 0));
    debug.log(floodFill(grid, 1, node => node & 1));
}

testFill();

function testConnectivity() {
    const grid = new NavGrid(2, 3, (a, b) => (a & 1) === (b & 1));
    console.log(buildConnectivityMap(grid));
}

testConnectivity();
