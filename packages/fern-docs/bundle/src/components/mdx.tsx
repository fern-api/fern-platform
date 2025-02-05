"use server";

import {
  MdxBundlerComponent,
  serializeMdx,
} from "@/client/mdx/bundlers/mdx-bundler";
import { createCachedDocsLoader } from "@/server/cached-docs-loader";
import { createFileResolver } from "@/server/file-resolver";
import SetLayoutAtom from "@/state/set-layout-atom";

export default async function Mdx({
  children,
  filename,
  scope,
  dangerouslyForceHydrate,
}: {
  children: string;
  filename: string;
  scope: Record<string, unknown>;
  dangerouslyForceHydrate?: boolean;
}) {
  const docsLoader = await createCachedDocsLoader();
  const [mdxBundlerFiles, remoteFiles] = await Promise.all([
    docsLoader.getMdxBundlerFiles(),
    docsLoader.getFiles(),
  ]);

  const replaceSrc = createFileResolver(remoteFiles);
  const mdx = await serializeMdx(children, {
    filename,
    files: mdxBundlerFiles,
    scope,
    replaceSrc,
  });

  if (typeof mdx === "string") {
    return (
      <pre className="break-normal">
        <SetLayoutAtom
          layout="guide"
          dangerouslyForceHydrate={dangerouslyForceHydrate}
        >
          <div>{mdx}</div>
        </SetLayoutAtom>
      </pre>
    );
  }

  return (
    <MdxBundlerComponent
      {...mdx}
      dangerouslyForceHydrate={dangerouslyForceHydrate}
    />
  );
}
