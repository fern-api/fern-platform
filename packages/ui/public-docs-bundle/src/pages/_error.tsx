import { GetServerSideProps } from "next";
import Error from "next/error";
import { ReactElement } from "react";

export const getServerSideProps: GetServerSideProps = async ({ req, resolvedUrl }) => {
    if (req.statusCode === 500 && req.url != null && resolvedUrl.startsWith("/static")) {
        return {
            redirect: {
                destination: `${req.url}${req.url.includes("?") ? "&" : "?"}error=true`,
                permanent: false,
            },
        };
    }
    return {
        props: { errorCode: req.statusCode },
    };
};

interface ServerErrorProps {
    errorCode: number;
}

export default function Page({ errorCode }: ServerErrorProps): ReactElement {
    return <Error statusCode={errorCode} />;
}
