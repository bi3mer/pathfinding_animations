export class PathRecord {
  x: number
  y: number
  prev: PathRecord | null
  costSoFar: number
  estimatedCost: number

  constructor(x: number, y: number, prev: PathRecord | null, costSoFar: number, estimatedCost = 0) {
    this.x = x;
    this.y = y;
    this.prev = prev;
    this.costSoFar = costSoFar;
    this.estimatedCost = estimatedCost;
  }
}

export class PathFindingList {
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
    return this.list.pop()!;
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
