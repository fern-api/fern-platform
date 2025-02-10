import { PropsWithChildren, ReactNode } from "react";

import { FernUser } from "@fern-docs/auth";
import { Atom } from "jotai";

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

export function If({
  not,
  roles,
  loggedIn,
  children,
  __test_fern_user_atom,
}: PropsWithChildren<IfProps>): ReactNode {
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
      return roles.some(
        (role) => userRoles.includes(role) || role === "everyone"
      );
    }
    if (loggedIn != null) {
      return loggedIn === (user != null);
    }
    return true;
  };

  const show = not ? !shouldShow() : shouldShow();

  return show ? children : null;
}
