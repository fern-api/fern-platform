import { Button } from "@fern-docs/components/button";
import { Kbd } from "@fern-docs/components/kbd";
import { usePlatformKbdShortcut } from "@fern-ui/react-commons";
import { composeEventHandlers } from "@radix-ui/primitive";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { TooltipPortal } from "@radix-ui/react-tooltip";
import { ArrowLeft } from "lucide-react";
import {
  ComponentPropsWithoutRef,
  KeyboardEvent,
  ReactNode,
  forwardRef,
  memo,
  useEffect,
  useRef,
} from "react";
import { useSearchBox } from "react-instantsearch";

import * as Command from "../cmdk";
import { useFacetFilters } from "../search-client";
import tunnel from "../tunnel-rat";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { DesktopCommandBadges } from "./desktop-command-badges";
import {
  DesktopCommandInput,
  DesktopCommandInputError,
} from "./desktop-command-input";
import { DesktopCommandRoot } from "./desktop-command-root";

export interface DesktopCommandProps {
  onEscapeKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
  onPopState?: (e: KeyboardEvent<HTMLDivElement>) => void;
  placeholder?: string;
}

export const beforeInput = tunnel();
export const afterInput = tunnel();

/**
 * The desktop command is intended to be used within a dialog component.
 */
const DesktopCommand = forwardRef<
  HTMLDivElement,
  DesktopCommandProps & ComponentPropsWithoutRef<typeof DesktopCommandRoot>
>(({ onPopState, children, placeholder, asChild, ...props }, forwardedRef) => {
  const { filters, handlePopState: handlePopFilters } = useFacetFilters();
  const ref = useRef<HTMLDivElement>(null);

  // animate on presence
  useEffect(() => {
    if (ref.current) {
      ref.current.animate(
        { transform: ["scale(0.96)", "scale(1)"] },
        { duration: 100, easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)" }
      );
    }
  }, []);

  return (
    <DesktopCommandRoot
      label="Search"
      {...props}
      ref={composeRefs(ref, forwardedRef)}
      onPopState={composeEventHandlers(onPopState, handlePopFilters, {
        checkForDefaultPrevented: false,
      })}
      escapeKeyShouldPopState={filters.length > 0}
    >
      <DesktopCommandContent asChild={asChild}>
        {children}
      </DesktopCommandContent>
    </DesktopCommandRoot>
  );
});

DesktopCommand.displayName = "DesktopCommand";

export const DesktopCommandContent = memo(
  ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
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
          <DesktopCommandBadges />

          <div data-cmdk-fern-header="">
            <beforeInput.Out />

            <DesktopCommandInputError asChild>
              <DesktopCommandInputSearch ref={inputRef} />
            </DesktopCommandInputError>

            <afterInput.Out />
          </div>
        </div>

        <Command.List ref={scrollRef} tabIndex={-1} asChild={asChild}>
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

function DesktopBackButton({
  pop,
  clear,
  showAdditionalCommand,
}: {
  pop: () => void;
  clear: () => void;
  /**
   * if false, the text says `Del` to go back
   * if true, the text says `Del` to go back or `Ctrl` `Del` to go to root search
   */
  showAdditionalCommand?: boolean;
}): React.ReactNode {
  const shortcut = usePlatformKbdShortcut();

  const additionalCommand = showAdditionalCommand && shortcut && (
    <>
      <span> or </span>
      <Kbd className="mx-1">{shortcut}</Kbd>
      <Kbd className="me-1">Del</Kbd>
      <span> to go to root search</span>
    </>
  );

  return (
    <beforeInput.In>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="iconSm"
              variant="outline"
              className="shrink-0"
              onClickCapture={(e) => {
                if (e.metaKey || e.ctrlKey) {
                  clear();
                } else {
                  pop();
                }
              }}
              onKeyDownCapture={(e) => {
                if (
                  e.key === "Backspace" ||
                  e.key === "Delete" ||
                  e.key === "Space" ||
                  (e.key === "Enter" && !e.nativeEvent.isComposing)
                ) {
                  if (e.metaKey || e.ctrlKey) {
                    clear();
                  } else {
                    pop();
                  }
                  e.stopPropagation();
                }
              }}
            >
              <ArrowLeft />
            </Button>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent className="shrink-0">
              <p>
                <Kbd className="me-1">Del</Kbd>
                <span> to go back</span>
                {additionalCommand}
              </p>
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
    </beforeInput.In>
  );
}

const DefaultDesktopBackButton = (): ReactNode => {
  const { filters, popFilter, clearFilters } = useFacetFilters();

  if (filters.length === 0) {
    return false;
  }

  return <DesktopBackButton pop={popFilter} clear={clearFilters} />;
};

const DesktopCommandAfterInput = afterInput.In;

export {
  DefaultDesktopBackButton,
  DesktopBackButton,
  DesktopCommand,
  DesktopCommandAfterInput,
};
