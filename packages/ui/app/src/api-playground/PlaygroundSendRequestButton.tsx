import { FC } from "react";
import { RemoteFontAwesomeIcon } from "../commons/FontAwesomeIcon";
import { FernButton } from "../components/FernButton";

interface PlaygroundSendRequestButtonProps {
    sendRequest: () => void;
}

export const PlaygroundSendRequestButton: FC<PlaygroundSendRequestButtonProps> = ({ sendRequest }) => {
    return (
        <FernButton
            className="group font-semibold"
            rightIcon={
                <RemoteFontAwesomeIcon
                    icon="paper-plane-top"
                    className="mr-1 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                />
            }
            onClick={sendRequest}
            intent="primary"
            rounded
            size="large"
        >
            Send
        </FernButton>
    );
};
