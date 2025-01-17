import { FernButton } from "@fern-docs/components";
import { getVersionAvailabilityLabel } from "@fern-platform/fdr-utils";
import { motion } from "framer-motion";
import { useAtomValue } from "jotai";
import { ChevronDown, Lock } from "lucide-react";
import {
  CURRENT_PRODUCT_ID_ATOM,
  CURRENT_VERSION_ID_ATOM,
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
              <Lock className="text-muted size-4 self-center" />
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
          className="h-8 px-2"
          text={currentVersion?.title ?? currentVersionId}
          rightIcon={
            <motion.div
              animate={{
                rotate:
                  "var(--radix-dropdown-menu-trigger-data-[state=open]:rotate-180)",
              }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <ChevronDown className="text-muted size-4 text-xs" />
            </motion.div>
          }
          disableAutomaticTooltip
        />
      </FernLinkDropdown>
    </div>
  );
};
