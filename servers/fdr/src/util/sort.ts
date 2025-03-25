export function sort<T>(items: T[], cmp: (a: T, b: T) => number) {
  const itemsCopy = [...items];
  itemsCopy.sort(cmp);
  return itemsCopy;
}
