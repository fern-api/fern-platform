import { ReactElement } from "react";

export type CurlExamplePart = CurlExamplePart.Jsx | CurlExamplePart.Line;

export declare namespace CurlExamplePart {
    export interface Jsx {
        type: "jsx";
        jsx: ReactElement;
    }

    export interface Line {
        type: "line";
        value: string | ReactElement;
        excludeTrailingBackslash?: boolean;
        excludeIndent?: boolean;
    }
}
