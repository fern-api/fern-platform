import { parseServerSidePathname } from "@/hooks/use-current-pathname";
import { isEmpty } from "es-toolkit/compat";
import { GetServerSideProps } from "next";
import Error from "next/error";

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (isEmpty(context.query.error)) {
    const url = new URL(context.resolvedUrl);
    const pathname = parseServerSidePathname(url.pathname);
    const searchParams = new URLSearchParams(url.search);
    searchParams.set("error", "true");
    return {
      redirect: {
        destination: pathname + "?" + searchParams.toString(),
        permanent: false,
      },
    };
  }
  return { props: { errorCode: 500 } };
};

export default function Page({ errorCode }: { errorCode: number }) {
  return <Error statusCode={errorCode} />;
}
