import { sanitizeMdxExpression } from "../sanitize-mdx-expression.js";

describe("sanitizeMdxExpression", () => {
    it("should escape base cases", () => {
        expect(sanitizeMdxExpression("{")).toBe("\\{");
        expect(sanitizeMdxExpression("<")).toBe("\\<");
        expect(sanitizeMdxExpression("{{")).toBe("\\{\\{");
        expect(sanitizeMdxExpression("<<")).toBe("\\<\\<");

        expect(sanitizeMdxExpression("{a}{")).toBe("{a}\\{");
        expect(sanitizeMdxExpression("<a><</a>")).toBe("<a>\\<</a>");
        expect(sanitizeMdxExpression("{{a}")).toBe("\\{{a}");
        expect(sanitizeMdxExpression("{a{}")).toBe("\\{a{}");
        expect(sanitizeMdxExpression("<a<")).toBe("\\<a\\<");

        expect(sanitizeMdxExpression("</")).toBe("\\</");
        expect(sanitizeMdxExpression("<a")).toBe("\\<a");
        expect(sanitizeMdxExpression("<a:")).toBe("\\<a:");
        expect(sanitizeMdxExpression("<a.")).toBe("\\<a.");
        expect(sanitizeMdxExpression("<a b")).toBe("\\<a b");
        expect(sanitizeMdxExpression("<a b:")).toBe("\\<a b:");
        expect(sanitizeMdxExpression("<a b=")).toBe("\\<a b=");
        expect(sanitizeMdxExpression('<a b="')).toBe('\\<a b="');
        expect(sanitizeMdxExpression("<a b='")).toBe("\\<a b='");
        expect(sanitizeMdxExpression("<a b={")).toBe("\\<a b=\\{");
        expect(sanitizeMdxExpression("<a/")).toBe("\\<a/");
        expect(sanitizeMdxExpression("<.>")).toBe("\\<.>");
        expect(sanitizeMdxExpression("</.>")).toBe("\\</.>");
        expect(sanitizeMdxExpression("<a?>")).toBe("\\<a?>");
        expect(sanitizeMdxExpression("<a:+>")).toBe("\\<a:+>");
        expect(sanitizeMdxExpression("<a./>")).toBe("\\<a./>");
        expect(sanitizeMdxExpression("<a b!>")).toBe("\\<a b!>");
        expect(sanitizeMdxExpression("<a b:1>")).toBe("\\<a b:1>");
        expect(sanitizeMdxExpression("<a b=>")).toBe("\\<a b=>");
        expect(sanitizeMdxExpression("<a/->")).toBe("\\<a/->");
        expect(sanitizeMdxExpression("> <a\nb>")).toBe("> \\<a\nb>");

        expect(sanitizeMdxExpression("a { b")).toBe("a \\{ b");
        expect(sanitizeMdxExpression("> {a\nb}")).toBe("> \\{a\nb}");
        expect(sanitizeMdxExpression("<a {b=c}={} d>")).toBe("\\<a \\{b=c}=\\{} d>");
        expect(sanitizeMdxExpression("<a {...b,c} d>")).toBe("\\<a \\{...b,c} d>");
        expect(sanitizeMdxExpression("a { b { c } d")).toBe("a \\{ b { c } d");
        expect(sanitizeMdxExpression('a {"b" "c"} d')).toBe('a \\{"b" "c"} d');
        expect(sanitizeMdxExpression('a {var b = "c"} d')).toBe('a \\{var b = "c"} d');
    });

    it("should escape only the part of the line that contains the error", () => {
        expect(sanitizeMdxExpression("a { b { c } d e")).toBe("a \\{ b { c } d e");
        expect(sanitizeMdxExpression("<Something {...props>")).toBe("\\<Something \\{...props>");
        expect(sanitizeMdxExpression("<Something {...props} d>")).toBe("\\<Something \\{...props} d>");
        expect(sanitizeMdxExpression("<Something {...props} />")).toBe("<Something {...props} />");
        expect(sanitizeMdxExpression("<Something></Something>")).toBe("<Something></Something>");
        expect(sanitizeMdxExpression("<Something>{b</Something>")).toBe("<Something>\\{b</Something>");
        expect(sanitizeMdxExpression("<Something>{b}</Something>")).toBe("<Something>{b}</Something>");
        expect(sanitizeMdxExpression("<Something>{b + a}</Something>")).toBe("<Something>{b + a}</Something>");

        expect(sanitizeMdxExpression("This is a test. a < b, but b > c. {c}")).toBe(
            "This is a test. a < b, but b > c. {c}",
        );

        expect(sanitizeMdxExpression("This is a test. a <= b, but b > c. {c} d")).toBe(
            "This is a test. a \\<= b, but b > c. {c} d",
        );
    });

    it("should handle complex cases", () => {
        expect(
            sanitizeMdxExpression("previous billing period) Ex. January {M1:{VM:VM0}}, February"),
        ).toMatchInlineSnapshot('"previous billing period) Ex. January \\{M1:\\{VM:VM0}}, February"');
        expect(
            sanitizeMdxExpression("from the previous month Ex. January15 {M1:{VM:VM0,on, 4}} February15"),
        ).toMatchInlineSnapshot('"from the previous month Ex. January15 \\{M1:\\{VM:VM0,on, 4}} February15"');
        expect(
            sanitizeMdxExpression("{ M1:2, M1:4 } => {M1:6} 2] Minimum - min of all the values for the"),
        ).toMatchInlineSnapshot('"\\{ M1:2, M1:4 } => \\{M1:6} 2] Minimum - min of all the values for the"');
    });

    it("should avoid escaping math expressions", () => {
        expect(sanitizeMdxExpression("$$x^2$$")).toBe("$$x^2$$");
        expect(sanitizeMdxExpression("$${x^2}$$")).toBe("$${x^2}$$");
    });
});
