import { FC, ReactNode } from "react";

import { FernButton, cn } from "@fern-docs/components";

interface PlaygroundSendRequestButtonProps {
  sendRequest?: () => void;

  sendRequestButtonLabel?: string;
  sendRequestIcon?: ReactNode;
}

export const PlaygroundSendRequestButton: FC<
  PlaygroundSendRequestButtonProps
> = ({ sendRequest, sendRequestButtonLabel, sendRequestIcon }) => {
  return (
    <FernButton
      className={cn("group relative overflow-hidden font-semibold", {
        "after:animate-shine after:absolute after:inset-y-0 after:w-8 after:bg-white/50 after:blur after:content-['']":
          !!sendRequest,
      })}
      rightIcon={sendRequestIcon}
      onClick={sendRequest}
      intent="primary"
      rounded
      size="large"
      skeleton={!sendRequest}
    >
      {sendRequestButtonLabel ?? "Send Request"}
    </FernButton>
  );
};
