import { GetServerSideProps } from "next";
import Error from "next/error";

import { isEmpty } from "es-toolkit/compat";

import { parseServerSidePathname } from "@/hooks/use-current-pathname";

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (isEmpty(context.query.error) && context.req.url) {
    console.debug("resolvedUrl", context.resolvedUrl);
    const url = new URL(
      context.resolvedUrl,
      `https://${context.req.headers.host}`
    );
    url.pathname = parseServerSidePathname(url.pathname);
    const searchParams = new URLSearchParams(url.search);
    searchParams.set("error", "true");
    url.search = String(searchParams);
    const destination = String(url);
    console.debug("destination", destination);
    return {
      redirect: {
        destination,
        permanent: false,
      },
    };
  }
  return { props: { errorCode: 500 } };
};

export default function Page({ errorCode }: { errorCode: number }) {
  return <Error statusCode={errorCode} />;
}
