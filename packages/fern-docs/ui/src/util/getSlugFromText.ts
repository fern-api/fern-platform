import { slug } from "github-slugger";
import { Children, isValidElement, ReactNode } from "react";

export function getSlugFromChildren(children: ReactNode): string {
  const text = Children.toArray(children).reduce(flatten, "");
  return slug(text);
}

/**
 * @see https://github.com/remarkjs/react-markdown/issues/404#issuecomment-604019030
 */
const flatten = (text: string, child: ReactNode): string => {
  return typeof child === "string"
    ? text + child
    : isValidElement(child)
      ? Children.toArray(child.props.children).reduce(flatten, text)
      : "";
};
