export class GridElement {
  cost: number
  traversible: boolean
  char: string

  constructor(cost: number, traversible: boolean) {
    this.cost = cost;
    this.traversible = traversible;
    this.char = "."
  }

  makeHighCost(cost = 3) {
    this.traversible = true;
    this.cost = cost;
    this.char = "~";
  }

  makeBlock() {
    this.traversible = false;
    this.char = "X";
  }

  makeDefault() {
    this.traversible = true;
    this.char = ".";
    this.cost = 1;
  }

  makePath() {
    this.char = "*";
  }
}

const DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

export class Grid {
  w: number
  h: number
  g: GridElement[][]

  constructor(width: number, height: number) {
    this.w = width;
    this.h = height;
    this.g = [];

    for (let y = 0; y < height; ++y) {
      const r: GridElement[] = [];
      for (let x = 0; x < width; ++x) {
        r.push(new GridElement(1, true));
      }

      this.g.push(r);
    }
  }

  print(): void {
    for (let y = 0; y < this.h; ++y) {
      let out: string = "";
      for (let x = 0; x < this.w; ++x) {
        out += this.g[y][x].char;
      }

      console.log(out);
    }
  }

  getNeighbors(x: number, y: number): [number, number][] {
    const neighbors: [number, number][] = [];
    for (let i = 0; i < 4; ++i) {
      const newX = x + DIRECTIONS[i][0];
      const newY = y + DIRECTIONS[i][1];

      if (newX >= 0 && newX < this.w && newY >= 0 && newY < this.h && this.g[newY][newX].traversible) {
        neighbors.push([newX, newY]);
      }
    }

    return neighbors;
  }
}
