import { FC } from "react";
import { RemoteFontAwesomeIcon } from "../commons/FontAwesomeIcon";
import { FernButton } from "../components/FernButton";

interface PlaygroundSendRequestButtonProps {
    sendRequest: () => void;
}

export const PlaygroundSendRequestButton: FC<PlaygroundSendRequestButtonProps> = ({ sendRequest }) => {
    return (
        <FernButton
            className="after:animate-shine group relative overflow-hidden font-semibold after:absolute after:inset-y-0 after:w-8 after:bg-white/50 after:blur after:content-['']"
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
