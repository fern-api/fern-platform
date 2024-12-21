import { splitMarkdownIntoSections } from "../split-into-sections";

describe("chunk", () => {
  it("should chunk", () => {
    const chunks = splitMarkdownIntoSections(`
Some content at the top

# level 1 heading

Hello

# level 1 heading [#custom-anchor]

Uses a custom anchor

# level 1 heading

duplicate heading

## level 2 heading

nested heading

### level 3 heading

\`\`\`mdx

# this is not a heading

\`\`\`

##### level 5 heading

deeply nested heading

## level 2 heading, again

This should still be nested under level-1-heading-1

##### level 3 heading, again

<Steps>

### Step 1

This content should not be split, because it's not a direct child of the root

### Step 2

</Steps>

### testing stack pop

#### testing empty section above

Finished.
`);
    expect(chunks).toMatchInlineSnapshot(`
          [
            {
              "content": "Some content at the top",
              "type": "root",
            },
            {
              "content": "Hello",
              "heading": {
                "depth": 1,
                "id": "level-1-heading",
                "length": 17,
                "start": 26,
                "title": "level 1 heading",
              },
              "parents": [],
              "type": "section",
            },
            {
              "content": "Uses a custom anchor",
              "heading": {
                "depth": 1,
                "id": "custom-anchor",
                "length": 34,
                "start": 52,
                "title": "level 1 heading",
              },
              "parents": [],
              "type": "section",
            },
            {
              "content": "duplicate heading",
              "heading": {
                "depth": 1,
                "id": "level-1-heading-1",
                "length": 17,
                "start": 110,
                "title": "level 1 heading",
              },
              "parents": [],
              "type": "section",
            },
            {
              "content": "nested heading",
              "heading": {
                "depth": 2,
                "id": "level-2-heading",
                "length": 18,
                "start": 148,
                "title": "level 2 heading",
              },
              "parents": [
                {
                  "depth": 1,
                  "id": "level-1-heading-1",
                  "length": 17,
                  "start": 110,
                  "title": "level 1 heading",
                },
              ],
              "type": "section",
            },
            {
              "content": "\`\`\`mdx

          # this is not a heading

          \`\`\`",
              "heading": {
                "depth": 3,
                "id": "level-3-heading",
                "length": 19,
                "start": 184,
                "title": "level 3 heading",
              },
              "parents": [
                {
                  "depth": 1,
                  "id": "level-1-heading-1",
                  "length": 17,
                  "start": 110,
                  "title": "level 1 heading",
                },
                {
                  "depth": 2,
                  "id": "level-2-heading",
                  "length": 18,
                  "start": 148,
                  "title": "level 2 heading",
                },
              ],
              "type": "section",
            },
            {
              "content": "deeply nested heading",
              "heading": {
                "depth": 5,
                "id": "level-5-heading",
                "length": 21,
                "start": 243,
                "title": "level 5 heading",
              },
              "parents": [
                {
                  "depth": 1,
                  "id": "level-1-heading-1",
                  "length": 17,
                  "start": 110,
                  "title": "level 1 heading",
                },
                {
                  "depth": 2,
                  "id": "level-2-heading",
                  "length": 18,
                  "start": 148,
                  "title": "level 2 heading",
                },
                {
                  "depth": 3,
                  "id": "level-3-heading",
                  "length": 19,
                  "start": 184,
                  "title": "level 3 heading",
                },
              ],
              "type": "section",
            },
            {
              "content": "This should still be nested under level-1-heading-1",
              "heading": {
                "depth": 2,
                "id": "level-2-heading-again",
                "length": 25,
                "start": 289,
                "title": "level 2 heading, again",
              },
              "parents": [
                {
                  "depth": 1,
                  "id": "level-1-heading-1",
                  "length": 17,
                  "start": 110,
                  "title": "level 1 heading",
                },
              ],
              "type": "section",
            },
            {
              "content": "<Steps>

          ### Step 1

          This content should not be split, because it's not a direct child of the root

          ### Step 2

          </Steps>",
              "heading": {
                "depth": 5,
                "id": "level-3-heading-again",
                "length": 28,
                "start": 369,
                "title": "level 3 heading, again",
              },
              "parents": [
                {
                  "depth": 1,
                  "id": "level-1-heading-1",
                  "length": 17,
                  "start": 110,
                  "title": "level 1 heading",
                },
                {
                  "depth": 2,
                  "id": "level-2-heading-again",
                  "length": 25,
                  "start": 289,
                  "title": "level 2 heading, again",
                },
              ],
              "type": "section",
            },
            {
              "content": "Finished.",
              "heading": {
                "depth": 4,
                "id": "testing-empty-section-above",
                "length": 32,
                "start": 544,
                "title": "testing empty section above",
              },
              "parents": [
                {
                  "depth": 1,
                  "id": "level-1-heading-1",
                  "length": 17,
                  "start": 110,
                  "title": "level 1 heading",
                },
                {
                  "depth": 2,
                  "id": "level-2-heading-again",
                  "length": 25,
                  "start": 289,
                  "title": "level 2 heading, again",
                },
                {
                  "depth": 3,
                  "id": "testing-stack-pop",
                  "length": 21,
                  "start": 521,
                  "title": "testing stack pop",
                },
              ],
              "type": "section",
            },
          ]
        `);
  });
});
