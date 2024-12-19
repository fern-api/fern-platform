import { composeEventHandlers } from "@radix-ui/primitive";
import { composeRefs } from "@radix-ui/react-compose-refs";
import {
  ComponentPropsWithoutRef,
  KeyboardEvent,
  forwardRef,
  memo,
  useEffect,
  useRef,
} from "react";
import { useSearchBox } from "react-instantsearch";

import * as Command from "../cmdk";
import { useFacetFilters } from "../search-client";
import "../shared/common.scss";
import tunnel from "../tunnel-rat";
import {
  DesktopCommandInput,
  DesktopCommandInputError,
} from "./desktop-command-input";
import { DesktopCommandRoot } from "./desktop-command-root";
import "./desktop.scss";

export interface DesktopCommandProps {
  onClose?: () => void;
  onEscape?: (e: KeyboardEvent<HTMLDivElement>) => void;
  onPopState?: (e: KeyboardEvent<HTMLDivElement>) => void;
  placeholder?: string;
}

export const aboveInput = tunnel();
export const beforeInput = tunnel();
export const afterInput = tunnel();

/**
 * The desktop command is intended to be used within a dialog component.
 */
const DesktopCommand = forwardRef<
  HTMLDivElement,
  DesktopCommandProps & ComponentPropsWithoutRef<typeof DesktopCommandRoot>
>(
  (
    { onEscape, onPopState, onClose, children, placeholder, ...props },
    forwardedRef
  ) => {
    const { filters, handlePopState: handlePopFilters } = useFacetFilters();
    return (
      <DesktopCommandRoot
        label="Search"
        {...props}
        ref={forwardedRef}
        onPopState={composeEventHandlers(onPopState, handlePopFilters, {
          checkForDefaultPrevented: false,
        })}
        onEscape={composeEventHandlers(onEscape, () => onClose?.(), {
          checkForDefaultPrevented: false,
        })}
        escapeKeyShouldPopFilters={filters.length > 0}
      >
        <DesktopCommandContent>{children}</DesktopCommandContent>
      </DesktopCommandRoot>
    );
  }
);

DesktopCommand.displayName = "DesktopCommand";

export const DesktopCommandContent = memo(
  ({ children }: { children: React.ReactNode }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    return (
      <>
        <div
          className="cursor-text"
          onClick={() => {
            inputRef.current?.focus();
          }}
        >
          <aboveInput.Out />

          <div data-cmdk-fern-header="">
            <beforeInput.Out />

            <DesktopCommandInputError asChild>
              <DesktopCommandInputSearch ref={inputRef} />
            </DesktopCommandInputError>

            <afterInput.Out />
          </div>
        </div>

        <Command.List ref={scrollRef} tabIndex={-1}>
          {children}
        </Command.List>
      </>
    );
  }
);

DesktopCommandContent.displayName = "DesktopCommandContent";

const DesktopCommandInputSearch = memo(
  forwardRef<
    HTMLInputElement,
    ComponentPropsWithoutRef<typeof DesktopCommandInput>
  >((props, forwardedRef) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { query, refine } = useSearchBox();
    useEffect(() => {
      setTimeout(() => {
        if (document.activeElement !== inputRef.current) {
          inputRef.current?.focus();
        }
      });
    });
    return (
      <DesktopCommandInput
        inputMode="search"
        autoFocus
        value={query}
        maxLength={100}
        placeholder="Search"
        {...props}
        ref={composeRefs(inputRef, forwardedRef)}
        onValueChange={(value) => {
          refine(value);
          props.onValueChange?.(value);
        }}
      />
    );
  })
);

DesktopCommandInputSearch.displayName = "DesktopCommandInputSearch";

const DesktopCommandBeforeInput = beforeInput.In;
const DesktopCommandAfterInput = afterInput.In;
const DesktopCommandAboveInput = aboveInput.In;

export {
  DesktopCommand,
  DesktopCommandAboveInput,
  DesktopCommandAfterInput,
  DesktopCommandBeforeInput,
};
