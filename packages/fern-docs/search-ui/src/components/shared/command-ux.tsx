import { useEventCallback } from "@fern-ui/react-commons";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useMemo,
} from "react";
import { noop } from "ts-essentials";

const CommandUxContext = createContext<{
  // focus: (opts?: { scrollToTop?: boolean }) => void;
  inputError: string | null | undefined;
  setInputError: Dispatch<SetStateAction<string | null | undefined>>;
  setInputRef: (ref: HTMLInputElement | HTMLTextAreaElement | null) => void;
}>({
  // focus: noop,
  inputError: null,
  setInputError: noop,
  setInputRef: noop,
});

function CommandUxProvider(props: {
  inputError: string | null | undefined;
  setInputError: Dispatch<SetStateAction<string | null | undefined>>;
  // focus: (opts?: { scrollToTop?: boolean }) => void;
  setInputRef: (ref: HTMLInputElement | HTMLTextAreaElement | null) => void;
  children: React.ReactNode;
}) {
  const [inputError, setInputError] = useControllableState<string | null>({
    prop: props.inputError,
    defaultProp: null,
    onChange: props.setInputError,
  });
  const setInputRef = useEventCallback(props.setInputRef);
  const value = useMemo(
    () => ({ inputError, setInputError, setInputRef }),
    [inputError, setInputError, setInputRef]
  );
  return (
    <CommandUxContext.Provider value={value}>
      {props.children}
    </CommandUxContext.Provider>
  );
}

function useCommandUx(): {
  // focus: (opts?: { scrollToTop?: boolean }) => void;
  inputError: string | null | undefined;
  setInputError: Dispatch<SetStateAction<string | null | undefined>>;
  setInputRef: (ref: HTMLInputElement | HTMLTextAreaElement | null) => void;
} {
  return useContext(CommandUxContext);
}

export { CommandUxProvider, useCommandUx };
