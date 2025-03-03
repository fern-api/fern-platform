import { toTree } from "../parse";
import { makeToc } from "../toc";

describe("toc", () => {
  it("should create a toc", () => {
    const toc = makeToc(toTree(`# Hello world`).hast);
    expect(toc).toEqual([
      {
        simpleString: "Hello world",
        anchorString: "hello-world",
        children: [],
      },
    ]);
  });

  it("should create a toc with a nested heading", () => {
    const toc = makeToc(toTree(`# Hello world\n\n## Nested heading`).hast);
    expect(toc).toEqual([
      {
        simpleString: "Hello world",
        anchorString: "hello-world",
        children: [
          {
            simpleString: "Nested heading",
            anchorString: "nested-heading",
            children: [],
          },
        ],
      },
    ]);
  });

  it("should create a toc with feature flags", () => {
    const toc = makeToc(
      toTree(
        `<Feature flag="test" fallbackValue="false" match="true">\n# Hello world\n</Feature>`
      ).hast
    );
    expect(toc).toEqual([
      {
        simpleString: "Hello world",
        anchorString: "hello-world",
        featureFlags: [
          {
            flag: "test",
            fallbackValue: "false",
            match: "true",
          },
        ],
        children: [],
      },
    ]);
  });

  it("should accept string literals wrapped in expressions", () => {
    const toc = makeToc(
      toTree(
        `<Feature flag="test" fallbackValue={"false"} match={"true"}>\n# Hello world\n</Feature>`
      ).hast
    );
    expect(toc).toEqual([
      {
        simpleString: "Hello world",
        anchorString: "hello-world",
        children: [],
        featureFlags: [
          {
            flag: "test",
            fallbackValue: "false",
            match: "true",
          },
        ],
      },
    ]);
  });

  it("should accept boolean literals wrapped in expressions", () => {
    const toc = makeToc(
      toTree(
        `<Feature flag="test" fallbackValue={true} match={false}>\n# Hello world\n</Feature>`
      ).hast
    );
    expect(toc).toEqual([
      {
        simpleString: "Hello world",
        anchorString: "hello-world",
        children: [],
        featureFlags: [
          {
            flag: "test",
            fallbackValue: true,
            match: false,
          },
        ],
      },
    ]);
  });
});
