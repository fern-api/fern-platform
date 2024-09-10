import { useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import { SCROLL_BODY_ATOM } from "../../atoms";

export function useTableOfContentsObserver(ids: string[], setActiveId: (id: string) => void): void {
    const ref = useRef<Record<string, IntersectionObserverEntry>>({});
    const root = useAtomValue(SCROLL_BODY_ATOM);

    useEffect(() => {
        ref.current = Object.fromEntries(Object.entries(ref.current).filter(([id]) => ids.includes(id)));
    }, [ids]);

    useEffect(() => {
        const callback: IntersectionObserverCallback = (headings) => {
            ref.current = headings.reduce((acc, heading) => {
                acc[heading.target.id] = heading;
                return acc;
            }, ref.current);

            const visibleHeadings: IntersectionObserverEntry[] = Object.values(ref.current).filter(
                (heading) => heading.isIntersecting,
            );

            const sortedVisibleHeadings = visibleHeadings
                .map((item) => item.target.id)
                .filter((id) => ids.includes(id))
                .sort((a, b) => ids.indexOf(a) - ids.indexOf(b));

            if (sortedVisibleHeadings[0] != null) {
                setActiveId(sortedVisibleHeadings[0]);
            }
        };

        const observer = new IntersectionObserver(callback, {
            rootMargin: "-110px 0px -40% 0px",
            root,
        });

        const headingElements = Array.from(document.querySelectorAll(ids.map((id) => `#${id}`).join(", ")));
        headingElements.forEach((element) => observer.observe(element));

        return () => observer.disconnect();
    }, [ids, root, setActiveId]);
}
