import { buildTags } from "@fern-docs/seo";
import { useAtomValue } from "jotai";
import Head from "next/head";
import { ReactElement } from "react";
import { NEXT_SEO_ATOM } from "../atoms";

export const NextSeo = (): ReactElement => {
  const props = useAtomValue(NEXT_SEO_ATOM);
  return <Head>{buildTags(props)}</Head>;
};
