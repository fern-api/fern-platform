import { DocsPage, getDocsPageStaticProps } from "@fern-ui/ui";
import { GetStaticPaths } from "next";

export default DocsPage;

export const getStaticProps = getDocsPageStaticProps;

export const getStaticPaths: GetStaticPaths = () => {
    return { paths: [], fallback: "blocking" };
};
