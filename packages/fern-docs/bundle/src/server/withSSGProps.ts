import { GetServerSidePropsResult, GetStaticPropsResult } from "next";

import { UnreachableCaseError } from "ts-essentials";

import { REVALIDATE_SECONDS } from "@fern-docs/utils";

/**
 * Always revalidate redirects and notFound pages.
 *
 * @param ssrProps props for getStaticProps
 * @returns props for getServerSideProps
 */
export async function withSSGProps<Props>(
  ssrProps:
    | GetServerSidePropsResult<Props>
    | PromiseLike<GetServerSidePropsResult<Props>>
): Promise<GetStaticPropsResult<Props>> {
  const ssrPropsResolved = await ssrProps;
  if ("props" in ssrPropsResolved) {
    return {
      props: await ssrPropsResolved.props,
      revalidate: REVALIDATE_SECONDS,
    };
  } else if ("redirect" in ssrPropsResolved) {
    return { redirect: ssrPropsResolved.redirect, revalidate: true };
  } else if ("notFound" in ssrPropsResolved) {
    return { notFound: ssrPropsResolved.notFound, revalidate: true };
  }
  throw new UnreachableCaseError(ssrPropsResolved);
}
