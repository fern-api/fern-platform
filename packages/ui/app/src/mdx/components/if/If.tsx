import { FernUser } from "@fern-ui/fern-docs-auth";
import { EVERYONE_ROLE } from "@fern-ui/fern-docs-utils";
import { Atom } from "jotai";
import { PropsWithChildren, ReactNode } from "react";
import { useFernUser } from "../../../atoms";

export interface IfProps {
    /**
     * The role to check against
     */
    roles?: string[];

    /**
     * Invert the role check
     */
    not?: boolean;

    /**
     * Whether the user is logged in
     */
    loggedIn?: boolean;

    /**
     * A fern user atom for testing purposes only
     */
    __test_fern_user_atom?: Atom<FernUser | undefined>;
}

/**
 *
 * # Some title
 *
 * <If roles={["beta-users"]}>
 *   <Callout>
 *     This is a callout
 *   </Callout>
 * </If>
 *
 * some content
 */

export function If({ not, roles, loggedIn, children, __test_fern_user_atom }: PropsWithChildren<IfProps>): ReactNode {
    const user = useFernUser({ __test_fern_user_atom });

    const userRoles = user?.roles ?? [];

    if (not && roles?.length === 0 && userRoles.length > 0) {
        return children;
    }

    const shouldShow = () => {
        if (roles != null) {
            if (roles.length === 0) {
                return user != null;
            }
            return roles.some((role) => userRoles.includes(role) || role === EVERYONE_ROLE);
        }
        if (loggedIn != null) {
            return loggedIn === (user != null);
        }
        return true;
    };

    const show = not ? !shouldShow() : shouldShow();

    return show ? children : null;

    // if roles is provided, we assume the loggedIn condition = true
    // if (roles != null) {
    //     loggedIn = true;
    // }

    // if (not) {
    //     if (loggedIn) {
    //         return user == null ? children : null;
    //     } else {
    //         return user != null ? children : null;
    //     }
    // } else if (!loggedIn) {
    //     return user == null ? children : null;
    // } else if (roles == null) {
    //     return children;
    // } else if (roles.length === 0) {
    //     return user != null ? children : null;
    // }

    // const show =
    //     roles == null || roles.length === 0
    //         ? user != null && loggedIn
    //         : roles.some((role) => userRoles.includes(role) || role === EVERYONE_ROLE);

    // return not ? !show && children : show && children;
}
