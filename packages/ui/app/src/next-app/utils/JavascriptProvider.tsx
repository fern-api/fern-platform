import { atom, useAtomValue } from "jotai";
import Head from "next/head";
import Script from "next/script";
import { memo } from "react";
import { CustomerAnalytics } from "../../analytics/CustomerAnalytics";
import { renderSegmentSnippet } from "../../analytics/segment";
import { DOCS_ATOM, DOMAIN_ATOM, FILES_ATOM } from "../../atoms";

const JS_ATOM = atom((get) => get(DOCS_ATOM).js);

export const JavascriptProvider = memo(() => {
    const files = useAtomValue(FILES_ATOM);
    const js = useAtomValue(JS_ATOM);
    const domain = useAtomValue(DOMAIN_ATOM);

    return (
        <>
            <Head>
                <link
                    key="katex-css"
                    href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
                    rel="stylesheet"
                />
            </Head>
            {js?.inline?.map((inline, idx) => (
                <Script key={`inline-script-${idx}`} id={`inline-script-${idx}`}>
                    {inline}
                </Script>
            ))}
            {js?.files.map((file) => (
                <Script
                    key={file.fileId}
                    src={files[file.fileId]?.url}
                    strategy={file.strategy}
                    type="module"
                    crossOrigin="anonymous"
                />
            ))}
            {js?.remote?.map((remote) => <Script key={remote.url} src={remote.url} strategy={remote.strategy} />)}
            <Script id="segment-script" dangerouslySetInnerHTML={{ __html: renderSegmentSnippet(domain) }} />
            <CustomerAnalytics />
        </>
    );
});

JavascriptProvider.displayName = "JavascriptProvider";
