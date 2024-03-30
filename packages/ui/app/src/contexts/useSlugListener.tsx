import { useEventCallback } from "@fern-ui/react-commons";
import { noop } from "instantsearch.js/es/lib/utils";
import { useRouter } from "next/router";
import { PropsWithChildren, ReactElement, createContext, useCallback, useContext, useEffect, useRef } from "react";

type ListenerFn = (anchor?: string) => void;

type RegisterListenerFn = (slug: string, listener: ListenerFn) => () => void;

const SlugListenerContext = createContext<RegisterListenerFn>(() => noop);

export function SlugListenerContextProvider({ children }: PropsWithChildren): ReactElement {
    const router = useRouter();

    const slugAndAnchor = router.asPath.split("#") as [string, string | undefined];
    const slugAndAnchorRef = useRef(slugAndAnchor);

    useEffect(() => {
        slugAndAnchorRef.current = slugAndAnchor;
    });

    const listeners = useRef<Record<string, ListenerFn[]>>({});

    const invokeListeners = useCallback((slug: string) => {
        const [, anchor] = slugAndAnchorRef.current;
        const listenersForSlug = listeners.current[slug];
        if (listenersForSlug != null) {
            for (const listener of listenersForSlug) {
                setTimeout(() => listener(anchor), 0);
            }
        }
    }, []);

    const [slug] = slugAndAnchor;
    useEffect(() => {
        invokeListeners(slug);
    }, [invokeListeners, slug]);

    const registerListener = useCallback<RegisterListenerFn>((slug, listener) => {
        const [path, anchor] = slugAndAnchorRef.current;
        const listenersForPath = (listeners.current[slug] ??= []);
        listenersForPath.push(listener);
        if (path === slug) {
            setTimeout(() => listener(anchor), 0);
        }

        return () => {
            const listenersForSlug = listeners.current[slug];
            if (listenersForSlug != null) {
                const indexOfListenerToDelete = listenersForSlug.indexOf(listener);
                if (indexOfListenerToDelete === -1) {
                    // eslint-disable-next-line no-console
                    console.warn(`Failed to deregister listener for ${slug}.`);
                } else {
                    listenersForSlug.splice(indexOfListenerToDelete, 1);
                }
            }
        };
    }, []);

    return <SlugListenerContext.Provider value={registerListener}>{children}</SlugListenerContext.Provider>;
}

export const useSlugListener = (slug: string, listener: ListenerFn): void => {
    const cb = useContext(SlugListenerContext);
    const listenerRef = useEventCallback(listener);
    useEffect(() => cb(slug, listenerRef), [cb, listenerRef, slug]);
};
