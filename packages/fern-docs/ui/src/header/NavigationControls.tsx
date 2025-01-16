import { useAtomValue } from "jotai";
import { PRODUCTS_ATOM, VERSIONS_ATOM } from "../atoms/navigation";
import { ProductDropdown } from "./ProductDropdown";
import { VersionDropdown } from "./VersionDropdown";

export const NavigationControls = () => {
  const products = useAtomValue(PRODUCTS_ATOM);
  const versions = useAtomValue(VERSIONS_ATOM);

  return (
    <div className="flex items-center gap-1 px-2">
      {products.length > 1 && <ProductDropdown />}
      {versions.length > 1 && <VersionDropdown />}
    </div>
  );
};
