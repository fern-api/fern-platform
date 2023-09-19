import { GetServerSideProps } from "next";

function RobotsTXT(): void {
    // getServerSideProps will do the heavy lifting
}

export default RobotsTXT;

export const getServerSideProps: GetServerSideProps = async ({ params = {}, res }) => {
    const host = params.host as string | undefined;

    if (host == null) {
        throw new Error("host is not defined");
    }
    const hostWithoutTrailingSlash = host.endsWith("/") ? host.slice(0, -1) : host;

    res.write(`User-Agent: *
Sitemap: ${hostWithoutTrailingSlash}/sitemap.xml`);
    res.end();

    return {
        props: {},
    };
};
