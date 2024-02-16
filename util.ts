import { PathRecord } from "./pathfindingList";

export function manhattan(src: [number, number], tgt: [number, number]): number {
  return Math.abs(tgt[0] - src[0]) + Math.abs(tgt[1] - src[1]);
}

export function reversePath(r: PathRecord | null): [number, number][] {
  let path: [number, number][] = []
  while (r !== null) {
    path.push([r.x, r.y])
    r = r.prev;
  }
  path.reverse();

  return path;
}
