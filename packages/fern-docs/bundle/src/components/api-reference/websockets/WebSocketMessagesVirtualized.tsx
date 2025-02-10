import { FC } from "react";

import { WebSocketMessages, WebSocketMessagesProps } from "./WebSocketMessages";

export const WebSocketMessagesVirtualized: FC<WebSocketMessagesProps> = ({
  messages,
}) => {
  return <WebSocketMessages messages={messages} virtualized />;
};
