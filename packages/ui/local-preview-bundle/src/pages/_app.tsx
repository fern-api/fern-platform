import { LocalPreviewContextProvider, NextApp } from "@fern-ui/ui";
import { AppProps } from "next/app";
import { ReactElement } from "react";

const IS_LOCAL_PREVIEW = {
    isLocalPreview: true,
};

export default function App(props: AppProps): ReactElement {
    return (
        <LocalPreviewContextProvider value={IS_LOCAL_PREVIEW}>
            <NextApp {...props} />
        </LocalPreviewContextProvider>
    );
}
