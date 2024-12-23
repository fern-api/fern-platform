import { isExampleSseResponseBody } from "../isExampleSseResponseBody";

describe("isExampleSseResponseBody", () => {
  it("should return true if input has stream property with array of SSE events", () => {
    const input = {
      stream: [{ event: "event1" }, { event: "event2" }],
    };
    expect(isExampleSseResponseBody(input)).toBe(true);
  });

  it("should return false if input is null", () => {
    expect(isExampleSseResponseBody(null)).toBe(false);
  });

  it("should return false if input is undefined", () => {
    expect(isExampleSseResponseBody(undefined)).toBe(false);
  });

  it("should return false if input is not an object", () => {
    expect(isExampleSseResponseBody("not an object")).toBe(false);
  });

  it("should return false if input does not have stream property", () => {
    const input = { notStream: [] };
    expect(isExampleSseResponseBody(input)).toBe(false);
  });

  it("should return false if stream property is not an array", () => {
    const input = { stream: "not an array" };
    expect(isExampleSseResponseBody(input)).toBe(false);
  });

  it("should return false if stream array contains non-SSE events", () => {
    const input = {
      stream: [{ event: "valid" }, { notEvent: "invalid" }],
    };
    expect(isExampleSseResponseBody(input)).toBe(false);
  });
});
