import { useEffect, useRef, useState } from "react";
import { useCohereChatStream } from "../../util/useCohereChatStream";

export const AnimateChatStreamText: React.FC = () => {
    const [enableStream, _toggleStream] = useCohereChatStream();
    const [text, setText] = useState(enableStream ? "Chat Stream" : "Chat");
    const animating = useRef(false);

    useEffect(() => {
        if (animating.current) {
            return;
        }
        if (enableStream && text === "Chat") {
            const textArr = "Chat Stream".split("");
            let i = 4;
            const timer = setInterval(() => {
                setText(textArr.slice(0, i).join(""));
                i++;
                if (i > textArr.length) {
                    clearInterval(timer);
                }
            }, 50);
        } else if (!enableStream && text === "Chat Stream") {
            const textArr = "Chat Stream".split("");
            let i = textArr.length;
            const timer = setInterval(() => {
                setText(textArr.slice(0, i).join(""));
                i--;
                if (i < 4) {
                    clearInterval(timer);
                }
            }, 50);
        }
    }, [enableStream, text]);

    return <>{text}</>;
};
