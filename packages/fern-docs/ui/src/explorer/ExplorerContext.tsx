import { useAtomValue } from "jotai";
import dynamic from "next/dynamic";
import { FC } from "react";
import {
  IS_PLAYGROUND_ENABLED_ATOM,
  useInitExplorerRouter,
} from "../atoms/explorer";

const ExplorerDrawer = dynamic(
  () => import("./ExplorerDrawer").then((m) => m.ExplorerDrawer),
  {
    ssr: false,
  }
);

export const ExplorerContextProvider: FC = () => {
  useInitExplorerRouter();

  const isExplorerEnabled = useAtomValue(IS_PLAYGROUND_ENABLED_ATOM);
  return isExplorerEnabled ? <ExplorerDrawer /> : null;
};
