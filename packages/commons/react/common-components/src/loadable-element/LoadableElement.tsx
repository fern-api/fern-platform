import { isFailed, isLoaded, Loadable } from "@fern-ui/loadable";
import React, { ReactElement } from "react";

export declare namespace LoadableElement {
    export interface Props<T> {
        value: Loadable<T>;
        children: (loadedValue: T) => ReactElement | string | null;
        fallback?: ReactElement;
        errorElement?: ReactElement | string;
    }
}

export function LoadableElement<T>({
    value,
    children,
    fallback = <React.Fragment />,
    errorElement = fallback,
}: LoadableElement.Props<T>): ReactElement {
    if (isFailed(value)) {
        return <>{errorElement}</>;
    }
    if (!isLoaded(value)) {
        return fallback;
    }
    return <>{children(value.value)}</>;
}
