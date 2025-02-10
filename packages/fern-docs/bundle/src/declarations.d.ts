import type { JSX as Jsx } from "react/jsx-runtime";

// mdx compatibility with react 19 https://github.com/mdx-js/mdx/issues/2487#issuecomment-2407661869
declare global {
  namespace JSX {
    type ElementClass = Jsx.ElementClass;
    type Element = Jsx.Element;
    type IntrinsicElements = Jsx.IntrinsicElements;
  }
}

// CSS modules
type CSSModuleClasses = Readonly<Record<string, string>>;

declare module "*.module.scss" {
  const classes: CSSModuleClasses;
  export default classes;
}

// CSS
declare module "*.css" {}
declare module "*.scss" {}

// images
declare module "*.png" {
  const src: string;
  export default { src };
}
declare module "*.jpg" {
  const src: string;
  export default { src };
}
declare module "*.jpeg" {
  const src: string;
  export default { src };
}
declare module "*.gif" {
  const src: string;
  export default { src };
}
declare module "*.svg" {
  const src: string;
  export default { src };
}
declare module "*.ico" {
  const src: string;
  export default { src };
}

/**
 * Shaders
 */
declare module "*.frag" {
  const content: string;
  export default content;
}

declare module "*.vert" {
  const content: string;
  export default content;
}
