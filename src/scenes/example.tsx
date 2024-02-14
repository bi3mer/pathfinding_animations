import { Circle, makeScene2D } from '@motion-canvas/2d';
import { all, createRef } from '@motion-canvas/core';


class Node {
  x: number
  y: number
  id: number
  connectsTo: number[]

  constructor(x: number, y: number, id: number) {
    this.x = x;
    this.y = y;
    this.id = id;
    this.connectsTo = [];
  }
}


const WIDTH = 5;
const HEIGHT = 5;

export default makeScene2D(function*(view) {
  // build nodes
  let nodes: Node[] = [];
  let id = 0;

  for (let y = 0; y < HEIGHT; ++y) {
    for (let x = 0; x < WIDTH; ++x) {
      nodes.push(new Node(x, y, id));
      ++id;
    }
  }

  const circle = createRef<Circle>();

  view.add(<Circle ref={circle} size={320} fill={'lightseagreen'} />);

  yield* circle().scale(2, 2).to(1, 2);
});
