import { useAtomValue } from "jotai";
import dynamic from "next/dynamic";
import { FC } from "react";
import {
    IS_PLAYGROUND_ENABLED_ATOM,
    useInitPlaygroundRouter,
} from "../atoms/playground";

const PlaygroundDrawer = dynamic(
    () => import("./PlaygroundDrawer").then((m) => m.PlaygroundDrawer),
    {
        ssr: false,
    }
);

export const PlaygroundContextProvider: FC = () => {
    useInitPlaygroundRouter();

    const isPlaygroundEnabled = useAtomValue(IS_PLAYGROUND_ENABLED_ATOM);
    return isPlaygroundEnabled ? <PlaygroundDrawer /> : null;
};
