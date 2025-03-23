"use client";

import { ChevronDown, Lock } from "lucide-react";

import {
  Availability,
  AvailabilityBadge,
  FernProductDropdown,
} from "@fern-docs/components";
import { slugToHref } from "@fern-docs/utils";

import { useCurrentProductId, useCurrentProductSlug } from "@/state/navigation";

// import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export interface ProductDropdownItem {
  productId: string;
  title: string;
  subtitle?: string;
  slug: string;
  defaultSlug?: string;
  icon?: React.ReactNode;
  authed?: boolean;
  default: boolean;
  availability?: Availability;
  hidden?: boolean;
}

export function ProductDropdownClient({
  products,
}: {
  products: ProductDropdownItem[];
}) {
  const currentProductId = useCurrentProductId();
  const currentProductSlug = useCurrentProductSlug();
  const currentProduct =
    products.find((product) => product.productId === currentProductId) ??
    products.find((product) => product.default);

  console.log(
    "currentProductSlug",
    "pick",
    pickProductSlug({
      currentProductSlug,
      slug: "learn/sdks",
    })
  );
  return (
    <FernProductDropdown
      value={currentProductId}
      options={products.map(
        ({
          icon,
          productId,
          title,
          availability,
          slug,
          defaultSlug,
          authed,
          hidden,
          subtitle,
        }) => ({
          type: "product",
          id: productId,
          title,
          subtitle,
          label: (
            <div className="flex items-center gap-2">
              {title}
              {availability != null ? (
                <AvailabilityBadge availability={availability} size="sm" />
              ) : null}
            </div>
          ),
          value: productId,
          disabled: availability == null,
          href: slugToHref(
            pickProductSlug({
              currentProductSlug,
              defaultSlug,
              slug,
            })
          ),
          icon: authed ? (
            <Lock className="text-(color:--grayscale-a9) size-4 self-center" />
          ) : (
            icon
          ),
          className: hidden ? "opacity-50" : undefined,
        })
      )}
      contentProps={{
        "data-testid": "product-dropdown-content",
      }}
      side="bottom"
      align="start"
    >
      <button className="rounded-3/2 hover:bg-(color:--grayscale-a4) flex cursor-pointer items-center gap-1 self-baseline px-2 transition-[background-color]">
        {currentProduct?.title}
        <ChevronDown className="size-icon transition-transform data-[state=open]:rotate-180" />
      </button>
    </FernProductDropdown>
  );

  function pickProductSlug({
    currentProductSlug,
    defaultSlug,
    slug,
  }: {
    currentProductSlug?: string;
    defaultSlug?: string;
    slug: string;
  }): string {
    if (!defaultSlug) {
      return slug;
    }

    if (currentProductSlug != null && slug.startsWith(currentProductSlug)) {
      return slug;
    }

    return defaultSlug;
  }
}
