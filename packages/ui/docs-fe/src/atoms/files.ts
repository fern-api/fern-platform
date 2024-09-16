import type { DocsV1Read } from "@fern-api/fdr-sdk/client/types";
import { atom, useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import { isEqual } from "lodash-es";
import { useMemoOne } from "use-memo-one";
import { DOCS_ATOM } from "./docs";

export const FILES_ATOM = selectAtom(DOCS_ATOM, (docs) => docs.files, isEqual);
FILES_ATOM.debugLabel = "FILES_ATOM";

export function useFile(fileId: DocsV1Read.FileId): DocsV1Read.File_ | undefined {
    return useAtomValue(useMemoOne(() => atom((get) => get(FILES_ATOM)[fileId]), [fileId]));
}
