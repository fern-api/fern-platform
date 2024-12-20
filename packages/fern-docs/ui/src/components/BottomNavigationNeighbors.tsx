import { useAtomValue } from "jotai";
import { FC, useMemo } from "react";
import { NEIGHBORS_ATOM } from "../atoms/navigation";
import { useToHref } from "../hooks/useHref";
import { DocsContent } from "../resolver/DocsContent";
import { BottomNavigationButtons } from "./BottomNavigationButtons";

interface BottomNavigationNeighborsProps {
  neighbors?: DocsContent.Neighbors;
}

export const BottomNavigationNeighbors: FC<BottomNavigationNeighborsProps> = (
  props
) => {
  const toHref = useToHref();
  const neighborsFromAtom = useAtomValue(NEIGHBORS_ATOM);
  const neighbors = props.neighbors ?? neighborsFromAtom;

  // TODO: Uncomment this when we improve the UI for the previous button

  // const prev = useMemo(() => {
  //     if (neighbors.prev == null) {
  //         return undefined;
  //     }
  //     return {
  //         title: neighbors.prev.title,
  //         excerpt: neighbors.prev.excerpt,
  //         href: toHref(neighbors.prev.slug),
  //     };
  // }, [neighbors.prev, toHref]);

  const next = useMemo(() => {
    if (neighbors.next == null) {
      return undefined;
    }
    return {
      title: neighbors.next.title,
      excerpt: neighbors.next.excerpt,
      href: toHref(neighbors.next.slug),
    };
  }, [neighbors.next, toHref]);

  return <BottomNavigationButtons next={next} />;
};
