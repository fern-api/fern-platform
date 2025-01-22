import { sanitizeMdxExpression } from "../sanitize-mdx-expression";

describe("sanitizeMdxExpression", () => {
  it("should escape base cases", () => {
    expect(sanitizeMdxExpression("{")).toStrictEqual(["\\{", true]);
    expect(sanitizeMdxExpression("<")).toStrictEqual(["\\<", true]);
    expect(sanitizeMdxExpression("{{")).toStrictEqual(["\\{\\{", true]);
    expect(sanitizeMdxExpression("<<")).toStrictEqual(["\\<\\<", true]);

    expect(sanitizeMdxExpression("{a}{")).toStrictEqual(["{a}\\{", true]);
    expect(sanitizeMdxExpression("<a><</a>")).toStrictEqual([
      "<a>\\<</a>",
      true,
    ]);
    expect(sanitizeMdxExpression("{{a}")).toStrictEqual(["\\{{a}", true]);
    expect(sanitizeMdxExpression("{a{}")).toStrictEqual(["\\{a{}", true]);
    expect(sanitizeMdxExpression("<a<")).toStrictEqual(["\\<a\\<", true]);

    expect(sanitizeMdxExpression("</")).toStrictEqual(["\\</", true]);
    expect(sanitizeMdxExpression("<a")).toStrictEqual(["\\<a", true]);
    expect(sanitizeMdxExpression("<a:")).toStrictEqual(["\\<a:", true]);
    expect(sanitizeMdxExpression("<a.")).toStrictEqual(["\\<a.", true]);
    expect(sanitizeMdxExpression("<a b")).toStrictEqual(["\\<a b", true]);
    expect(sanitizeMdxExpression("<a b:")).toStrictEqual(["\\<a b:", true]);
    expect(sanitizeMdxExpression("<a b=")).toStrictEqual(["\\<a b=", true]);
    expect(sanitizeMdxExpression('<a b="')).toStrictEqual(['\\<a b="', true]);
    expect(sanitizeMdxExpression("<a b='")).toStrictEqual(["\\<a b='", true]);
    expect(sanitizeMdxExpression("<a b={")).toStrictEqual(["\\<a b=\\{", true]);
    expect(sanitizeMdxExpression("<a/")).toStrictEqual(["\\<a/", true]);
    expect(sanitizeMdxExpression("<.>")).toStrictEqual(["\\<.>", true]);
    expect(sanitizeMdxExpression("</.>")).toStrictEqual(["\\</.>", true]);
    expect(sanitizeMdxExpression("<a?>")).toStrictEqual(["\\<a?>", true]);
    expect(sanitizeMdxExpression("<a:+>")).toStrictEqual(["\\<a:+>", true]);
    expect(sanitizeMdxExpression("<a./>")).toStrictEqual(["\\<a./>", true]);
    expect(sanitizeMdxExpression("<a b!>")).toStrictEqual(["\\<a b!>", true]);
    expect(sanitizeMdxExpression("<a b:1>")).toStrictEqual(["\\<a b:1>", true]);
    expect(sanitizeMdxExpression("<a b=>")).toStrictEqual(["\\<a b=>", true]);
    expect(sanitizeMdxExpression("<a/->")).toStrictEqual(["\\<a/->", true]);
    expect(sanitizeMdxExpression("> <a\nb>")).toStrictEqual([
      "> \\<a\nb>",
      true,
    ]);

    expect(sanitizeMdxExpression("a { b")).toStrictEqual(["a \\{ b", true]);
    expect(sanitizeMdxExpression("> {a\nb}")).toStrictEqual([
      "> \\{a\nb}",
      true,
    ]);
    expect(sanitizeMdxExpression("<a {b=c}={} d>")).toStrictEqual([
      "\\<a \\{b=c}=\\{} d>",
      true,
    ]);
    expect(sanitizeMdxExpression("<a {...b,c} d>")).toStrictEqual([
      "\\<a \\{...b,c} d>",
      true,
    ]);
    expect(sanitizeMdxExpression("a { b { c } d")).toStrictEqual([
      "a \\{ b { c } d",
      true,
    ]);
    expect(sanitizeMdxExpression('a {"b" "c"} d')).toStrictEqual([
      'a \\{"b" "c"} d',
      true,
    ]);
    expect(sanitizeMdxExpression('a {var b = "c"} d')).toStrictEqual([
      'a \\{var b = "c"} d',
      true,
    ]);
  });

  it("should escape only the part of the line that contains the error", () => {
    expect(sanitizeMdxExpression("a { b { c } d e")).toStrictEqual([
      "a \\{ b { c } d e",
      true,
    ]);
    expect(sanitizeMdxExpression("<Something {...props>")).toStrictEqual([
      "\\<Something \\{...props>",
      true,
    ]);
    expect(sanitizeMdxExpression("<Something {...props} d>")).toStrictEqual([
      "&lt;Something \\{...props} d&gt;",
      true,
    ]);
    expect(sanitizeMdxExpression("<Something {...props} />")).toStrictEqual([
      "<Something {...props} />",
      true,
    ]);
    expect(sanitizeMdxExpression("<Something></Something>")).toStrictEqual([
      "<Something></Something>",
      true,
    ]);
    expect(sanitizeMdxExpression("<Something>{b</Something>")).toStrictEqual([
      "<Something>\\{b</Something>",
      true,
    ]);
    expect(sanitizeMdxExpression("<Something>{b}</Something>")).toStrictEqual([
      "<Something>{b}</Something>",
      true,
    ]);
    expect(
      sanitizeMdxExpression("<Something>{b + a}</Something>")
    ).toStrictEqual(["<Something>{b + a}</Something>", true]);

    expect(
      sanitizeMdxExpression("This is a test. a < b, but b > c. {c}")
    ).toStrictEqual(["This is a test. a < b, but b > c. {c}", true]);

    expect(
      sanitizeMdxExpression("This is a test. a <= b, but b > c. {c} d")
    ).toStrictEqual(["This is a test. a \\<= b, but b > c. {c} d", true]);
  });

  it("should handle complex cases", () => {
    expect(
      sanitizeMdxExpression(
        "previous billing period) Ex. January {M1:{VM:VM0}}, February"
      )
    ).toStrictEqual([
      "previous billing period) Ex. January \\{M1:\\{VM:VM0}}, February",
      true,
    ]);
    expect(
      sanitizeMdxExpression(
        "from the previous month Ex. January15 {M1:{VM:VM0,on, 4}} February15"
      )
    ).toStrictEqual([
      "from the previous month Ex. January15 \\{M1:\\{VM:VM0,on, 4}} February15",
      true,
    ]);
    expect(
      sanitizeMdxExpression(
        "{ M1:2, M1:4 } => {M1:6} 2] Minimum - min of all the values for the"
      )
    ).toMatchInlineSnapshot([
      "\\{ M1:2, M1:4 } => \\{M1:6} 2] Minimum - min of all the values for the",
      true,
    ]);
  });

  it("should avoid escaping math expressions", () => {
    expect(sanitizeMdxExpression("$$x^2$$")).toStrictEqual(["$$x^2$$", true]);
    expect(sanitizeMdxExpression("$${x^2}$$")).toStrictEqual([
      "$${x^2}$$",
      true,
    ]);
  });

  it("should handle end-tag-mismatch", () => {
    expect(sanitizeMdxExpression("<a>")).toStrictEqual(["&lt;a&gt;", true]);

    expect(
      sanitizeMdxExpression(
        "This is the JSON that can be generated in the Google Cloud Console at https://console.cloud.google.com/iam-admin/serviceaccounts/details/<service-account-id>/keys."
      )
    ).toStrictEqual([
      "This is the JSON that can be generated in the Google Cloud Console at https://console.cloud.google.com/iam-admin/serviceaccounts/details/&lt;service-account-id&gt;/keys.",
      true,
    ]);
  });
});
