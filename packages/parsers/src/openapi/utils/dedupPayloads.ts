export function dedupPayloads<T>(payloads: T[] | undefined): T[] | undefined {
  const filtered = payloads?.filter(
    (payload, index, array) =>
      index ===
      array.findIndex((p) => JSON.stringify(p) === JSON.stringify(payload))
  );

  return filtered != null && filtered.length > 0 ? filtered : undefined;
}
