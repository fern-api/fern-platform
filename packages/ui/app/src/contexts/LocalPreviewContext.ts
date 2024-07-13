import { useHydrateAtoms } from "jotai/utils";
import { Fragment, PropsWithChildren, ReactElement, createElement } from "react";
import { IS_LOCAL_PREVIEW_ATOM } from "../atoms";

export const LocalPreviewContextProvider = ({ children }: PropsWithChildren): ReactElement => {
    useHydrateAtoms([[IS_LOCAL_PREVIEW_ATOM, true]]);
    return createElement(Fragment, null, children);
};
