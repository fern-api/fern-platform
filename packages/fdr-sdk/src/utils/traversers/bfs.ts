import { SKIP, STOP, TraverserGetChildren, TraverserVisit } from "./types";

export function bfs<N, P extends N = N>(
  root: N,
  visit: TraverserVisit<N, P>,
  getChildren: TraverserGetChildren<N, P>,
  isParent: (node: N) => node is P = (node): node is P => true
): void {
  const queue: [N, P[]][] = [[root, []]];
  while (queue.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [node, parents] = queue.shift()!;
    const next = visit(node, parents);

    if (next === SKIP) {
      continue;
    } else if (next === STOP) {
      return;
    }

    if (isParent(node)) {
      for (const child of [...getChildren(node)]) {
        queue.push([child, [...parents, node]]);
      }
    }
  }
}
