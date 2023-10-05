/**
 * A slug is a string like `"introduction/getting-started"` with no leading `"/"`
 */
export type UrlSlug = string;

export type ResolvedNode = ResolvedNode.Page | ResolvedNode.Section;

export declare namespace ResolvedNode {
    export interface Page {
        type: "page";
        slug: string;
    }

    export interface Section {
        type: "section";
        slug: string;
    }
}
