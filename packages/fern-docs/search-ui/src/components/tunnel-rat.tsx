import React, { ReactNode } from "react";
import { useIsomorphicLayoutEffect } from "swr/_internal";
import { create, StoreApi } from "zustand";

type Props = {
  children: React.ReactNode;
  only?: boolean;
};

type State = {
  current: React.ReactNode[];
  only: React.ReactNode | null;
  version: number;
  set: StoreApi<State>["setState"];
};

export default function tunnel(): {
  In: (props: Props) => null;
  Out: () => ReactNode;
  useHasChildren: () => boolean;
} {
  const useStore = create<State>((set) => ({
    current: new Array<ReactNode>(),
    only: null,
    version: 0,
    set,
  }));

  return {
    In: ({ children, only }: Props) => {
      const set = useStore((state) => state.set);
      const version = useStore((state) => state.version);

      /* When this component mounts, we increase the store's version number.
      This will cause all existing rats to re-render (just like if the Out component
      were mapping items to a list.) The re-rendering will cause the final 
      order of rendered components to match what the user is expecting. */
      useIsomorphicLayoutEffect(() => {
        set((state) => ({
          version: state.version + 1,
        }));
      }, []);

      /* Any time the children _or_ the store's version number change, insert
      the specified React children into the list of rats. */
      useIsomorphicLayoutEffect(() => {
        set(({ current }) => ({
          current: only ? [children] : [...current, children],
          only: only ? children : null,
        }));

        return () =>
          set(({ current }) => ({
            current: current.filter((c) => c !== children),
            only: null,
          }));
      }, [children, version]);

      return null;
    },

    Out: () => {
      const current = useStore((state) => state.only || state.current);
      return <>{current}</>;
    },

    useHasChildren: () =>
      useStore((state) => !!state.only || state.current.length > 0),
  };
}
