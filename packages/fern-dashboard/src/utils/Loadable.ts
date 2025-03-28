export type Loadable<T> =
  | { type: "notStartedLoading" }
  | { type: "loading" }
  | { type: "loaded"; value: T };

export function mapLoadable<T, U>(
  loadable: Loadable<T>,
  map: (value: T) => U
): Loadable<U> {
  if (loadable.type !== "loaded") {
    return loadable;
  }
  return {
    type: "loaded",
    value: map(loadable.value),
  };
}

export function unwrapLoadable<T>(loadable: Loadable<T>): T | undefined {
  if (loadable.type === "loaded") {
    return loadable.value;
  }
  return undefined;
}
