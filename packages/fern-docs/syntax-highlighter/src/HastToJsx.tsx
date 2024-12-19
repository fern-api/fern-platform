import type { Root, RootContent } from "hast";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { FC, memo, useMemo } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";

interface HastToJSXProps {
    hast: Root | RootContent;
}

export const HastToJSX: FC<HastToJSXProps> = memo(({ hast }) => {
    const result = useMemo(
        () =>
            toJsxRuntime(hast, {
                Fragment,
                // @ts-expect-error: the automatic react runtime is untyped.
                jsx,
                // @ts-expect-error: the automatic react runtime is untyped.
                jsxs,
            }),
        [hast]
    );

    return result;
});

HastToJSX.displayName = "HastToJSX";
