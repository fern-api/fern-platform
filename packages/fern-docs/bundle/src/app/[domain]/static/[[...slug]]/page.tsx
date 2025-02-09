import { Metadata } from "next/types";
import Page, { generateMetadata as _generateMetadata } from "../../_page";

export default async function StaticPage(
  props: {
    params: Promise<{ slug?: string[]; domain: string }>;
  }
) {
  const params = await props.params;
  return <Page params={params} fern_token={undefined} />;
}

export async function generateMetadata(
  props: {
    params: Promise<{ slug?: string[]; domain: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  return _generateMetadata({ params, fern_token: undefined });
}
