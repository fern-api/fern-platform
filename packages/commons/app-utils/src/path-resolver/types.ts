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
