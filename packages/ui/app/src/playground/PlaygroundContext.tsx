import { useAtomValue } from "jotai";
import dynamic from "next/dynamic";
import { FC } from "react";
import { IS_PLAYGROUND_ENABLED_ATOM, useInitPlaygroundRouter } from "../atoms/playground";

const PlaygroundDrawer = dynamic(() => import("./PlaygroundDrawer").then((m) => m.PlaygroundDrawer), {
    ssr: false,
});

// const fetcher = async (url: string) => {
//     const res = await fetch(url);
//     return res.json();
// };

export const PlaygroundContextProvider: FC = () => {
    // const key = useApiRoute("/api/fern-docs/resolve-api");
    // const { data, isLoading } = useSWR<Record<string, ResolvedRootPackage> | null>(key, fetcher, {
    //     revalidateOnFocus: false,
    // });
    // useEffect(() => {
    //     if (data != null) {
    //         store.set(DEPRECATED_APIS_ATOM, data);
    //     }
    // }, [data]);

    useInitPlaygroundRouter();

    const isPlaygroundEnabled = useAtomValue(IS_PLAYGROUND_ENABLED_ATOM);
    return isPlaygroundEnabled ? <PlaygroundDrawer /> : null;
};
