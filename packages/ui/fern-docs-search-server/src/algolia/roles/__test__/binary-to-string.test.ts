import { binaryStringToHex } from "../role-utils";

describe("binaryStringToHex", () => {
    it("converts single digit binary to hex", () => {
        expect(binaryStringToHex("1")).toBe("1");
        expect(binaryStringToHex("0")).toBe("0");
    });

    it("converts 4-bit binary to hex", () => {
        expect(binaryStringToHex("1010")).toBe("a");
        expect(binaryStringToHex("1111")).toBe("f");
    });

    it("converts 8-bit binary to hex", () => {
        expect(binaryStringToHex("11111111")).toBe("ff");
        expect(binaryStringToHex("10101010")).toBe("aa");
    });

    it("pads binary strings correctly", () => {
        expect(binaryStringToHex("1")).toBe("1");
        expect(binaryStringToHex("11")).toBe("3");
        expect(binaryStringToHex("111")).toBe("7");
    });

    it("handles empty string", () => {
        expect(binaryStringToHex("")).toBe("0");
    });
});
