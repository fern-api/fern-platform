import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { useAtom, useSetAtom } from "jotai";
import { ReactElement } from "react";
import { FERN_STREAM_ATOM, SLUG_ATOM } from "../../atoms";
import { StreamingEnabledToggle } from "./StreamingEnabledToggle";

export function EndpointStreamingEnabledToggle({
  node,
}: {
  node: FernNavigation.EndpointPairNode;
  // container: MutableRefObject<HTMLElement | null>;
}): ReactElement {
  const [isStream, setIsStream] = useAtom(FERN_STREAM_ATOM);
  const setSlug = useSetAtom(SLUG_ATOM);
  return (
    <StreamingEnabledToggle
      className="ml-2 w-[200px]"
      value={isStream}
      setValue={(value) => {
        setIsStream(value);
        setSlug(value ? node.stream.slug : node.nonStream.slug);
        // setTimeout(() => {
        //     if (container.current != null) {
        //         container.current.scrollIntoView({ behavior: "instant" });
        //     }
        // }, 0);
      }}
    />
  );
}
