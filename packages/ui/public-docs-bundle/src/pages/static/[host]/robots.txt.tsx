import { GetServerSideProps } from "next";

function RobotsTXT(): void {
    // getServerSideProps will do the heavy lifting
}

export default RobotsTXT;

export const getServerSideProps: GetServerSideProps = async ({ params = {}, req, res }) => {
    const xFernHost = process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? req.headers["x-fern-host"] ?? params.host;

    if (xFernHost == null || Array.isArray(xFernHost)) {
        return { notFound: true };
    }

    const hostname = new URL(`https://${xFernHost}`).hostname; // strip basepath

    res.write(`User-Agent: *\nSitemap: https://${hostname}/sitemap.xml`);
    res.end();

    return {
        props: {},
    };
};

export const config = {
    runtime: "edge",
};
