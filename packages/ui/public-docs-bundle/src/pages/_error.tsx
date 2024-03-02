import { GetServerSideProps } from "next";
import Error from "next/error";
import { ReactElement } from "react";

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    if (req.url != null) {
        return {
            redirect: {
                destination: `${req.url}?error=true`,
                permanent: false,
            },
        };
    }
    return {
        props: { errorCode: 500 },
    };
};

interface ServerErrorProps {
    errorCode: number;
}

export default function Page({ errorCode }: ServerErrorProps): ReactElement {
    return <Error statusCode={errorCode} />;
}
