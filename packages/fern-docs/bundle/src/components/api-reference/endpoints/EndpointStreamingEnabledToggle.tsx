"use client";

import { usePathname, useRouter } from "next/navigation";

import { useAtom } from "jotai";

import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { addLeadingSlash } from "@fern-docs/utils";
import { useIsomorphicLayoutEffect } from "@fern-ui/react-commons";

import { FERN_STREAM_ATOM } from "@/state/stream";

import { StreamingEnabledToggle } from "./StreamingEnabledToggle";

export function EndpointStreamingEnabledToggle({
  node,
}: {
  node: FernNavigation.EndpointPairNode;
}) {
  const router = useRouter();
  const [isStream, setIsStream] = useAtom(FERN_STREAM_ATOM);
  const currentSlug = FernNavigation.slugjoin(usePathname());
  // TODO: this is a hack to ensure the toggle is always in sync with the current slug
  useIsomorphicLayoutEffect(() => {
    if (currentSlug === node.stream.slug) {
      setIsStream(true);
    } else if (currentSlug === node.nonStream.slug) {
      setIsStream(false);
    }
  }, [currentSlug, node.nonStream.slug, node.stream.slug, setIsStream]);
  return (
    <StreamingEnabledToggle
      className="ml-2 w-[200px]"
      value={isStream}
      setValue={(value) => {
        setIsStream(value);
        router.replace(
          addLeadingSlash(value ? node.stream.slug : node.nonStream.slug),
          { scroll: true }
        );
      }}
    />
  );
}
