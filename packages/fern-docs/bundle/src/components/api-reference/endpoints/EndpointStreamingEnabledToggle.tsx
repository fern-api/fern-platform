import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { addLeadingSlash } from "@fern-docs/utils";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { ReactElement } from "react";
import { FERN_STREAM_ATOM } from "../../atoms";
import { StreamingEnabledToggle } from "./StreamingEnabledToggle";

export function EndpointStreamingEnabledToggle({
  node,
}: {
  node: FernNavigation.EndpointPairNode;
  // container: MutableRefObject<HTMLElement | null>;
}): ReactElement<any> {
  const router = useRouter();
  const [isStream, setIsStream] = useAtom(FERN_STREAM_ATOM);
  return (
    <StreamingEnabledToggle
      className="ml-2 w-[200px]"
      value={isStream}
      setValue={(value) => {
        setIsStream(value);
        // TODO: conform trailing slash
        router.replace(
          addLeadingSlash(value ? node.stream.slug : node.nonStream.slug)
        );
        // setTimeout(() => {
        //     if (container.current != null) {
        //         container.current.scrollIntoView({ behavior: "instant" });
        //     }
        // }, 0);
      }}
    />
  );
}
