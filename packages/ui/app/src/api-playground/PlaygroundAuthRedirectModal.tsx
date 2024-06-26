import { FernButton, FernModal, FernTooltipProvider } from "@fern-ui/components";
import { Cross1Icon } from "@radix-ui/react-icons";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { PlaygroundRequestFormAuth } from "./types";

interface PlaygroundAuthRedirectModal {
    authEndpointUrl: string;
    secret: string;
    code: string;
    isOpen: boolean;
    onAuth: Dispatch<SetStateAction<PlaygroundRequestFormAuth | undefined>>;
    onClose: () => void;
}


export const PlaygroundAuthRedirectModal: FC<PlaygroundAuthRedirectModal> = ({ onClose, code, authEndpointUrl, secret, onAuth, isOpen }) => {
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const sendAuthRequest = async () => {
            try {
                const response = await fetch(authEndpointUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ code, secret }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    setError(error.message);
                    return;
                }

                const data = await response.json();
                document.cookie = `apiKey=${data.apiKey}; expires=${new Date(data.expiresAt).toUTCString()}; path=/`;

                if (data.refreshToken) {
                    document.cookie = `refreshToken=${data.refreshToken}; path=/`;
                }

                onAuth({type: "bearerAuth", token: data.apiKey});
                
                const url = new URL(window.location.href);
                url.searchParams.delete('code');
                window.location.href = url.toString();
            } catch (error) {
                setError('Something went wrong, please try again later');
            }
        };

        sendAuthRequest();
    }, [authEndpointUrl, code]);
    
    
    const modal = (
        <FernModal isOpen={isOpen} onClose={onClose} className="relative w-96 rounded-lg p-4">
            <FernButton className="absolute right-2 top-2" variant="minimal" icon={<Cross1Icon />} onClick={onClose} />
            <h3 className="m-0 mb-4">Authorizing...</h3>
            <ul>
                <li className="flex gap-2">
                    <span>Authorization code: {code}</span>
                </li>
                <li className="flex gap-2 mt-5">
                    Don't close this window, wait until the authorization is complete...
                </li>
                {error && (
                    <li className="flex gap-2 mt-5">
                        <span className="text-red-500">{error}</span>
                    </li>
                )}
            </ul>
        </FernModal>
    );

    return (
        <FernTooltipProvider skipDelayDuration={700} delayDuration={300}>
            {modal}
        </FernTooltipProvider>
    );
};
