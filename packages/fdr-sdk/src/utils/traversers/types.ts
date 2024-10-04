export const SKIP = "skip" as const;
export const STOP = false;
export const CONTINUE = true;

export type Next = typeof CONTINUE | typeof SKIP | typeof STOP | void;

export type TraverserVisit<N, P extends N = N> = (node: N, parents: readonly P[]) => Next;
export type TraverserGetChildren<N, P extends N = N> = (parent: P) => readonly N[];
