import { Cache } from "../../Cache";

describe("Cache", () => {
  it("should be able to set and get values", () => {
    const cache = new Cache<string>(10);
    cache.set("key1", "value1");
    cache.set("key2", "value2");
    expect(cache.get("key1")).toBe("value1");
    expect(cache.get("key2")).toBe("value2");
    cache.set("key1", "value3");
    expect(cache.get("key1")).toBe("value3");
    expect(cache.get("key2")).toBe("value2");
  });

  it("should be able to delete the oldest keys", () => {
    const cache = new Cache<string>(2);
    cache.set("key1", "value1");
    cache.set("key2", "value2");
    cache.set("key3", "value3");
    expect(cache.get("key1")).toBe(undefined);
    expect(cache.get("key2")).toBe("value2");
    expect(cache.get("key3")).toBe("value3");
  });

  it("should be able to delete keys based on ttl", () => {
    vitest.useFakeTimers();
    const cache = new Cache<string>(10, 1);
    cache.set("key1", "value1");
    vitest.advanceTimersByTime(1000);
    cache.set("key2", "value2");
    expect(cache.get("key1")).toBe(undefined);
    expect(cache.get("key2")).toBe("value2");
  });

  it("should be able to delete keys based on ttl and max keys", () => {
    vitest.useFakeTimers();
    const cache = new Cache<string>(2, 1);
    cache.set("key1", "value1");
    cache.set("key2", "value2");
    vitest.advanceTimersByTime(1000);
    cache.set("key3", "value3");
    expect(cache.get("key1")).toBe(undefined);
    expect(cache.get("key2")).toBe(undefined);
    expect(cache.get("key3")).toBe("value3");
  });
});
