import type { FernUser } from "@fern-ui/fern-docs-auth";
import { isEqual } from "es-toolkit/predicate";
import { Atom, useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import { DOCS_ATOM } from "./docs";

export const FERN_USER_ATOM = selectAtom(DOCS_ATOM, (docs) => docs.user, isEqual);

FERN_USER_ATOM.debugLabel = "FERN_USER_ATOM";

interface UseFernUserOptions {
    /**
     * A fern user atom for testing purposes only
     */
    __test_fern_user_atom?: Atom<FernUser | undefined>;
}

export function useFernUser({ __test_fern_user_atom }: UseFernUserOptions = {}): FernUser | undefined {
    return useAtomValue(__test_fern_user_atom ?? FERN_USER_ATOM);
}
