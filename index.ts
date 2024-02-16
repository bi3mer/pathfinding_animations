import { astar } from "./astar";
import { dijkstra } from "./dijkstra";
import { greedyDijkstra } from "./greedyDijkstra";
import { Grid } from "./grid";

function averageRunTime(pathFinder, times: number): number {
  let time = 0;
  for (let i = 0; i < times; ++i) {
    const start = performance.now();
    pathFinder(g, src, tgt);
    const end = performance.now();

    time += end - start;
  }

  return time / times;
}

const W = 50;
const H = 50;
let g = new Grid(W, H);

let src: [number, number] = [0, 0];
let tgt: [number, number] = [W - 1, H - 1];

for (let x = W - 1; x >= 5; --x) {
  if (x % 2 == 0) {
    g.g[25][x].makeBlock();
  } else {
    g.g[25][x].makeHighCost();
  }
}

// console.log(`Dijkstra:        ${averageRunTime(dijkstra, 1000)}`);
// console.log(`Greedy Dijkstra: ${averageRunTime(greedyDijkstra, 1000)}`);
for (let p of astar(g, src, tgt)) {
  g.g[p[1]][p[0]].makePath();
}

g.print();
