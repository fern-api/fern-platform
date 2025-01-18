import { isHastElement } from "../../hast-utils";
import { isMdxJsxAttribute, isMdxJsxElementHast } from "../../mdx-utils";
import { toTree } from "../../parse";

describe("rehype-slug", () => {
  it("should add ids to headings", () => {
    const tree = toTree(`
      # Hello
      ## World [#overridden]
      ### Testing {#capture-the-slug}
    `);
    const children = tree.hast.children.filter(isHastElement);
    expect(children[0]?.tagName === "h1" && children[0]?.properties.id).toBe(
      "hello"
    );
    expect(children[1]?.tagName === "h2" && children[1]?.properties.id).toBe(
      "overridden"
    );
    expect(children[2]?.tagName === "h3" && children[2]?.properties.id).toBe(
      "capture-the-slug"
    );
  });

  it("should add ids to headings with a prefix", () => {
    const tree = toTree(`
        <h1>Hello</h1>
        <h2 id="overridden">World</h2>
      `);
    const children = tree.hast.children.filter(isMdxJsxElementHast);
    expect(
      children[0]?.name === "h1" &&
        children[0]?.attributes
          .filter(isMdxJsxAttribute)
          .find((a) => a.name === "id")?.value
    ).toBe("hello");
    expect(
      children[1]?.name === "h2" &&
        children[1]?.attributes
          .filter(isMdxJsxAttribute)
          .find((a) => a.name === "id")?.value
    ).toBe("overridden");
  });

  it("should increment slugger for repeated headings", () => {
    const tree = toTree(`
      <h1 id={"hello"}>Testing</h1>
      # Hello
      ## Hello world {#hello}
      <h2>Hello</h2>
    `);
    expect(tree.hast).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "attributes": [
              {
                "name": "id",
                "position": {
                  "end": {
                    "column": 23,
                    "line": 2,
                    "offset": 23,
                  },
                  "start": {
                    "column": 11,
                    "line": 2,
                    "offset": 11,
                  },
                },
                "type": "mdxJsxAttribute",
                "value": {
                  "data": {
                    "estree": {
                      "body": [
                        {
                          "end": 22,
                          "expression": {
                            "end": 22,
                            "loc": {
                              "end": {
                                "column": 21,
                                "line": 2,
                                "offset": 22,
                              },
                              "start": {
                                "column": 14,
                                "line": 2,
                                "offset": 15,
                              },
                            },
                            "range": [
                              15,
                              22,
                            ],
                            "raw": ""hello"",
                            "start": 15,
                            "type": "Literal",
                            "value": "hello",
                          },
                          "loc": {
                            "end": {
                              "column": 21,
                              "line": 2,
                              "offset": 22,
                            },
                            "start": {
                              "column": 14,
                              "line": 2,
                              "offset": 15,
                            },
                          },
                          "range": [
                            15,
                            22,
                          ],
                          "start": 15,
                          "type": "ExpressionStatement",
                        },
                      ],
                      "comments": [],
                      "end": 22,
                      "loc": {
                        "end": {
                          "column": 21,
                          "line": 2,
                          "offset": 22,
                        },
                        "start": {
                          "column": 14,
                          "line": 2,
                          "offset": 15,
                        },
                      },
                      "range": [
                        15,
                        22,
                      ],
                      "sourceType": "module",
                      "start": 15,
                      "type": "Program",
                    },
                  },
                  "type": "mdxJsxAttributeValueExpression",
                  "value": ""hello"",
                },
              },
            ],
            "children": [
              {
                "position": {
                  "end": {
                    "column": 31,
                    "line": 2,
                    "offset": 31,
                  },
                  "start": {
                    "column": 24,
                    "line": 2,
                    "offset": 24,
                  },
                },
                "type": "text",
                "value": "Testing",
              },
            ],
            "data": {
              "_mdxExplicitJsx": true,
            },
            "name": "h1",
            "position": {
              "end": {
                "column": 36,
                "line": 2,
                "offset": 36,
              },
              "start": {
                "column": 7,
                "line": 2,
                "offset": 7,
              },
            },
            "type": "mdxJsxFlowElement",
          },
          {
            "type": "text",
            "value": "
      ",
          },
          {
            "children": [
              {
                "position": {
                  "end": {
                    "column": 14,
                    "line": 3,
                    "offset": 50,
                  },
                  "start": {
                    "column": 9,
                    "line": 3,
                    "offset": 45,
                  },
                },
                "type": "text",
                "value": "Hello",
              },
            ],
            "position": {
              "end": {
                "column": 14,
                "line": 3,
                "offset": 50,
              },
              "start": {
                "column": 7,
                "line": 3,
                "offset": 43,
              },
            },
            "properties": {
              "id": "hello-1",
            },
            "tagName": "h1",
            "type": "element",
          },
          {
            "type": "text",
            "value": "
      ",
          },
          {
            "children": [
              {
                "position": {
                  "end": {
                    "column": 31,
                    "line": 4,
                    "offset": 81,
                  },
                  "start": {
                    "column": 10,
                    "line": 4,
                    "offset": 60,
                  },
                },
                "type": "text",
                "value": "Hello world",
              },
            ],
            "position": {
              "end": {
                "column": 31,
                "line": 4,
                "offset": 81,
              },
              "start": {
                "column": 7,
                "line": 4,
                "offset": 57,
              },
            },
            "properties": {
              "id": "hello",
            },
            "tagName": "h2",
            "type": "element",
          },
          {
            "type": "text",
            "value": "
      ",
          },
          {
            "attributes": [
              {
                "name": "id",
                "type": "mdxJsxAttribute",
                "value": "hello-2",
              },
            ],
            "children": [
              {
                "position": {
                  "end": {
                    "column": 16,
                    "line": 5,
                    "offset": 97,
                  },
                  "start": {
                    "column": 11,
                    "line": 5,
                    "offset": 92,
                  },
                },
                "type": "text",
                "value": "Hello",
              },
            ],
            "data": {
              "_mdxExplicitJsx": true,
            },
            "name": "h2",
            "position": {
              "end": {
                "column": 21,
                "line": 5,
                "offset": 102,
              },
              "start": {
                "column": 7,
                "line": 5,
                "offset": 88,
              },
            },
            "type": "mdxJsxFlowElement",
          },
        ],
        "position": {
          "end": {
            "column": 5,
            "line": 6,
            "offset": 107,
          },
          "start": {
            "column": 1,
            "line": 1,
            "offset": 0,
          },
        },
        "type": "root",
      }
    `);
  });
});
