import { LocalPreviewContextProvider, NextApp } from "@fern-ui/ui";
import { AppProps } from "next/app";
import { ReactElement } from "react";

export default function App(props: AppProps): ReactElement {
    return (
        <LocalPreviewContextProvider>
            <NextApp {...props} />
        </LocalPreviewContextProvider>
    );
}
