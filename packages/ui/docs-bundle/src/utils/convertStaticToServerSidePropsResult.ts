import { GetServerSidePropsResult, GetStaticPropsResult } from "next";
import { UnreachableCaseError } from "ts-essentials";

export function convertStaticToServerSidePropsResult<Props>(
    staticProps: GetStaticPropsResult<Props>,
): GetServerSidePropsResult<Props> {
    if ("props" in staticProps) {
        return { props: staticProps.props };
    } else if ("redirect" in staticProps) {
        return { redirect: staticProps.redirect };
    } else if ("notFound" in staticProps) {
        return { notFound: staticProps.notFound };
    }
    throw new UnreachableCaseError(staticProps);
}
