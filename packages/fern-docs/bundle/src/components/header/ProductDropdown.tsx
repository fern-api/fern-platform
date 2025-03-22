import { FernNavigation } from "@fern-api/fdr-sdk";
import { DocsLoader } from "@/server/docs-loader";
import { FaIconServer } from "../fa-icon-server";
import { ProductDropdownClient, ProductDropdownItem } from "./ProductDropdownClient";

export declare namespace ProductDropdown {
  export interface Props {}
}

export async function ProductDropdown({ loader }: { loader: DocsLoader }) {
  const root = await loader.getRoot();
  if (root.child.type !== "productgroup") {
    return null;
  }

  const products = root.child.children;
  const productOptions = products.map((product): ProductDropdownItem => {
    const slug = product.slug ?? product.pointsTo;
    return {
      productId: product.productId,
      title: product.title,
      slug,
      defaultSlug: product.default
        ? FernNavigation.toDefaultSlug(slug, root.slug, product.slug)
        : undefined,
      icon: product.icon ? <FaIconServer icon={product.icon} /> : undefined,
      authed: product.authed,
      default: product.default,
      hidden: product.hidden,
    };
  });
  return <ProductDropdownClient products={productOptions} />;
}
