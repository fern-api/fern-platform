import { RefObject, useCallback, useEffect, useState } from "react";

export function useIsScrolled(ref?: RefObject<HTMLElement | null>): boolean {
  const [isScrolled, setIsScrolled] = useState(false);

  const getScrollY = useCallback(() => {
    if (ref?.current) {
      return ref.current.scrollTop;
    } else if (typeof window !== "undefined") {
      return window.scrollY;
    }
    return 0;
  }, [ref]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(getScrollY() > 0);
    };

    handleScroll();

    if (ref?.current) {
      const element = ref.current;
      ref.current.addEventListener("scroll", handleScroll, { passive: true });

      return () => {
        element.removeEventListener("scroll", handleScroll);
      };
    } else if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll, { passive: true });

      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
    return;
  }, [getScrollY, ref]);

  return isScrolled;
}
