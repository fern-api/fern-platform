/* eslint-disable react/no-unknown-property */
import { atom, useAtomValue } from "jotai";
import { ReactElement } from "react";
import { DOCS_ATOM } from "../../atoms";

const STYLESHEET_ATOM = atom((get) => get(DOCS_ATOM).stylesheet);

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
