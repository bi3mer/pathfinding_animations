import { Grid } from "./grid";
import { PathFindingList, PathRecord } from "./pathfindingList";
import { reversePath } from "./util";

export function dijkstra(grid: Grid, src: [number, number], tgt: [number, number]): [number, number][] {
  let foundRecord: PathRecord | null = null;
  const open = new PathFindingList();
  const closed = new PathFindingList();

  open.insert(new PathRecord(src[0], src[1], null, 0));

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
      // check if current grid position is in the closed list
      if (closed.find(n[0], n[1]) !== -1) {
        continue;
      }

      // check if current grid position is in the open list
      const foundPRIndex = open.find(n[0], n[1]);
      if (foundPRIndex !== -1) {
        // If cost is lower than current node, update 
        const foundPR = open.list[foundPRIndex];
        if (foundPR.costSoFar > cur.costSoFar) {
          open.list.splice(foundPRIndex, 1); // remove element
          // open.insert(new PathRecord(n[0], n[1], cur, cur.costSoFar + grid.g[n[1]][n[0]].cost));
        } else {
          continue;
        }
      }

      // add neighbors to the open list and cur to closed
      open.insert(new PathRecord(n[0], n[1], cur, cur.costSoFar + grid.g[n[1]][n[0]].cost));
    }
  }

  // reconstruct path with lines
  // console.log(`Dijkstra path cost: ${foundRecord!.costSoFar}`);
  // const cost = foundRecord.costSoFar;
  return reversePath(foundRecord);
}
