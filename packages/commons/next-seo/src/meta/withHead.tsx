import Head from "next/head";
import { ReactElement } from "react";
import { BuildTagsParams } from "../types";
import buildTags from "./buildTags";

export const WithHead = (props: BuildTagsParams): ReactElement => {
    return <Head>{buildTags(props)}</Head>;
};
