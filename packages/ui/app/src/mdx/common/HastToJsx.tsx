import type { Root, RootContent } from "hast";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { FC, useMemo } from "react";
// @ts-expect-error: the automatic react runtime is untyped.
import { Fragment, jsx, jsxs } from "react/jsx-runtime";

interface HastToJSXProps {
    hast: Root | RootContent;
}

export const HastToJSX: FC<HastToJSXProps> = ({ hast }) => {
    const result = useMemo(
        () =>
            toJsxRuntime(hast, {
                Fragment,
                jsx,
                jsxs,
            }),
        [hast],
    );

    return result;
};
