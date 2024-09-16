import { atomWithStorage } from "jotai/utils";

export const FERN_STREAM_ATOM = atomWithStorage("fern-stream", true);
FERN_STREAM_ATOM.debugLabel = "FERN_STREAM_ATOM";
