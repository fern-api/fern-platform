import dynamic from "next/dynamic";
import { ReactElement } from "react";

const THEMES = {
    default: dynamic(() => import("./default/DefaultDocs").then(({ DefaultDocs }) => DefaultDocs), { ssr: true }),
    cohere: dynamic(() => import("./cohere/CohereDocs").then(({ CohereDocs }) => CohereDocs), { ssr: true }),
};

export type FernTheme = keyof typeof THEMES;

const THEME: FernTheme = "cohere";

export function ThemedDocs(): ReactElement {
    const Docs = THEMES[THEME];
    return <Docs />;
}
