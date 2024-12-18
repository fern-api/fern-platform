import { atom, useAtomValue } from "jotai";
import Script from "next/script";
import { memo } from "react";
import { DOCS_ATOM, FILES_ATOM } from "../atoms";

const JS_ATOM = atom((get) => get(DOCS_ATOM).js);

export const JavascriptProvider = memo(() => {
    const files = useAtomValue(FILES_ATOM);
    const js = useAtomValue(JS_ATOM);

    return (
        <>
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
        </>
    );
});

JavascriptProvider.displayName = "JavascriptProvider";
