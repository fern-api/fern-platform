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
    expect(migrateMeta("generators.yml {7-12}")).toMatchInlineSnapshot(
      `"title="generators.yml" highlight={[7,8,9,10,11,12]}"`
    );
  });

  it("should migrate title at the end of theline", () => {
    expect(migrateMeta("{7-12} generators.yml")).toMatchInlineSnapshot(
      `"highlight={[7,8,9,10,11,12]} title="generators.yml" "`
    );
  });

  it("should not migrate meaningless content", () => {
    expect(
      migrateMeta("{metadata_that_means_nothing=true}")
    ).toMatchInlineSnapshot(`"{metadata_that_means_nothing=true}"`);
  });

  it("should leave meaningless content and migrate a title", () => {
    expect(
      migrateMeta("python.py {metadata_that_means_nothing=true}")
    ).toMatchInlineSnapshot(
      `" title="python.py" {metadata_that_means_nothing=true}"`
    );
  });

  it("should remove wordWrap if it is next to the title", () => {
    expect(migrateMeta("Python wordWrap maxLines=100")).toMatchInlineSnapshot(
      `"title="Python" wordWrap maxLines={100}"`
    );
  });

  it("should remove wordWrap if that is the only word", () => {
    expect(migrateMeta("wordWrap")).toMatchInlineSnapshot(`"wordWrap"`);
  });

  it("should remove wordWrap if it is next to just a title", () => {
    expect(migrateMeta("wordWrap myFile.txt")).toMatchInlineSnapshot(
      `"wordWrap title="myFile.txt""`
    );
  });

  it("should respect the for meta property", () => {
    expect(migrateMeta(`"a title" for="npm"`)).toMatchInlineSnapshot(
      `"title="a title" for="npm""`
    );
  });

  it("should respect the for meta property even if no title is present", () => {
    expect(migrateMeta(`for="npm"`)).toMatchInlineSnapshot(`"for="npm""`);
  });
});
