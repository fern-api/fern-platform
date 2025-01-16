import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FernButton } from "@fern-docs/components";
import { NavArrowDown } from "iconoir-react";
import { useAtomValue, useSetAtom } from "jotai";
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
          ({ productId, title, subtitle, slug, pointsTo, hidden }) => ({
            type: "value",
            label: (
              <div className="flex items-center gap-3">
                <div className="bg-background-tertiary flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <ProductIcon productId={productId} />
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
            <NavArrowDown className="transition-transform data-[state=open]:rotate-180" />
          }
          disableAutomaticTooltip
        />
      </FernLinkDropdown>
    </div>
  );
};

const ProductIcon = ({
  productId,
}: {
  productId: FernNavigation.ProductId;
}) => {
  switch (productId) {
    case "sdks":
      return <CodeIcon className="text-accent size-5" />;
    case "docs":
      return <DocumentIcon className="text-accent size-5" />;
    default:
      return null;
  }
};

const CodeIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 6L3 12L8 18M16 6L21 12L16 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DocumentIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 7H17M7 12H17M7 17H13"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
