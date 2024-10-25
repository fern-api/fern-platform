import { EVERYONE_ROLE } from "@fern-ui/fern-docs-utils";
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

export function If({ not, roles, children }: PropsWithChildren<IfProps>): ReactNode {
    const user = useFernUser();

    if (roles == null || roles.length === 0) {
        return children;
    }

    const userRoles = user?.roles ?? [];

    const show = roles.some((roles) => userRoles.some((role) => roles.includes(role) || role === EVERYONE_ROLE));

    return not ? !show && children : show && children;
}
