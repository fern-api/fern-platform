import { isExampleResponseBody } from "../isExampleResponseBody";

describe("isExampleResponseBody", () => {
<<<<<<< HEAD
    it("should return true if input has error property", () => {
        const input = { error: "some error" };
        expect(isExampleResponseBody(input)).toBe(true);
    });

    it("should return true if input has body property", () => {
        const input = { body: "some body" };
        expect(isExampleResponseBody(input)).toBe(true);
    });

    it("should return false if input is null", () => {
        expect(isExampleResponseBody(null)).toBe(false);
    });

    it("should return false if input is undefined", () => {
        expect(isExampleResponseBody(undefined)).toBe(false);
    });

    it("should return false if input is not an object", () => {
        expect(isExampleResponseBody("not an object")).toBe(false);
    });

    it("should return false if input has neither error nor body property", () => {
        const input = { something: "else" };
        expect(isExampleResponseBody(input)).toBe(false);
    });
=======
  it("should return true if input has error property", () => {
    const input = { error: "some error" };
    expect(isExampleResponseBody(input)).toBe(true);
  });

  it("should return true if input has body property", () => {
    const input = { body: "some body" };
    expect(isExampleResponseBody(input)).toBe(true);
  });

  it("should return false if input is null", () => {
    expect(isExampleResponseBody(null)).toBe(false);
  });

  it("should return false if input is undefined", () => {
    expect(isExampleResponseBody(undefined)).toBe(false);
  });

  it("should return false if input is not an object", () => {
    expect(isExampleResponseBody("not an object")).toBe(false);
  });

  it("should return false if input has neither error nor body property", () => {
    const input = { something: "else" };
    expect(isExampleResponseBody(input)).toBe(false);
  });
>>>>>>> main
});
