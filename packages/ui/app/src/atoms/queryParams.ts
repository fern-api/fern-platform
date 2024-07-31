import { atom } from "jotai";
import { ParsedUrlQuery } from "querystring";

export type Query = ParsedUrlQuery;

export const FERN_QUERY_PARAMS = atom<Query>({});
FERN_QUERY_PARAMS.debugLabel = "FERN_QUERY_PARAMS";
