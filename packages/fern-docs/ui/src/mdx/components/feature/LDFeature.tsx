import { camelCase } from "es-toolkit/string";
import { LDFlagSet, useFlags } from "launchdarkly-react-client-sdk";
import { Feature } from "./Feature";

const ldFlagPredicate = <T,>(
  flagKey: string,
  defaultValue: T
): ((flags: LDFlagSet) => T) => {
  return (flags: LDFlagSet) => {
    const camelKey = camelCase(flagKey);
    const flagValue = flags[camelKey];

    if (typeof flagValue === "undefined") {
      return defaultValue;
    }

    return flagValue as T;
  };
};

export const LDFeature: <T>(props: Feature.Props<T>) => React.ReactNode = ({
  flag,
  flagDefaultValue,
  match,
  children,
}) => {
  const flags = useFlags();
  const flagPredicate = ldFlagPredicate(flag, flagDefaultValue);
  const flagValue = flagPredicate(flags);

  if (typeof flagValue !== "undefined" && flagValue === match) {
    return <>{children}</>;
    // Uncomment to see debug info:
    // return (
    //   <div style={{ border: "1px solid gray" }}>
    //     <span style={{ fontSize: "0.8em" }}>
    //       ✅ <code>{flag}</code> evaluates to{" "}
    //       <code>{JSON.stringify(flagValue)}</code> and <b>matches</b> required
    //       value <code>{JSON.stringify(match)}</code> (Default value:{" "}
    //       <code>{JSON.stringify(flagDefaultValue)}</code>)
    //     </span>
    //     {children}
    //   </div>
    // );
    // TODO: delete the above
  }

  return null;
  // Uncomment to see debug info:
  // return (
  //   <div style={{ border: "1px solid gray" }}>
  //     <span style={{ fontSize: "0.8em" }}>
  //       ❌ <code>{flag}</code> evaluates to{" "}
  //       <code>{JSON.stringify(flagValue)}</code> which does <b>NOT</b> match
  //       required value <code>{JSON.stringify(match)}</code> (Default value:{" "}
  //       <code>{JSON.stringify(flagDefaultValue)}</code>)
  //     </span>
  //   </div>
  // );
  // TODO: delete the above
};
