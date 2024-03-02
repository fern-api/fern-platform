import { DocsPage, getDocsServerSideProps } from "@fern-ui/ui";
import { GetServerSideProps } from "next";

export default DocsPage;

export const getServerSideProps: GetServerSideProps = (context) => {
    if (context.query.error === "true") {
        context.res.statusCode = 500;
    }

    return getDocsServerSideProps(context);
};
