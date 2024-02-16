
import { Grid } from "./grid";
import { manhattan, reversePath } from "./util";
import { PathFindingList, PathRecord } from "./pathfindingList";

export function astar(grid: Grid, src: [number, number], tgt: [number, number]): [number, number][] {
  let foundRecord: PathRecord | null = null;
  const open = new PathFindingList();
  const closed = new PathFindingList();

  open.insert(new PathRecord(src[0], src[1], null, 0, manhattan(src, tgt)));

  while (open.list.length > 0) {
    const cur = open.popCheapest();

    // add cur to the closed list
    closed.insert(cur);

    // check if we have found the goal position
    if (cur.x == tgt[0] && cur.y == tgt[1]) {
      foundRecord = cur;
      break; // search complete
    }

    // find neighbors
    for (let n of grid.getNeighbors(cur.x, cur.y)) {
      const costSoFar = cur.costSoFar + grid.g[n[1]][n[0]].cost;

      // check if current grid position is in the closed list
      const closedIndex = closed.find(n[0], n[1]);
      if (closedIndex !== -1) {
        // If cost is less than what we've found, ignore it and go to the 
        // next neighbor
        const record = closed.list[closedIndex];
        if (record.costSoFar <= costSoFar) {
          continue;
        }

        n.estimatedCost = record.estimatedCost; // skip duplicate heuristic calculations
        closed.list.splice(closedIndex, 1); // remove element
      } else {
        // Element can't be in open and closed list at the same time. So now we 
        // check the open list
        const openIndex = open.find(n[0], n[1]);
        if (openIndex !== -1) {
          // If record in open list has lower cost, go to next neighbor 
          const record = open.list[openIndex];
          if (record.costSoFar <= costSoFar) {
            continue;
          }

          // Otherwise, we need to update the cost

        } else {
          // unvisited node
        }
      }

      // add neighbors to the open list and cur to closed
      open.insert(new PathRecord(n[0], n[1], cur, costSoFar));
    }
  }

  return reversePath(foundRecord);
}
