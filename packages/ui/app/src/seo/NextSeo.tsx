import { NEXT_SEO_ATOM } from "@/atoms";
import { buildTags } from "@fern-ui/next-seo";
import { useAtomValue } from "jotai";
import Head from "next/head";
import { ReactElement } from "react";

export const NextSeo = (): ReactElement => {
    const props = useAtomValue(NEXT_SEO_ATOM);
    return <Head>{buildTags(props)}</Head>;
};
