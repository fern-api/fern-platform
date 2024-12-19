/**
 * @vitest-environment jsdom
 */

import { FernUser } from "@fern-docs/auth";
import { EVERYONE_ROLE } from "@fern-docs/utils";
import { render } from "@testing-library/react";
import { Atom, atom } from "jotai";
import { freezeAtom } from "jotai/utils";
import { If } from "./If";

function createTestFernUserAtom(
    roles: string[] | false
): Atom<FernUser | undefined> {
    return freezeAtom(atom(roles ? { roles } : undefined));
}

describe("If", () => {
    it("renders when the roles=[], and the user is logged with roles=[]", async () => {
        const { findByText } = render(
            <If roles={[]} __test_fern_user_atom={createTestFernUserAtom([])}>
                capture_the_flag
            </If>
        );
        await expect(findByText("capture_the_flag")).resolves.toBeDefined();
    });

    it("renders when user matches role exactly", async () => {
        const { findByText } = render(
            <If
                roles={["beta-users"]}
                __test_fern_user_atom={createTestFernUserAtom(["beta-users"])}
            >
                capture_the_flag
            </If>
        );

        await expect(findByText("capture_the_flag")).resolves.toBeDefined();
    });

    it("renders when user overlaps with one of the roles", async () => {
        const { findByText } = render(
            <If
                roles={["beta-users", "alpha-users"]}
                __test_fern_user_atom={createTestFernUserAtom([
                    "beta-users",
                    "theta-users",
                ])}
            >
                capture_the_flag
            </If>
        );

        await expect(findByText("capture_the_flag")).resolves.toBeDefined();
    });

    it("hides when the user does not overlap with any of the roles", async () => {
        const { findByText } = render(
            <If
                roles={["beta-users"]}
                __test_fern_user_atom={createTestFernUserAtom(["alpha-users"])}
            >
                capture_the_flag
            </If>
        );

        await expect(
            findByText("capture_the_flag", { exact: false })
        ).rejects.toThrow();
    });

    it("renders when the roles=[], and the user exists", async () => {
        const { findByText } = render(
            <If roles={[]} __test_fern_user_atom={createTestFernUserAtom([])}>
                capture_the_flag
            </If>
        );
        await expect(findByText("capture_the_flag")).resolves.toBeDefined();
    });

    it("renders when the roles=[], and the user exists and has a role", async () => {
        const { findByText } = render(
            <If
                roles={[]}
                __test_fern_user_atom={createTestFernUserAtom(["beta-users"])}
            >
                capture_the_flag
            </If>
        );
        await expect(findByText("capture_the_flag")).resolves.toBeDefined();
    });

    it("hides when the roles=[], and the user is not logged in", async () => {
        const { findByText } = render(
            <If
                roles={[]}
                __test_fern_user_atom={createTestFernUserAtom(false)}
            >
                capture_the_flag
            </If>
        );
        await expect(findByText("capture_the_flag")).rejects.toThrow();
    });

    it("renders when the roles=undefined, and the user exists", async () => {
        const { findByText } = render(
            <If __test_fern_user_atom={createTestFernUserAtom([])}>
                capture_the_flag
            </If>
        );
        await expect(findByText("capture_the_flag")).resolves.toBeDefined();
    });

    it("renders when the roles=undefined, and the user does not exist", async () => {
        const { findByText } = render(
            <If __test_fern_user_atom={createTestFernUserAtom(false)}>
                capture_the_flag
            </If>
        );
        await expect(findByText("capture_the_flag")).resolves.toBeDefined();
    });

    it("hides when the not=true, and user is not logged in", async () => {
        const { findByText } = render(
            <If not __test_fern_user_atom={createTestFernUserAtom(false)}>
                capture_the_flag
            </If>
        );
        await expect(findByText("capture_the_flag")).rejects.toThrow();
    });

    it("hides when the not=true, and user is logged in", async () => {
        const { findByText } = render(
            <If not __test_fern_user_atom={createTestFernUserAtom([])}>
                capture_the_flag
            </If>
        );
        await expect(findByText("capture_the_flag")).rejects.toThrow();
    });

    it("renders when loggedIn=true", async () => {
        const { findByText } = render(
            <If loggedIn __test_fern_user_atom={createTestFernUserAtom([])}>
                capture_the_flag
            </If>
        );
        await expect(findByText("capture_the_flag")).resolves.toBeDefined();
    });

    it("hides when loggedIn=true, and user is not logged in", async () => {
        const { findByText } = render(
            <If loggedIn __test_fern_user_atom={createTestFernUserAtom(false)}>
                capture_the_flag
            </If>
        );
        await expect(findByText("capture_the_flag")).rejects.toThrow();
    });

    it("renders when not loggedIn=true, and user is not logged in", async () => {
        const { findByText } = render(
            <If
                not
                loggedIn
                __test_fern_user_atom={createTestFernUserAtom(false)}
            >
                capture_the_flag
            </If>
        );
        await expect(findByText("capture_the_flag")).resolves.toBeDefined();
    });

    it("hides when not loggedIn=true, and user is logged in", async () => {
        const { findByText } = render(
            <If not loggedIn __test_fern_user_atom={createTestFernUserAtom([])}>
                capture_the_flag
            </If>
        );
        await expect(findByText("capture_the_flag")).rejects.toThrow();
    });

    it("renders when the role is everyone, including when the user is not logged in", async () => {
        const { findByText } = render(
            <If
                roles={[EVERYONE_ROLE]}
                __test_fern_user_atom={createTestFernUserAtom(false)}
            >
                capture_the_flag
            </If>
        );
        await expect(findByText("capture_the_flag")).resolves.toBeDefined();
    });

    it("renders when the role is everyone, and the user is logged in", async () => {
        const { findByText } = render(
            <If
                roles={[EVERYONE_ROLE]}
                __test_fern_user_atom={createTestFernUserAtom([])}
            >
                capture_the_flag
            </If>
        );
        await expect(findByText("capture_the_flag")).resolves.toBeDefined();
    });

    it("hides when the user matches role and the not=true", async () => {
        const { findByText } = render(
            <If
                not
                roles={["beta-users"]}
                __test_fern_user_atom={createTestFernUserAtom([
                    "beta-users",
                    "beta-users-2",
                ])}
            >
                capture_the_flag
            </If>
        );
        await expect(findByText("capture_the_flag")).rejects.toThrow();
    });

    it("renders when the user does not match a role and not=true", async () => {
        const { findByText } = render(
            <If
                not
                roles={["beta-users"]}
                __test_fern_user_atom={createTestFernUserAtom([
                    "alpha-users",
                    "theta-users",
                ])}
            >
                capture_the_flag
            </If>
        );
        await expect(findByText("capture_the_flag")).resolves.toBeDefined();
    });

    it("renders when not=true && roles=[], and the user's roles do not overlap", async () => {
        const { findByText } = render(
            <If
                not
                roles={[]}
                __test_fern_user_atom={createTestFernUserAtom(["beta-users"])}
            >
                capture_the_flag
            </If>
        );
        await expect(findByText("capture_the_flag")).resolves.toBeDefined();
    });

    it("hides when not=true && roles=[], and the user has role=[], and not=true", async () => {
        const { findByText } = render(
            <If
                not
                roles={[]}
                __test_fern_user_atom={createTestFernUserAtom([])}
            >
                capture_the_flag
            </If>
        );
        await expect(findByText("capture_the_flag")).rejects.toThrow();
    });

    it("renders when not=true && roles=[], and the user is not logged in", async () => {
        const { findByText } = render(
            <If
                not
                roles={[]}
                __test_fern_user_atom={createTestFernUserAtom(false)}
            >
                capture_the_flag
            </If>
        );
        await expect(findByText("capture_the_flag")).resolves.toBeDefined();
    });
});
