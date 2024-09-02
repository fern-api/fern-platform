import { useAtomValue } from "jotai";
import dynamic from "next/dynamic";
import { FC, useEffect } from "react";
import useSWR from "swr";
import { APIS_ATOM, store } from "../atoms";
import { HAS_PLAYGROUND_ATOM, useInitPlaygroundRouter } from "../atoms/playground";
import { useApiRoute } from "../hooks/useApiRoute";
import { ResolvedRootPackage } from "../resolver/types";

const PlaygroundDrawer = dynamic(() => import("./PlaygroundDrawer").then((m) => m.PlaygroundDrawer), {
    ssr: false,
});

const fetcher = async (url: string) => {
    const res = await fetch(url);
    return res.json();
};

export const PlaygroundContextProvider: FC = () => {
    const key = useApiRoute("/api/fern-docs/resolve-api");
    const { data } = useSWR<Record<string, ResolvedRootPackage> | null>(key, fetcher, {
        revalidateOnFocus: false,
    });
    useEffect(() => {
        if (data != null) {
            store.set(APIS_ATOM, data);
        }
    }, [data]);

    useInitPlaygroundRouter();

    const hasPlayground = useAtomValue(HAS_PLAYGROUND_ATOM);
    return hasPlayground ? <PlaygroundDrawer /> : null;
};
