import { useRouter } from "next/navigation";
import { RefObject, useEffect } from "react";

import { useInView } from "motion/react";

import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { slugToHref } from "@fern-docs/utils";

export function useApiPageCenterElement(
  ref: RefObject<HTMLDivElement | null>,
  slug: FernNavigation.Slug,
  skip = false
): void {
  const isInView = useInView(ref, {
    // https://stackoverflow.com/questions/54807535/intersection-observer-api-observe-the-center-of-the-viewport
    margin: "-50% 0px",
  });

  const shouldUpdateSlug = !skip && isInView;
  const router = useRouter();

  useEffect(() => {
    if (shouldUpdateSlug) {
      router.replace(slugToHref(slug), { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldUpdateSlug, slug]);
}
