import type { DocsV2Read } from "@fern-api/fdr-sdk";
import { toast } from "@fern-ui/components";
import { DocsPage } from "@fern-ui/ui";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useRef, useState } from "react";
import ReconnectingWebSocket from "../utils/ReconnectingWebsocket";
import { getDocsPageProps } from "../utils/getDocsPageProps";

interface LocalPreviewWebsocketMessage {
    version: 1;
    type: "startReload" | "finishReload";
}

export default function LocalPreviewDocs(): ReactElement {
    const router = useRouter();

    const [docs, setDocs] = useState<DocsV2Read.LoadDocsForUrlResponse>();
    const [docsProps, setDocsProps] = useState<DocsPage.Props>();
    const toastInstance = useRef<string | number>();

    /**
     * Load the docs for the current URL.
     */
    useEffect(() => {
        let isCanceled = false;
        const url = new URL(window.location.href);
        async function loadData() {
            try {
                const docs = await loadDocsForUrl(url.origin);
                if (isCanceled) {
                    return;
                }
                setDocs(docs);
            } catch (error) {
                if (isCanceled) {
                    return;
                }
                // eslint-disable-next-line no-console
                console.error(error);
                toastInstance.current = toast.error("Failed to load the docs.", {
                    id: toastInstance.current,
                    duration: Number.POSITIVE_INFINITY,
                    dismissible: true,
                    position: "top-center",
                });
            }
        }
        void loadData();

        const websocket = new ReconnectingWebSocket(`ws://${url.host}`);
        websocket.onmessage = async (e) => {
            try {
                const data = JSON.parse(e.data) as LocalPreviewWebsocketMessage;
                if (data.version == null) {
                    await loadData();
                    toast.dismiss(toastInstance.current);
                } else if (data.version === 1) {
                    if (data.type === "startReload") {
                        toastInstance.current = toast.loading("Reloading...", {
                            id: toastInstance.current,
                            duration: Number.POSITIVE_INFINITY,
                            position: "top-center",
                            dismissible: false,
                        });
                    } else if (data.type === "finishReload") {
                        await loadData();
                        toast.dismiss(toastInstance.current);
                    }
                }
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(error);
                await loadData();
            }
        };
        websocket.onconnecting = () => {
            if (websocket.reconnectAttempts > 0) {
                toastInstance.current = toast.error("Disconnected from server. Reconnecting...", {
                    id: toastInstance.current,
                    duration: Number.POSITIVE_INFINITY,
                    dismissible: true,
                    position: "top-center",
                });
            }
        };
        websocket.onopen = () => {
            toast.dismiss(toastInstance.current);
        };
        return () => {
            websocket.close();
            toast.dismiss(toastInstance.current);
            isCanceled = true;
        };
    }, []);

    /**
     * Convert the loaded docs to props for the currently routed page.
     */
    useEffect(() => {
        if (docs == null) {
            return;
        }
        let isCanceled = false;
        const slug = router.query.slug == null ? [] : (router.query.slug as string[]);
        void getDocsPageProps(docs, slug)
            .then((result) => {
                if (isCanceled) {
                    return;
                }
                if (result.type === "props") {
                    setDocsProps(result.props);
                } else if (result.type === "notFound") {
                    void router.replace("/");
                } else if (result.type === "redirect") {
                    void router.replace(result.redirect.destination);
                }
            })
            .catch((error) => {
                // eslint-disable-next-line no-console
                console.error(error);
                toastInstance.current = toast.error("Failed to load the docs.", {
                    id: toastInstance.current,
                    duration: Number.POSITIVE_INFINITY,
                    dismissible: true,
                    position: "top-center",
                });
            });
        return () => {
            isCanceled = true;
        };
    }, [docs, router]);

    if (docsProps == null) {
        return <></>;
    }

    return <DocsPage {...docsProps} />;
}

async function loadDocsForUrl(origin: string) {
    const response = await fetch(`${origin}/v2/registry/docs/load-with-url`, {
        method: "POST",
    });

    const docs: DocsV2Read.LoadDocsForUrlResponse = await response.json();

    if (docs.baseUrl == null || docs.definition == null) {
        // eslint-disable-next-line no-console
        console.debug(docs);
        throw new Error("Invalid response from the server.");
    }

    return docs;
}
