import dynamic from "next/dynamic";

import { type Platform, getPlatform } from "@fern-api/ui-core-utils";

type ComponentChildren = (platform: Platform) => React.ReactNode;

export declare namespace PlatformSpecificContent {
  export interface Props {
    children: ComponentChildren;
  }
}

const Core: React.FC<PlatformSpecificContent.Props> = ({ children }) => {
  return <>{children(getPlatform())}</>;
};

export const PlatformSpecificContent = dynamic(() => Promise.resolve(Core), {
  ssr: false,
});
