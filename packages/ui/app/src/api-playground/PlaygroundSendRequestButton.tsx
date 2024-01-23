import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { FC } from "react";
import style from "./PlaygroundSendRequestButton.module.scss";

interface PlaygroundSendRequestButtonProps {
    sendRequest: () => void;
}

export const PlaygroundSendRequestButton: FC<PlaygroundSendRequestButtonProps> = ({ sendRequest }) => {
    return (
        <button className={classNames(style.playgroundSendRequestButton, "group")} onClick={sendRequest}>
            <span className="whitespace-nowrap">Send request</span>
            <div className="flex h-4 w-4 items-center">
                <FontAwesomeIcon
                    icon="paper-plane-top"
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                />
            </div>
        </button>
    );
};
