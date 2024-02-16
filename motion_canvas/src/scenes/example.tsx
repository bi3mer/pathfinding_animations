import { Line, Rect, makeScene2D } from '@motion-canvas/2d';
import { all, createRef, delay, Reference, ThreadGenerator, waitFor } from '@motion-canvas/core';

const GREEN = "#03DAC6";
const DARK_PURPLE = "#3700B3";
const LIGHT_PURPLE = "#BB86FC";
const BACKGROUND = "#121212";
const DARK_DARK_GRAY = "#313131";
const DARK_GRAY = '#616161';
const RED = "#CF6679";
const DARK_RED = "#BE3144";

const SCREEN_WIDTH = 1920;
const SCREEN_HEIGHT = 1080;

const GRID_WIDTH = 10;
const GRID_HEIGHT = 8;

class GridElement {
  rect: Reference<Rect>
  cost: number
  traversible: boolean

  constructor(x: number, y: number, cost: number, view: any) {
    this.cost = cost;
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
  prev: PathRecord | null
  pastX: number
  pastY: number
  costSoFar: number

  constructor(x: number, y: number, prev: PathRecord, costSoFar: number) {
    this.x = x;
    this.y = y;
    this.prev = prev;
    this.costSoFar = costSoFar;
  }
}

class PathFindingList {
  list: PathRecord[]

  constructor() {
    this.list = [];
  }


  insert(pr: PathRecord) {
    const size = this.list.length; // binary insertion would be better
    let i = 0;
    for (; i < size; ++i) {
      if (pr.costSoFar > this.list[i].costSoFar) {
        break;
      }
    }

    this.list.splice(i, 0, pr);
  }

  popCheapest(): PathRecord {
    return this.list.pop();
  }

  find(x: number, y: number): number {
    const size = this.list.length;
    for (let i = 0; i < size; ++i) {
      const cur = this.list[i];
      if (x == cur.x && y == cur.y) {
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

    for (let y = 0; y < GRID_HEIGHT; ++y) {
      let row: GridElement[] = [];
      for (let x = 0; x < GRID_WIDTH; ++x) {
        row.push(new GridElement(x * 50, y * 50, 1, view));
      }

      this.grid.push(row);
    }
  }

  // the better way to do this is to make it a generator function which isn't 
  // generating new animations, but is instead updating one step at a time. Then 
  // can update it. So Dijkstra should be a class which takes in a grid, but 
  // does not handle the animation. That way I could run default animation for 
  // some number of frames, but then purposely pause at key moments, such as when
  // the goal node is spotted, but not immediately selected (aka greedy dijkstra).
  //
  // NOTE: a proper implementation would check to see if the path was found, 
  // but we aren't concerned about that.
  * dijkstra(goalX: number, goalY: number, timePerUpdate: number) {
    const DIR = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    let foundRecord: PathRecord | null = null;
    const open = new PathFindingList();
    const closed = new PathFindingList();

    open.insert(new PathRecord(0, 0, null, 0));

    while (open.list.length > 0) {
      console.log(open);
      const cur = open.popCheapest();
      console.log(cur);

      // add cur to the closed list
      yield* this.grid[cur.y][cur.x].rect().fill(DARK_RED, timePerUpdate);
      closed.insert(cur);

      // check if we have found the goal position
      if (cur.x == goalX && cur.y == goalY) {
        foundRecord = cur;
        break; // search complete
      }

      // find neighbors
      console.log(cur);
      for (let d of DIR) {
        const newX = cur.x + d[0];
        const newY = cur.y + d[1];

        // check out of bounds for new position in the grid
        if (newX < 0 || newX >= GRID_WIDTH || newY < 0 || newY >= GRID_HEIGHT) {
          continue;
        }

        // check if current grid position is in the closed list
        if (closed.find(newX, newY) !== -1) {
          continue;
        }

        // check if current grid position is in the open list
        const foundPRIndex = open.find(newX, newY);
        if (foundPRIndex !== -1) {
          // If cost is lower than current node, update 
          const foundPR = open.list[foundPRIndex];
          if (foundPR.costSoFar > cur.costSoFar) {
            open.list.splice(foundPRIndex, 1); // remove element
            yield* this.grid[newY][newX].rect().fill(GREEN, timePerUpdate);
            open.insert(new PathRecord(newX, newY, cur, cur.costSoFar + this.grid[newY][newX].cost));
          }
          continue;
        }

        // add neighbors to the open list and cur to closed
        yield* this.grid[newY][newX].rect().fill(GREEN, timePerUpdate);
        open.insert(new PathRecord(newX, newY, cur, cur.costSoFar + this.grid[newY][newX].cost));
      }
    }

    // reconstruct path with lines
    // const cost = foundRecord.costSoFar;
    let path = []
    while (foundRecord !== null) {
      path.push([foundRecord.x, foundRecord.y])
      foundRecord = foundRecord.prev;
    }
    path.reverse();

    return path;
  }
}


export default makeScene2D(function*(view) {
  const grid = new Grid(view);
  const targetX = Math.floor(GRID_WIDTH / 2);
  const targetY = GRID_HEIGHT - 1;
  yield* grid.grid[0][0].rect().fill(GREEN, 1);
  yield* grid.grid[targetY][targetX].rect().fill(LIGHT_PURPLE, 1);

  const path = yield* grid.dijkstra(targetX, targetY, 0.1);
  path.push([targetX, targetY]);

  // clear graph colors
  let generators: ThreadGenerator[] = [];
  for (let row of grid.grid) {
    for (let ge of row) {
      generators.push(ge.rect().fill(BACKGROUND, 0.5));
      generators.push(ge.rect().stroke(DARK_DARK_GRAY, 0.5));
    }
  }

  yield* waitFor(1);
  yield* all(...generators);

  // display the path
  generators = [];
  const size = path.length - 1;

  const lineRef = createRef<Line>();
  let pathPoints: [number, number][] = [];

  for (let i = 0; i < size; ++i) {
    pathPoints.push([path[i][0] * 50 - 200, path[i][1] * 50 - 200]);
    generators.push(grid.grid[path[i][1]][path[i][0]].rect().fill(DARK_GRAY, 1.0));
  }

  view.add(
    <Line
      ref={lineRef}
      points={pathPoints}
      stroke={'yellow'}
      lineWidth={3}
      opacity={1}
      end={0}
      arrowSize={10}
      endArrow
    />
  );

  generators.push(lineRef().end(1, 3.0));

  yield* all(...generators);
  yield* grid.grid[targetY][targetX].rect().fill(GREEN, 0.5);
});
