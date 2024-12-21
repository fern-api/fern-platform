/**
 * The interface that the user-provided `CodeBlocks` children should adhere to.
 */
export type ExpectedCodeBlockChildren = {
  props?: {
    children?: {
      props?: {
        className?: string;
        children?: string;
      };
    };
  };
};

// export function stringHasMarkdown(s: string): boolean {
//     s = s.trim();

//     // has frontmatter
//     if (s.startsWith("---")) {
//         return true;
//     }

//     // has headings (using regex, match if any line starts with 1-6 #)
//     if (s.match(/^\s*#{1,6} .+/m)) {
//         return true;
//     }

//     // has list items or blockquotes
//     if (s.match(/^\s*[*->] .+/m)) {
//         return true;
//     }

//     // has numbered list items
//     if (s.match(/^\s*\d+\. .+/m)) {
//         return true;
//     }

//     // has inline code or code blocks
//     if (s.includes("`")) {
//         return true;
//     }

//     // has horizontal rules
//     if (s.match(/^\s*---+$/m)) {
//         return true;
//     }

//     // has tables
//     if (s.match(/^\s*\|.*\|.*\|.*\|/m)) {
//         return true;
//     }

//     // has bolded or italicized text
//     if (s.match(/\*\*|__|\*|_/)) {
//         return true;
//     }

//     // has strikethrough text
//     if (s.match(/~~/)) {
//         return true;
//     }

//     // has links or images
//     if (s.match(/\[.+\]\(.+\)/)) {
//         return true;
//     }

//     // has plaintext links
//     if (s.match(/https?:\/\/|mailto:|tel:/)) {
//         return true;
//     }

//     // has html or jsx tags
//     if (s.includes("<")) {
//         return true;
//     }

//     // has `\n\n`, indicating paragraphs
//     if (s.includes("\n\n")) {
//         return true;
//     }

//     return false;
// }
