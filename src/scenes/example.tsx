import { Rect, makeScene2D } from '@motion-canvas/2d';
import { createRef } from '@motion-canvas/core';

const GREEN = "#03DAC6";
const DARK_PURPLE = "#3700B3";
const LIGHT_PURPLE = "#BB86FC";
const BACKGROUND = "#121212";
const RED = "#CF6679";

const SCREEN_WIDTH = 1920;
const SCREEN_HEIGHT = 1080;

const GRID_SIZE = 8;

class GridElement {
  rect: Reference<Rect>
  cost: number
  traversible: boolean

  constructor(x: number, y: number, view: any) {
    this.rect = createRef<Rect>();
    view.add(<Rect
      ref={this.rect}
      width={50}
      height={50}
      fill={BACKGROUND}
      stroke={'white'}
      lineWidth={3}
      x={x - 200}
      y={y - 200}
    />);
  }
}

class PathRecord {
  x: number
  y: number
  pastX: number
  pastY: number
  costSoFar: number

  constructor(x: numbrer, y: number, pastX: number, pastY: number, costSoFar) {
    this.x = x;
    this.y = y;
    this.pastX = pastX;
    this.pastY = pastY;
    this.costSoFar = costSoFar;
  }
}

class PathFindingList {
  list: PathRecord[]
  constructor() {
    this.list = [];
  }

  private binarySearcH(cost: number): number {
    let low = 0;
    let high = this.list.length;
    while (low <= high) {
      const mid = low + (high - low) / 2;
      const costSoFar = this.list[mid].costSoFar;
      if (cost === costSoFar) {
        return mid + 1;
      }

      if (cost > costSoFar) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return low;
  }

  insert(pr: PathRecord) {
    this.list.splice(this.binarySearcH(pr.costSoFar), 0, pr);
  }

  popCheapest(): PathRecord {
    return this.list.shift();
  }

  // Not guaranteed cost so far is the same, so 0(n)
  find(pr: PathRecord): number {
    const size = this.list.length;
    for (let i = 0; i < size; ++i) {
      const cur = this.list[i];
      if (pr.x == cur.x && pr.y == cur.y) {
        return i;
      }
    }

    return -1;
  }
}

class Grid {
  grid: GridElement[][]
  view: any

  constructor(view: any) {
    this.view = view;
    this.grid = [];

    for (let y = 0; y < GRID_SIZE; ++y) {
      let row: GridElement[] = [];
      for (let x = 0; x < GRID_SIZE; ++x) {
        row.push(new GridElement(x * 50 + x * 1.3, y * 50 + y * 1.3, view));
      }

      this.grid.push(row);
    }
  }

  * dijkstra(goalX: number, goalY: number, timePerUpdate: number) {
    console.log('1.2');
    const DIR = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    let foundRecord: PathRecord | null = null;
    const open = new PathFindingList();
    const closed = new PathFindingList();

    open.insert(new PathRecord(0, 0, -1, -1, 0));
    console.log('here!');

    while (open.list.length > 0) {
      const cur = open.popCheapest();

      // check if we have found the goal position
      if (cur.x == goalX && cur.y == goalY) {
        foundRecord = cur;
        break; // search complete
      }

      // find neighbors
      for (let d of DIR) {
        const newX = cur.x + d[0];
        const newY = cur.y + d[1];

        // check out of bounds for new position in the grid
        if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
          continue;
        }

        // check if current grid position is in the closed list
        if (closed.find(cur) !== null) {
          continue;
        }

        // check if current grid position is in the open list
        const foundPRIndex = open.find(cur);
        if (foundPRIndex !== -1) {
          // If cost is lower than current node, update 
          const foundPR = open.list[foundPRIndex];
          if (foundPR.costSoFar > cur.costSoFar) {
            open.list.splice(foundPRIndex, 1); // remove element
            continue;
          }
        }

        // add neighbors to the open list and cur to closed
        yield* this.grid[newY][newX].rect().fill(DARK_PURPLE, timePerUpdate);
        open.insert(new PathRecord(newX, newY, cur.x, cur.y, cur.costSoFar + this.grid[newY][newX].cost));
        closed.insert(cur);
      }

      // add cur to the closed list
    }

    // reconstruct path with lines
    // NOTE: a proper implementation would check to see if the path was found, 
    // but we aren't concerned about that.

  }
}


export default makeScene2D(function*(view) {
  const grid = new Grid(view);
  yield* grid.grid[0][0].rect().fill(GREEN, 1);
  yield* grid.grid[7][7].rect().fill(LIGHT_PURPLE, 1);

  console.log('here 1');
  yield* grid.dijkstra(7, 7, 0.1);
  console.log('here 2');
});
