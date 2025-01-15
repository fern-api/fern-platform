import { FernButton } from "@fern-docs/components";
import { getVersionAvailabilityLabel } from "@fern-platform/fdr-utils";
import { Lock, NavArrowDown } from "iconoir-react";
import { useAtomValue } from "jotai";
import {
  CURRENT_VERSION_ID_ATOM,
  CURRENT_PRODUCT_ID_ATOM,
  PRODUCTS_ATOM,
} from "../atoms";
import { FernLinkDropdown } from "../components/FernLinkDropdown";
import { useToHref } from "../hooks/useHref";

export const VersionDropdown = () => {
  const products = useAtomValue(PRODUCTS_ATOM);
  const currentVersionId = useAtomValue(CURRENT_VERSION_ID_ATOM);
  const currentProductId = useAtomValue(CURRENT_PRODUCT_ID_ATOM);
  const toHref = useToHref();

  const currentProduct = products.find(
    (product) => product.productId === currentProductId
  );

  const versions =
    currentProduct?.child.type === "versioned"
      ? currentProduct.child.children
      : [];

  if (versions.length <= 1) {
    return null;
  }

  const currentVersion = versions.find(({ id }) => id === currentVersionId);

  return (
    <div className="flex max-w-32">
      <FernLinkDropdown
        value={currentVersionId}
        options={versions.map(
          ({ id, title, availability, slug, pointsTo, hidden, authed }) => ({
            type: "value",
            label: title,
            helperText:
              availability != null
                ? getVersionAvailabilityLabel(availability)
                : undefined,
            value: id,
            disabled: availability == null,
            href: toHref(pointsTo ?? slug),
            icon: authed ? (
              <Lock className="text-faded size-4 self-center" />
            ) : undefined,
            className: hidden ? "opacity-50" : undefined,
          })
        )}
        contentProps={{
          "data-testid": "version-dropdown-content",
        }}
      >
        <FernButton
          data-testid="version-dropdown"
          intent="primary"
          variant="outlined"
          text={currentVersion?.title ?? currentVersionId}
          rightIcon={
            <NavArrowDown className="transition-transform data-[state=open]:rotate-180" />
          }
          disableAutomaticTooltip
        />
      </FernLinkDropdown>
    </div>
  );
};
