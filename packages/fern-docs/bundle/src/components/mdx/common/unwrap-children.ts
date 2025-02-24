import React from "react";

import { isPlainObject } from "@fern-api/ui-core-utils";

export function unwrapChildren<T>(
  children: React.ReactNode,
  componentType: React.ComponentType<T>
): React.ReactElement<T>[] {
  return React.Children.toArray(children)
    .filter(React.isValidElement)
    .flatMap((child) => {
      if (React.isValidElement(child)) {
        if (child.type === componentType) {
          return [child as React.ReactElement<T>];
        }
        if (isPlainObject(child.props) && "children" in child.props) {
          return unwrapChildren(
            child.props.children as React.ReactNode,
            componentType
          );
        }
      }
      return [];
    });
}
