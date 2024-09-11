import urlJoin from "url-join";

export function getPageRoute(ssg: boolean, host: string, pathname: string): string {
    const prefix = ssg ? "static" : "dynamic";
    return urlJoin("/", prefix, host, pathname);
}
