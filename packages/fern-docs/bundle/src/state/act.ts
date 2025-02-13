import React from "react";

export function act<S>(action: React.SetStateAction<S>, prev: S): S {
  return typeof action === "function"
    ? (action as (prevState: S) => S)(prev)
    : action;
}
