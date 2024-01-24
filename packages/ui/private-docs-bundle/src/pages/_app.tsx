import { DocsPage, NextApp } from "@fern-ui/ui";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { ReactElement } from "react";

export interface SessionProps {
    session?: Session | null;
}

export default function App({
    pageProps: { session, ...pageProps },
    ...props
}: AppProps<Partial<DocsPage.Props> & SessionProps>): ReactElement {
    return (
        <SessionProvider session={session}>
            <NextApp {...props} pageProps={pageProps} />;
        </SessionProvider>
    );
}
