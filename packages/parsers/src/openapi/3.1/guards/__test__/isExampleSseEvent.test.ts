import { isExampleSseEvent } from "../isExampleSseEvent";

describe("isExampleSseEvent", () => {
  it("should return true if input has event property", () => {
    const input = { event: "some-event" };
    expect(isExampleSseEvent(input)).toBe(true);
  });

  it("should return false if input is null", () => {
    expect(isExampleSseEvent(null)).toBe(false);
  });

  it("should return false if input is undefined", () => {
    expect(isExampleSseEvent(undefined)).toBe(false);
  });

  it("should return false if input is not an object", () => {
    expect(isExampleSseEvent("not an object")).toBe(false);
  });

  it("should return false if input does not have event property", () => {
    const input = { notEvent: "some-event" };
    expect(isExampleSseEvent(input)).toBe(false);
  });
});
