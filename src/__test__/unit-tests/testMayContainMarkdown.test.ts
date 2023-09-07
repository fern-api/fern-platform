import { mayContainMarkdown } from "../../util/markdown";

describe("mayContainMarkdown()", () => {
    describe("correctly identifies plain text as not markdown", () => {
        it("case 1", () => {
            const str =
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
            expect(mayContainMarkdown(str)).toBe(false);
        });
        it("case 2", () => {
            const str = "Lorem ipsum dolor sit * amet, consectetur adipiscing elit";
            expect(mayContainMarkdown(str)).toBe(false);
        });
        it("case 3", () => {
            const str = "Lorem ipsum dolor sit amet - consectetur adipiscing elit";
            expect(mayContainMarkdown(str)).toBe(false);
        });
    });

    describe("correctly identifies bold text", () => {
        it("case 1", () => {
            const str = "Lorem ipsum dolor sit **amet**, consectetur adipiscing elit";
            expect(mayContainMarkdown(str)).toBe(true);
        });
    });

    describe("correctly identifies italic text", () => {
        it("case 1", () => {
            const str = "Lorem ipsum dolor sit *amet*, consectetur adipiscing elit";
            expect(mayContainMarkdown(str)).toBe(true);
        });
        it("case 2", () => {
            const str = "Lorem ipsum dolor sit _amet_, consectetur adipiscing elit";
            expect(mayContainMarkdown(str)).toBe(true);
        });
    });

    describe("correctly identifies inline code", () => {
        it("case 1", () => {
            const str = "Lorem ipsum `dolor amet`";
            expect(mayContainMarkdown(str)).toBe(true);
        });
    });

    describe("correctly identifies code block", () => {
        it("case 1", () => {
            const str = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit.

Code block:
\`\`\`bash
echo "Hello World!"
\`\`\`
            `;
            expect(mayContainMarkdown(str)).toBe(true);
        });
    });

    describe("correctly identifies image", () => {
        it("case 1", () => {
            const str = `Here is an image: ![alt text](https://example.com/image.png)`;
            expect(mayContainMarkdown(str)).toBe(true);
        });
    });

    describe("correctly identifies link", () => {
        it("case 1 - https://example.com", () => {
            const str = `Here is a [link](https://example.com).`;
            expect(mayContainMarkdown(str)).toBe(true);
        });

        it("case 2 - http://example.com", () => {
            const str = `Here is a [link](http://example.com).`;
            expect(mayContainMarkdown(str)).toBe(true);
        });

        it("case 3 - /examples/example1", () => {
            const str = `Here is an [internal link](/examples/example1).`;
            expect(mayContainMarkdown(str)).toBe(true);
        });
    });

    describe("correctly identifies header", () => {
        it("case 1 - #", () => {
            const str = `
Lorem ipsum dolor sit amet

# This is a heading
`;
            expect(mayContainMarkdown(str)).toBe(true);
        });

        it("case 2 - ##", () => {
            const str = `
Lorem ipsum dolor sit amet

## This is a heading
`;
            expect(mayContainMarkdown(str)).toBe(true);
        });
    });

    it("case 3 - ###", () => {
        const str = `
Lorem ipsum dolor sit amet

### This is a heading
`;
        expect(mayContainMarkdown(str)).toBe(true);
    });

    it("case 4 - ####", () => {
        const str = `
Lorem ipsum dolor sit amet

#### This is a heading
`;
        expect(mayContainMarkdown(str)).toBe(true);
    });

    it("case 5 - #####", () => {
        const str = `
Lorem ipsum dolor sit amet

##### This is a heading
`;
        expect(mayContainMarkdown(str)).toBe(true);
    });

    it("case 6 - ######", () => {
        const str = `
Lorem ipsum dolor sit amet

###### This is a heading
`;
        expect(mayContainMarkdown(str)).toBe(true);
    });

    it("case 7 - ####### (invalid)", () => {
        const str = `
Lorem ipsum dolor sit amet

####### This is a heading
`;
        expect(mayContainMarkdown(str)).toBe(false);
    });

    describe("correctly identifies ordered list", () => {
        it("case 1", () => {
            const str = `
1. Ordered list item 1
1. Ordered list item 2
            `;
            expect(mayContainMarkdown(str)).toBe(true);
        });
    });

    describe("correctly identifies unordered list", () => {
        it("case 1", () => {
            const str = `
- Unordered list item 1
- Unordered list item 2
            `;
            expect(mayContainMarkdown(str)).toBe(true);
        });
    });

    describe("correctly identifies inline html", () => {
        it("case 1 - <span>", () => {
            const str = `Some content with <span style="white-space: nowrap">inline html</span>`;
            expect(mayContainMarkdown(str)).toBe(true);
        });

        it("case 2 - <p>", () => {
            const str = `Some content with <p style="white-space: nowrap">\`inline html\`</p>`;
            expect(mayContainMarkdown(str)).toBe(true);
        });

        it("case 3 - <span> inside <div>", () => {
            const str = `Some content:
            <div style="white-space: nowrap">
                <span>Content</span>
            </div>
            `;
            expect(mayContainMarkdown(str)).toBe(true);
        });
    });
});
