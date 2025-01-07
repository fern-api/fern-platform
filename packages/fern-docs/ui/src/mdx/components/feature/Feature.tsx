import dynamic from "next/dynamic";

const LDFeature = dynamic(
  () => import("./LDFeature").then((mod) => mod.LDFeature),
  { ssr: true }
);

export declare namespace Feature {
  export interface Props<T> {
    flag: string;
    flagDefaultValue?: T;
    match: T;
    children: React.ReactNode;
  }
}

// TODO: This becomes an indirection point where we can use different feature flag implementations
// with different providers depending on config
export const Feature = <T,>(props: Feature.Props<T>): React.ReactNode => (
  <LDFeature {...props} />
);
