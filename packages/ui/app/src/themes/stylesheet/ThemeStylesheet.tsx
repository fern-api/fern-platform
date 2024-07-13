/* eslint-disable react/no-unknown-property */
import { COLORS_ATOM, DOCS_ATOM, DOCS_LAYOUT_ATOM, FILES_ATOM, TABS_ATOM } from "@/atoms";
import { atom, useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import { isEqual } from "lodash-es";
import { ReactElement } from "react";
import { renderThemeStylesheet } from "./renderThemeStylesheet";

const TYPOGRAPHY_ATOM = selectAtom(DOCS_ATOM, (docs) => docs.typography, isEqual);
const CSS_ATOM = selectAtom(DOCS_ATOM, (docs) => docs.css, isEqual);

const STYLESHEET_ATOM = atom((get) => {
    const colors = get(COLORS_ATOM);
    const typography = get(TYPOGRAPHY_ATOM);
    const layout = get(DOCS_LAYOUT_ATOM);
    const css = get(CSS_ATOM);
    const files = get(FILES_ATOM);
    const tabs = get(TABS_ATOM);
    return renderThemeStylesheet(colors, typography, layout, css, files, tabs.length > 0);
});

/*
We concatenate all global styles into a single instance,
as styled JSX will only create one instance of global styles
for each component.
*/
export function ThemeStylesheet(): ReactElement {
    const stylesheet = useAtomValue(STYLESHEET_ATOM);
    return (
        <style jsx global>
            {`
                ${stylesheet}
            `}
        </style>
    );
}
