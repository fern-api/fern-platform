"use server";

import { FernNavigation } from "@fern-api/fdr-sdk";
import { headers } from "next/headers";
import IfProduct from "./if-product";
import IfVersion from "./if-version";
import SidebarTablist from "./sidebar-tablist";

export default async function SidebarTabs({
  root,
}: {
  root: FernNavigation.RootNode;
}) {
  const slug = FernNavigation.slugjoin(headers().get("x-pathname"));
  const found = FernNavigation.utils.findNode(root, slug);

  const renderTabbedNode = (node: FernNavigation.TabbedNode) => {
    if (node.children.length === 0) {
      return false;
    }
    return (
      <SidebarTablist
        tabs={node.children}
        defaultActiveTabId={
          found.type === "found" ? found.currentTab?.id : undefined
        }
      />
    );
  };

  const renderUnversionedNode = (node: FernNavigation.UnversionedNode) => {
    if (node.child.type !== "tabbed") {
      return false;
    }
    return renderTabbedNode(node.child);
  };

  const renderVersionedNode = (node: FernNavigation.VersionedNode) => {
    if (node.children.length === 0) {
      return false;
    }
    const currentVersion =
      (found.type === "found" ? found.currentVersion : undefined) ??
      node.children.find((version) => version.default) ??
      node.children[0];
    return (
      <>
        {node.children.map((versionNode) => {
          if (versionNode.child.type !== "tabbed") {
            return false;
          }
          return (
            <IfVersion
              key={versionNode.versionId}
              equals={versionNode.versionId}
              // this layout is computed only on the first render, so we need to use defaultTrue
              // afterwards, the version will be updated client-side
              defaultTrue={versionNode.id === currentVersion?.id}
            >
              <SidebarTablist tabs={versionNode.child.children} />
            </IfVersion>
          );
        })}
      </>
    );
  };

  const renderProductGroupNode = (node: FernNavigation.ProductGroupNode) => {
    if (node.children.length === 0) {
      return false;
    }
    const currentProduct =
      (found.type === "found" ? found.currentProduct : undefined) ??
      node.children.find((product) => product.default) ??
      node.children[0];
    return (
      <>
        {node.children.map((productNode) => {
          const child =
            productNode.child.type === "versioned"
              ? renderVersionedNode(productNode.child)
              : productNode.child.type === "unversioned"
                ? renderUnversionedNode(productNode.child)
                : false;
          if (!child) {
            return false;
          }
          return (
            <IfProduct
              key={productNode.productId}
              equals={productNode.productId}
              defaultTrue={productNode.id === currentProduct?.id}
            >
              {child}
            </IfProduct>
          );
        })}
      </>
    );
  };

  if (root.child.type === "unversioned") {
    return renderUnversionedNode(root.child);
  } else if (root.child.type === "versioned") {
    return renderVersionedNode(root.child);
  } else if (root.child.type === "productgroup") {
    return renderProductGroupNode(root.child);
  }

  return false;
}
