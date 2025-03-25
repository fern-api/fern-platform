import { DocsSite } from "@fern-platform/fdr";

export function getDocsSiteUrl({ titleDomain }: DocsSite) {
  if (titleDomain.path == null) {
    return titleDomain.domain;
  }
  return `${titleDomain.domain}${titleDomain.path}`;
}
