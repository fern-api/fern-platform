import { BuiltWithFern as BuiltWithFernComponent } from "@fern-docs/components";
import { createContext, useContext, useEffect, useRef } from "react";
import { trackInternal } from "../analytics";
import { useDomain, useEdgeFlag } from "../atoms";

export const BuiltWithFern: React.FC<{ className?: string }> = ({
  className,
}) => {
  const domain = useDomain();
  const isWhitelabeled = useEdgeFlag("isWhitelabeled");
  const hideBuiltWithFern = useContext(HideBuiltWithFernContext);
  const component = useRef<HTMLAnchorElement>(null);

  if (isWhitelabeled || hideBuiltWithFern) {
    return null;
  }

  /**
   * if the docs is not whitelabeled, the following ensures that builtwithfern is not removed from the DOM:
   * - we'll use a inline <style> tag to ensure that the !important rules are applied and cannot be overridden using custom CSS
   * - then, we'll use a setTimeout to check if builtwithfern is visible 15 seconds after it's mounted
   * - and if it's not visible, we'll emit an internal event: "builtwithfern_removed"
   */
  return (
    <>
      <style>
        {`
#builtwithfern {
  display: flex !important;
  opacity: 100% !important;
}

#builtwithfern * {
  display: initial !important;
  width: unset !important;
  opacity: 100% !important;
}

#builtwithfern,
#builtwithfern * {
  visibility: initial !important;
  overflow: visible !important;
  position: relative !important;
  left: unset !important;
  top: unset !important;
  right: unset !important;
  bottom: unset !important;
  inset: unset !important;
}`}
      </style>
      <BuiltWithFernComponent
        ref={component}
        id="builtwithfern"
        utmCampaign="buildWith"
        utmMedium="docs"
        utmSource={domain}
        className={className}
      />
      <BuiltWithFernWatcher component={component} />
    </>
  );
};

function BuiltWithFernWatcher({
  component,
}: {
  component: React.RefObject<HTMLAnchorElement>;
}) {
  useEffect(() => {
    const checkVisibility = () => {
      const el = component.current;
      const { width, height } = el?.getBoundingClientRect() ?? {};
      if (
        el == null || // builtwithfern is not mounted
        !document.body.contains(el) || // builtwithfern is not in the DOM
        el.offsetParent == null || // builtwithfern is not visible
        !width ||
        width < 50 ||
        !height ||
        height < 10
      ) {
        // send alert to fern that builtwithfern was removed from the DOM
        trackInternal("builtwithfern_removed");

        if (process.env.NODE_ENV === "development") {
          console.debug("builtwithfern is not visible");
        }
      }
    };

    const intervalId = window.setTimeout(checkVisibility, 15_000);
    return () => window.clearTimeout(intervalId);
  }, [component]);

  return false;
}

export const HideBuiltWithFernContext = createContext(false);
