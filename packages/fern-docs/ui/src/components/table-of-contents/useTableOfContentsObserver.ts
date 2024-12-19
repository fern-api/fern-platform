import fastdom from "fastdom";
import { useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import { useCallbackOne } from "use-memo-one";
import { SCROLL_BODY_ATOM } from "../../atoms";

function toIdQuerySelector(id: string): string {
  if (id.startsWith("#")) {
    return id;
  }

  /**
   * Escape leading digits with `\3` + trailing space to prevent it from being interpreted as a CSS escape sequence.
   * https://mathiasbynens.be/notes/css-escapes
   */
  if (id.match(/^\d/)) {
    return `#\\3${id[0]} ${id.slice(1)}`;
  }

  return `#${id}`;
}

/**
 *
 * This hook observes the visibility of <h1> to <h6> elements that are tracked in the table of contents.
 * IntersectionObserver is not used because it is not as reactive as scroll events, and only measures the intersection of the directly observed elements.
 *
 * Algorithm:
 * - on mount, or page resize, measure the top Y position of each element
 * - on scroll event, determine which is the last element that is visible above 40% of the viewport height
 *
 * implicit assumption: the content that immediately follows an anchor (heading) is assumed to be the content that the anchor represents,
 * and is considered to be a factor in determining the visibility of the anchor ID.
 *
 * @param ids the ids of the elements to observe
 * @param setActiveId the function to call when an observed element (and its immediate siblings below) is visible above 40% of the viewport height
 * @returns a function to call to trigger another measurement (to be called between page views)
 */
export function useTableOfContentsObserver(
  ids: string[],
  setActiveId: (id: string | undefined) => void
): () => void {
  const idToYRef = useRef<Record<string, number>>({});
  const root = useAtomValue(SCROLL_BODY_ATOM);

  /**
   * on every scroll event, measure the top Y position of each element and determine
   * which is the last element that is visible above 40% of the viewport height
   */
  const take = useCallbackOne(() => {
    if (!root) {
      setActiveId(undefined);
      return;
    }
    fastdom.measure(() => {
      const scrollY =
        root instanceof Document ? window.scrollY : root.scrollTop;
      const scrollHeight =
        root instanceof Document
          ? document.body.scrollHeight
          : root.scrollHeight;
      const clientHeight =
        root instanceof Document ? window.innerHeight : root.clientHeight;
      const rootTop =
        root instanceof Document ? 0 : root.getBoundingClientRect().top;
      const intersectionTop = scrollY + rootTop;
      const intersectionBottom = scrollY + rootTop + clientHeight;

      // when the user scrolls to the very top of the page, set the anchorInView to the first anchor
      if (scrollY === 0) {
        const firstAnchor = ids[0];
        if (firstAnchor) {
          setActiveId(firstAnchor);
        }
        return;
      }

      // when the user scrolls to the very bottom of the page, set the anchorInView to the last anchor
      const lastAnchor = ids[ids.length - 1];
      if (scrollHeight - clientHeight <= scrollY) {
        if (lastAnchor) {
          setActiveId(lastAnchor);
        }
        return;
      }

      let activeId: string | undefined;
      for (const id of ids) {
        const y = idToYRef.current[id];
        if (y == null) {
          continue;
        }

        if (y > intersectionBottom) {
          break;
        }

        if (y < intersectionTop + clientHeight * 0.4) {
          // if the element is visible above 40% of the viewport height, set it as the activeId
          activeId = id;
        }
      }

      setActiveId(activeId);
    });
  }, [ids, root, setActiveId]);

  /**
   * when the page is mounted or resized, measure the top Y position of each element
   */
  const measure = useCallbackOne(() => {
    if (!root) {
      return;
    }
    fastdom.measure(() => {
      const scrollY =
        root instanceof Document ? window.scrollY : root.scrollTop;
      const top =
        root instanceof Document ? 0 : root.getBoundingClientRect().top;
      try {
        idToYRef.current = Array.from(
          document.querySelectorAll(
            ids
              .filter((id) => id.trim().length > 0)
              .map(toIdQuerySelector)
              .join(", ")
          )
        ).reduce<Record<string, number>>((prev, curr) => {
          prev[curr.id] = curr.getBoundingClientRect().top + scrollY - top;
          return prev;
        }, {});
      } catch (e) {
        // TODO: sentry
        // eslint-disable-next-line no-console
        console.error("Error measuring table of contents", e);
      }
    });

    take();
  }, [ids, root, take]);

  useEffect(() => {
    if (!root) {
      return;
    }
    const observer = new ResizeObserver(measure);
    root.addEventListener("scroll", measure);
    observer.observe(root instanceof Document ? document.body : root);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      root.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [ids, measure, root]);

  return measure;
}
