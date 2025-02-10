import { FernButton } from "@fern-docs/components";
import { usePrevious } from "@fern-ui/react-commons";
import { composeRefs } from "@radix-ui/react-compose-refs";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Expand } from "iconoir-react";
import {
  ComponentProps,
  ReactElement,
  RefObject,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";

export declare namespace IFrame {
  export interface Props extends ComponentProps<"iframe"> {
    experimental_enableRequestFullscreen?: boolean;
    experimental_onFullscreenChange?: (isFullscreen: boolean) => void;
    experimental_onReceiveMessage?: (event: MessageEvent) => void;
  }
}

export const IFrame = forwardRef<HTMLIFrameElement, IFrame.Props>(
  (
    {
      experimental_enableRequestFullscreen,
      experimental_onFullscreenChange,
      experimental_onReceiveMessage,
      ...props
    },
    forwardedRef
  ): ReactElement<any> => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
      const contentWindow = iframeRef.current?.contentWindow;
      if (contentWindow == null || experimental_onReceiveMessage == null) {
        return;
      }
      contentWindow.addEventListener("message", experimental_onReceiveMessage);
      return () => {
        contentWindow.removeEventListener(
          "message",
          experimental_onReceiveMessage
        );
      };
    }, [experimental_onReceiveMessage]);

    if (
      experimental_enableRequestFullscreen &&
      typeof document !== "undefined" &&
      document.fullscreenEnabled
    ) {
      return (
        <ExperimentalIFrameWithFullscreen
          iframeRef={iframeRef}
          onFullscreenChange={experimental_onFullscreenChange}
        >
          <iframe ref={composeRefs(iframeRef, forwardedRef)} {...props} />
        </ExperimentalIFrameWithFullscreen>
      );
    }

    // prevent hydration mismatch by setting data-state to closed
    return (
      <iframe
        data-state="closed"
        ref={composeRefs(iframeRef, forwardedRef)}
        {...props}
      />
    );
  }
);

IFrame.displayName = "IFrame";

interface ExperimentalIFrameWithFullscreenProps {
  onFullscreenChange?: (isFullscreen: boolean) => void;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  children: ReactElement<ComponentProps<"iframe">>;
}

const ExperimentalIFrameWithFullscreen = ({
  onFullscreenChange,
  iframeRef,
  children,
}: ExperimentalIFrameWithFullscreenProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wasFullscreen = usePrevious(isFullscreen);
  useEffect(() => {
    if (wasFullscreen !== isFullscreen) {
      onFullscreenChange?.(isFullscreen);
    }
  }, [onFullscreenChange, isFullscreen, wasFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === iframeRef.current);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [iframeRef]);
  const enterFullscreen = () => {
    if (iframeRef.current == null) {
      return;
    }

    const iframe = iframeRef.current;
    if (document.fullscreenElement != null) {
      void document.exitFullscreen();
    } else {
      void iframe.requestFullscreen();
    }
  };

  return (
    <Tooltip.TooltipProvider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="right"
            align="start"
            sideOffset={6}
            className="animate-popover"
          >
            <FernButton
              variant="outlined"
              icon={<Expand />}
              onClick={enterFullscreen}
            />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.TooltipProvider>
  );
};
