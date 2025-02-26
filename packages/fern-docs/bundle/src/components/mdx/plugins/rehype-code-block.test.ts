import { migrateMeta } from "./rehype-code-block";

describe("migrateMeta", () => {
  it("should migrate numerical ranges", () => {
    expect(migrateMeta("{1-3}")).toBe("highlight={[1,2,3]}");
    expect(migrateMeta(" {1-3}")).toBe("highlight={[1,2,3]}");
  });

  it("should migrate focus=...", () => {
    expect(migrateMeta("focus={1-2,4-5}")).toBe("focus={[1,2,4,5]}");
  });

  it("should migrate test=123 to test={123}", () => {
    expect(migrateMeta("test=123")).toBe("test={123}");
  });

  it("should migrate title=...", () => {
    expect(migrateMeta("title=abcd")).toBe('title="abcd"');
  });

  it("should migrate a full text string", () => {
    expect(migrateMeta("title=abcd test=123 focus={1-2,4-5}")).toBe(
      'title="abcd" test={123} focus={[1,2,4,5]}'
    );
  });

  it("should treat a plaintext string as a title", () => {
    expect(migrateMeta("this is a long string")).toBe(
      'title="this is a long string"'
    );
  });

  it("should migrate anything else as a title", () => {
    expect(
      migrateMeta(
        'this thing has = and { and " so it should be wrapped in title'
      )
    ).toBe(
      'title="this thing has = and { and \\" so it should be wrapped in title"'
    );
  });

  it("should migrate meta", () => {
    expect(migrateMeta("generators.yml {7-12}")).toMatchInlineSnapshot(`"title="generators.yml" highlight={[7,8,9,10,11,12]}"`);
  });
});
