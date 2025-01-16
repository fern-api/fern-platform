import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FernButton, RemoteFontAwesomeIcon } from "@fern-docs/components";
import { useAtomValue, useSetAtom } from "jotai";
import { ChevronDown, Package } from "lucide-react";
import { CURRENT_PRODUCT_ID_ATOM, PRODUCTS_ATOM } from "../atoms/navigation";
import { FernLinkDropdown } from "../components/FernLinkDropdown";
import { useToHref } from "../hooks/useHref";

export declare namespace ProductDropdown {
  export interface Props {}
}

export const ProductDropdown: React.FC<ProductDropdown.Props> = () => {
  const products = useAtomValue(PRODUCTS_ATOM);
  const currentProductId = useAtomValue(CURRENT_PRODUCT_ID_ATOM);
  const setCurrentProductId = useSetAtom(CURRENT_PRODUCT_ID_ATOM);
  const toHref = useToHref();

  const currentProduct = products.find(
    ({ productId }) => productId === currentProductId
  );

  if (products.length <= 1) {
    return null;
  }

  return (
    <div className="flex max-w-[300px]">
      <FernLinkDropdown
        value={currentProductId}
        onValueChange={(newProductId) => {
          setCurrentProductId(newProductId as FernNavigation.ProductId);
        }}
        options={products.map(
          ({ productId, title, subtitle, slug, pointsTo, hidden, icon }) => ({
            type: "value",
            label: (
              <div className="flex items-center gap-3">
                <div className="bg-background-tertiary flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <ProductIcon icon={icon} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{title}</span>
                  {subtitle && (
                    <span className="text-muted text-sm">{subtitle}</span>
                  )}
                </div>
              </div>
            ),
            value: productId,
            href: toHref(pointsTo ?? slug),
            className: hidden
              ? "opacity-50"
              : "hover:bg-background-secondary p-4",
          })
        )}
        contentProps={{
          "data-testid": "product-dropdown-content",
          className: "w-[300px] p-1",
        }}
      >
        <FernButton
          data-testid="product-dropdown"
          intent="primary"
          variant="outlined"
          text={currentProduct?.title ?? currentProductId}
          rightIcon={
            <ChevronDown className="transition-transform data-[state=open]:rotate-180" />
          }
          disableAutomaticTooltip
        />
      </FernLinkDropdown>
    </div>
  );
};

const ProductIcon = ({ icon }: { icon?: string }) => {
  if (icon) {
    return (
      <RemoteFontAwesomeIcon
        className="text-accent group-hover:text-accent-hover size-5"
        icon={icon.replace(/^fa-(?:brands|regular|solid)-/, "")}
      />
    );
  }

  return (
    <Package className="text-accent group-hover:text-accent-hover size-5" />
  );
};
