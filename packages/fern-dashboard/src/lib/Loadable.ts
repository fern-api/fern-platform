export type Loadable<T> =
  | { type: "notStartedLoading" }
  | { type: "loading" }
  | { type: "loaded"; value: T };
