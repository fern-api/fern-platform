import "server-only";

import { FernNavigation } from "@fern-api/fdr-sdk";

import { DocsLoader } from "@/server/docs-loader";
import { withVersionSwitcherInfo } from "@/server/withVersionSwitcherInfo";

import { FaIconServer } from "../fa-icon-server";
import {
  VersionDropdownClient,
  VersionDropdownItem,
} from "./VersionDropdownClient";

export declare namespace VersionDropdown {
  export interface Props {}
}

export async function VersionDropdown({
  loader,
  currentNode,
  slugMap,
  parents,
}: {
  loader: DocsLoader;
  slugMap: Map<string, FernNavigation.NavigationNodeWithMetadata>;
  currentNode: FernNavigation.NavigationNodeWithMetadata;
  parents: FernNavigation.NavigationNodeParent[];
}) {
  const root = await loader.getRoot();
  if (root.child.type !== "versioned") {
    return null;
  }

  const versions = root.child.children;

  const withInfo = withVersionSwitcherInfo({
    node: currentNode,
    parents: parents,
    versions,
    slugMap,
  });

  const versionOptions = versions.map((version): VersionDropdownItem => {
    const versionInfo = withInfo.find((info) => info.id === version.versionId);
    const slug =
      versionInfo?.pointsTo ??
      versionInfo?.landingPage ??
      versionInfo?.slug ??
      version.slug;
    return {
      versionId: version.versionId,
      title: version.title,
      slug,
      defaultSlug: version.default
        ? FernNavigation.toDefaultSlug(slug, root.slug, version.slug)
        : undefined,
      icon: version.icon ? <FaIconServer icon={version.icon} /> : undefined,
      authed: version.authed,
      default: version.default,
      availability: version.availability,
      hidden: version.hidden,
    };
  });
  return <VersionDropdownClient versions={versionOptions} />;
}
