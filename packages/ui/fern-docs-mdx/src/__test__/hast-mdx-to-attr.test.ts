import { h } from "hastscript";
import { hastMdxJsxElementHastToProps } from "../hast-utils/hast-mdx-to-props";
import { unknownToMdxJsxAttributeValue } from "../mdx-utils/unknown-to-mdx-jsx-attr";

describe("hast-mdx-to-attr", () => {
    const { props } = hastMdxJsxElementHastToProps({
        type: "mdxJsxTextElement",
        name: "Testing",
        attributes: [{ type: "mdxJsxAttribute", name: "test", value: "test" }],
        children: [
            h("h2", { type: "text", value: "Hello world" }),
            { type: "text", value: "This should be wrapped in a <p> tag" },
        ],
    });

    it("should convert hast to mdx jsx attribute", () => {
        expect(props).toMatchInlineSnapshot(`
          {
            "children": {
              "data": {
                "estree": {
                  "body": [
                    {
                      "expression": {
                        "children": [
                          {
                            "children": [],
                            "closingElement": null,
                            "openingElement": {
                              "attributes": [
                                {
                                  "name": {
                                    "name": "type",
                                    "type": "JSXIdentifier",
                                  },
                                  "type": "JSXAttribute",
                                  "value": {
                                    "type": "Literal",
                                    "value": "text",
                                  },
                                },
                                {
                                  "name": {
                                    "name": "value",
                                    "type": "JSXIdentifier",
                                  },
                                  "type": "JSXAttribute",
                                  "value": {
                                    "type": "Literal",
                                    "value": "Hello world",
                                  },
                                },
                              ],
                              "name": {
                                "name": "h2",
                                "type": "JSXIdentifier",
                              },
                              "selfClosing": true,
                              "type": "JSXOpeningElement",
                            },
                            "type": "JSXElement",
                          },
                          {
                            "children": [],
                            "closingElement": null,
                            "openingElement": {
                              "attributes": [
                                {
                                  "name": {
                                    "name": "type",
                                    "type": "JSXIdentifier",
                                  },
                                  "type": "JSXAttribute",
                                  "value": {
                                    "type": "Literal",
                                    "value": "text",
                                  },
                                },
                                {
                                  "name": {
                                    "name": "value",
                                    "type": "JSXIdentifier",
                                  },
                                  "type": "JSXAttribute",
                                  "value": {
                                    "type": "Literal",
                                    "value": "This should be wrapped in a <p> tag",
                                  },
                                },
                              ],
                              "name": {
                                "name": "p",
                                "type": "JSXIdentifier",
                              },
                              "selfClosing": true,
                              "type": "JSXOpeningElement",
                            },
                            "type": "JSXElement",
                          },
                        ],
                        "closingFragment": {
                          "type": "JSXClosingFragment",
                        },
                        "openingFragment": {
                          "type": "JSXOpeningFragment",
                        },
                        "type": "JSXFragment",
                      },
                      "type": "ExpressionStatement",
                    },
                  ],
                  "comments": [],
                  "sourceType": "module",
                  "type": "Program",
                },
              },
              "type": "mdxJsxAttributeValueExpression",
              "value": "__children__",
            },
            "test": "test",
          }
        `);
    });

    it("should preserve original object", () => {
        const test = unknownToMdxJsxAttributeValue(props.children);
        expect(test).not.toBe(props);
    });

    it("should convert to mdx jsx attribute", () => {
        const test = unknownToMdxJsxAttributeValue(props);
        expect(test).toMatchInlineSnapshot(`
          {
            "data": {
              "estree": {
                "body": [
                  {
                    "expression": {
                      "properties": [
                        {
                          "computed": false,
                          "key": {
                            "type": "Literal",
                            "value": "test",
                          },
                          "kind": "init",
                          "method": false,
                          "shorthand": false,
                          "type": "Property",
                          "value": {
                            "type": "Literal",
                            "value": "test",
                          },
                        },
                        {
                          "computed": false,
                          "key": {
                            "type": "Literal",
                            "value": "children",
                          },
                          "kind": "init",
                          "method": false,
                          "shorthand": false,
                          "type": "Property",
                          "value": {
                            "children": [
                              {
                                "children": [],
                                "closingElement": null,
                                "openingElement": {
                                  "attributes": [
                                    {
                                      "name": {
                                        "name": "type",
                                        "type": "JSXIdentifier",
                                      },
                                      "type": "JSXAttribute",
                                      "value": {
                                        "type": "Literal",
                                        "value": "text",
                                      },
                                    },
                                    {
                                      "name": {
                                        "name": "value",
                                        "type": "JSXIdentifier",
                                      },
                                      "type": "JSXAttribute",
                                      "value": {
                                        "type": "Literal",
                                        "value": "Hello world",
                                      },
                                    },
                                  ],
                                  "name": {
                                    "name": "h2",
                                    "type": "JSXIdentifier",
                                  },
                                  "selfClosing": true,
                                  "type": "JSXOpeningElement",
                                },
                                "type": "JSXElement",
                              },
                              {
                                "children": [],
                                "closingElement": null,
                                "openingElement": {
                                  "attributes": [
                                    {
                                      "name": {
                                        "name": "type",
                                        "type": "JSXIdentifier",
                                      },
                                      "type": "JSXAttribute",
                                      "value": {
                                        "type": "Literal",
                                        "value": "text",
                                      },
                                    },
                                    {
                                      "name": {
                                        "name": "value",
                                        "type": "JSXIdentifier",
                                      },
                                      "type": "JSXAttribute",
                                      "value": {
                                        "type": "Literal",
                                        "value": "This should be wrapped in a <p> tag",
                                      },
                                    },
                                  ],
                                  "name": {
                                    "name": "p",
                                    "type": "JSXIdentifier",
                                  },
                                  "selfClosing": true,
                                  "type": "JSXOpeningElement",
                                },
                                "type": "JSXElement",
                              },
                            ],
                            "closingFragment": {
                              "type": "JSXClosingFragment",
                            },
                            "openingFragment": {
                              "type": "JSXOpeningFragment",
                            },
                            "type": "JSXFragment",
                          },
                        },
                      ],
                      "type": "ObjectExpression",
                    },
                    "type": "ExpressionStatement",
                  },
                ],
                "sourceType": "module",
                "type": "Program",
              },
            },
            "type": "mdxJsxAttributeValueExpression",
            "value": "__expression__",
          }
        `);
    });

    it("should unravel list", () => {
        const test = unknownToMdxJsxAttributeValue([props]);
        expect(test).toMatchInlineSnapshot(`
          {
            "data": {
              "estree": {
                "body": [
                  {
                    "expression": {
                      "elements": [
                        {
                          "properties": [
                            {
                              "computed": false,
                              "key": {
                                "type": "Literal",
                                "value": "test",
                              },
                              "kind": "init",
                              "method": false,
                              "shorthand": false,
                              "type": "Property",
                              "value": {
                                "type": "Literal",
                                "value": "test",
                              },
                            },
                            {
                              "computed": false,
                              "key": {
                                "type": "Literal",
                                "value": "children",
                              },
                              "kind": "init",
                              "method": false,
                              "shorthand": false,
                              "type": "Property",
                              "value": {
                                "children": [
                                  {
                                    "children": [],
                                    "closingElement": null,
                                    "openingElement": {
                                      "attributes": [
                                        {
                                          "name": {
                                            "name": "type",
                                            "type": "JSXIdentifier",
                                          },
                                          "type": "JSXAttribute",
                                          "value": {
                                            "type": "Literal",
                                            "value": "text",
                                          },
                                        },
                                        {
                                          "name": {
                                            "name": "value",
                                            "type": "JSXIdentifier",
                                          },
                                          "type": "JSXAttribute",
                                          "value": {
                                            "type": "Literal",
                                            "value": "Hello world",
                                          },
                                        },
                                      ],
                                      "name": {
                                        "name": "h2",
                                        "type": "JSXIdentifier",
                                      },
                                      "selfClosing": true,
                                      "type": "JSXOpeningElement",
                                    },
                                    "type": "JSXElement",
                                  },
                                  {
                                    "children": [],
                                    "closingElement": null,
                                    "openingElement": {
                                      "attributes": [
                                        {
                                          "name": {
                                            "name": "type",
                                            "type": "JSXIdentifier",
                                          },
                                          "type": "JSXAttribute",
                                          "value": {
                                            "type": "Literal",
                                            "value": "text",
                                          },
                                        },
                                        {
                                          "name": {
                                            "name": "value",
                                            "type": "JSXIdentifier",
                                          },
                                          "type": "JSXAttribute",
                                          "value": {
                                            "type": "Literal",
                                            "value": "This should be wrapped in a <p> tag",
                                          },
                                        },
                                      ],
                                      "name": {
                                        "name": "p",
                                        "type": "JSXIdentifier",
                                      },
                                      "selfClosing": true,
                                      "type": "JSXOpeningElement",
                                    },
                                    "type": "JSXElement",
                                  },
                                ],
                                "closingFragment": {
                                  "type": "JSXClosingFragment",
                                },
                                "openingFragment": {
                                  "type": "JSXOpeningFragment",
                                },
                                "type": "JSXFragment",
                              },
                            },
                          ],
                          "type": "ObjectExpression",
                        },
                      ],
                      "type": "ArrayExpression",
                    },
                    "type": "ExpressionStatement",
                  },
                ],
                "sourceType": "module",
                "type": "Program",
              },
            },
            "type": "mdxJsxAttributeValueExpression",
            "value": "__expression__",
          }
        `);
    });

    it("should convert unravel object", () => {
        const test = unknownToMdxJsxAttributeValue({ test: props, unrelated: "string", unrelated2: {} });
        expect(test).toMatchInlineSnapshot(`
          {
            "data": {
              "estree": {
                "body": [
                  {
                    "expression": {
                      "properties": [
                        {
                          "computed": false,
                          "key": {
                            "type": "Literal",
                            "value": "test",
                          },
                          "kind": "init",
                          "method": false,
                          "shorthand": false,
                          "type": "Property",
                          "value": {
                            "properties": [
                              {
                                "computed": false,
                                "key": {
                                  "type": "Literal",
                                  "value": "test",
                                },
                                "kind": "init",
                                "method": false,
                                "shorthand": false,
                                "type": "Property",
                                "value": {
                                  "type": "Literal",
                                  "value": "test",
                                },
                              },
                              {
                                "computed": false,
                                "key": {
                                  "type": "Literal",
                                  "value": "children",
                                },
                                "kind": "init",
                                "method": false,
                                "shorthand": false,
                                "type": "Property",
                                "value": {
                                  "children": [
                                    {
                                      "children": [],
                                      "closingElement": null,
                                      "openingElement": {
                                        "attributes": [
                                          {
                                            "name": {
                                              "name": "type",
                                              "type": "JSXIdentifier",
                                            },
                                            "type": "JSXAttribute",
                                            "value": {
                                              "type": "Literal",
                                              "value": "text",
                                            },
                                          },
                                          {
                                            "name": {
                                              "name": "value",
                                              "type": "JSXIdentifier",
                                            },
                                            "type": "JSXAttribute",
                                            "value": {
                                              "type": "Literal",
                                              "value": "Hello world",
                                            },
                                          },
                                        ],
                                        "name": {
                                          "name": "h2",
                                          "type": "JSXIdentifier",
                                        },
                                        "selfClosing": true,
                                        "type": "JSXOpeningElement",
                                      },
                                      "type": "JSXElement",
                                    },
                                    {
                                      "children": [],
                                      "closingElement": null,
                                      "openingElement": {
                                        "attributes": [
                                          {
                                            "name": {
                                              "name": "type",
                                              "type": "JSXIdentifier",
                                            },
                                            "type": "JSXAttribute",
                                            "value": {
                                              "type": "Literal",
                                              "value": "text",
                                            },
                                          },
                                          {
                                            "name": {
                                              "name": "value",
                                              "type": "JSXIdentifier",
                                            },
                                            "type": "JSXAttribute",
                                            "value": {
                                              "type": "Literal",
                                              "value": "This should be wrapped in a <p> tag",
                                            },
                                          },
                                        ],
                                        "name": {
                                          "name": "p",
                                          "type": "JSXIdentifier",
                                        },
                                        "selfClosing": true,
                                        "type": "JSXOpeningElement",
                                      },
                                      "type": "JSXElement",
                                    },
                                  ],
                                  "closingFragment": {
                                    "type": "JSXClosingFragment",
                                  },
                                  "openingFragment": {
                                    "type": "JSXOpeningFragment",
                                  },
                                  "type": "JSXFragment",
                                },
                              },
                            ],
                            "type": "ObjectExpression",
                          },
                        },
                        {
                          "computed": false,
                          "key": {
                            "type": "Literal",
                            "value": "unrelated",
                          },
                          "kind": "init",
                          "method": false,
                          "shorthand": false,
                          "type": "Property",
                          "value": {
                            "type": "Literal",
                            "value": "string",
                          },
                        },
                        {
                          "computed": false,
                          "key": {
                            "type": "Literal",
                            "value": "unrelated2",
                          },
                          "kind": "init",
                          "method": false,
                          "shorthand": false,
                          "type": "Property",
                          "value": {
                            "properties": [],
                            "type": "ObjectExpression",
                          },
                        },
                      ],
                      "type": "ObjectExpression",
                    },
                    "type": "ExpressionStatement",
                  },
                ],
                "sourceType": "module",
                "type": "Program",
              },
            },
            "type": "mdxJsxAttributeValueExpression",
            "value": "__expression__",
          }
        `);
    });

    it("should convert unravel object with list", () => {
        const test = unknownToMdxJsxAttributeValue({
            test: [props, { unrelated: 3 }],
            unrelated: "string",
            unrelated2: {},
        });
        expect(test).toMatchInlineSnapshot(`
          {
            "data": {
              "estree": {
                "body": [
                  {
                    "expression": {
                      "properties": [
                        {
                          "computed": false,
                          "key": {
                            "type": "Literal",
                            "value": "test",
                          },
                          "kind": "init",
                          "method": false,
                          "shorthand": false,
                          "type": "Property",
                          "value": {
                            "elements": [
                              {
                                "properties": [
                                  {
                                    "computed": false,
                                    "key": {
                                      "type": "Literal",
                                      "value": "test",
                                    },
                                    "kind": "init",
                                    "method": false,
                                    "shorthand": false,
                                    "type": "Property",
                                    "value": {
                                      "type": "Literal",
                                      "value": "test",
                                    },
                                  },
                                  {
                                    "computed": false,
                                    "key": {
                                      "type": "Literal",
                                      "value": "children",
                                    },
                                    "kind": "init",
                                    "method": false,
                                    "shorthand": false,
                                    "type": "Property",
                                    "value": {
                                      "children": [
                                        {
                                          "children": [],
                                          "closingElement": null,
                                          "openingElement": {
                                            "attributes": [
                                              {
                                                "name": {
                                                  "name": "type",
                                                  "type": "JSXIdentifier",
                                                },
                                                "type": "JSXAttribute",
                                                "value": {
                                                  "type": "Literal",
                                                  "value": "text",
                                                },
                                              },
                                              {
                                                "name": {
                                                  "name": "value",
                                                  "type": "JSXIdentifier",
                                                },
                                                "type": "JSXAttribute",
                                                "value": {
                                                  "type": "Literal",
                                                  "value": "Hello world",
                                                },
                                              },
                                            ],
                                            "name": {
                                              "name": "h2",
                                              "type": "JSXIdentifier",
                                            },
                                            "selfClosing": true,
                                            "type": "JSXOpeningElement",
                                          },
                                          "type": "JSXElement",
                                        },
                                        {
                                          "children": [],
                                          "closingElement": null,
                                          "openingElement": {
                                            "attributes": [
                                              {
                                                "name": {
                                                  "name": "type",
                                                  "type": "JSXIdentifier",
                                                },
                                                "type": "JSXAttribute",
                                                "value": {
                                                  "type": "Literal",
                                                  "value": "text",
                                                },
                                              },
                                              {
                                                "name": {
                                                  "name": "value",
                                                  "type": "JSXIdentifier",
                                                },
                                                "type": "JSXAttribute",
                                                "value": {
                                                  "type": "Literal",
                                                  "value": "This should be wrapped in a <p> tag",
                                                },
                                              },
                                            ],
                                            "name": {
                                              "name": "p",
                                              "type": "JSXIdentifier",
                                            },
                                            "selfClosing": true,
                                            "type": "JSXOpeningElement",
                                          },
                                          "type": "JSXElement",
                                        },
                                      ],
                                      "closingFragment": {
                                        "type": "JSXClosingFragment",
                                      },
                                      "openingFragment": {
                                        "type": "JSXOpeningFragment",
                                      },
                                      "type": "JSXFragment",
                                    },
                                  },
                                ],
                                "type": "ObjectExpression",
                              },
                              {
                                "properties": [
                                  {
                                    "computed": false,
                                    "key": {
                                      "type": "Literal",
                                      "value": "unrelated",
                                    },
                                    "kind": "init",
                                    "method": false,
                                    "shorthand": false,
                                    "type": "Property",
                                    "value": {
                                      "type": "Literal",
                                      "value": 3,
                                    },
                                  },
                                ],
                                "type": "ObjectExpression",
                              },
                            ],
                            "type": "ArrayExpression",
                          },
                        },
                        {
                          "computed": false,
                          "key": {
                            "type": "Literal",
                            "value": "unrelated",
                          },
                          "kind": "init",
                          "method": false,
                          "shorthand": false,
                          "type": "Property",
                          "value": {
                            "type": "Literal",
                            "value": "string",
                          },
                        },
                        {
                          "computed": false,
                          "key": {
                            "type": "Literal",
                            "value": "unrelated2",
                          },
                          "kind": "init",
                          "method": false,
                          "shorthand": false,
                          "type": "Property",
                          "value": {
                            "properties": [],
                            "type": "ObjectExpression",
                          },
                        },
                      ],
                      "type": "ObjectExpression",
                    },
                    "type": "ExpressionStatement",
                  },
                ],
                "sourceType": "module",
                "type": "Program",
              },
            },
            "type": "mdxJsxAttributeValueExpression",
            "value": "__expression__",
          }
        `);
    });
});
