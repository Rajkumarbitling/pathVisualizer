export function bfs(grid, startNode, targetNode) {
    const queue = [startNode];
    const visited = new Set();
    // const directions = [[1, 0], [0, 1], [-1, 0], [0, -1], [-1, -1], [1, 1], [-1, 1], [1, -1]]; // Down, Right, Up, Left, bottomleft, topright, topleft, bottomright
    const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]]; // Down, Right, Up, Left
    const path = new Map();

    visited.add(startNode);
    startNode.distance = 0;

    while (queue.length > 0) {
        const currentNode = queue.shift();

        visited.add(currentNode);

        if (currentNode === targetNode) {
            return [...visited]
        }

        for (let [dx, dy] of directions) {
            const neighborX = currentNode.col + dx;
            const neighborY = currentNode.row + dy;

            if (isWalkable(grid, neighborX, neighborY) && !visited.has(grid[neighborY][neighborX])) {
                const neighborNode = grid[neighborY][neighborX];
                neighborNode.prevNode = currentNode
                visited.add(neighborNode);
                queue.push(neighborNode);
                path.set(neighborNode, currentNode);
            }
        }
    }

    return []; // Return empty if no path found
}

function isWalkable(grid, x, y) {
    return x >= 0 && y >= 0 && x < grid[0].length && y < grid.length && !grid[y][x].isWall;
}
