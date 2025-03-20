import React from "react";

import { slug } from "github-slugger";

export function getSlugFromChildren(children: React.ReactNode): string {
  const text = React.Children.toArray(children).reduce(flatten, "");
  return slug(text);
}

/**
 * @see https://github.com/remarkjs/react-markdown/issues/404#issuecomment-604019030
 */
const flatten = (text: string, child: React.ReactNode): string => {
  return typeof child === "string"
    ? text + child
    : React.isValidElement<{ children: React.ReactNode }>(child)
      ? React.Children.toArray(child.props.children).reduce(flatten, text)
      : "";
};
