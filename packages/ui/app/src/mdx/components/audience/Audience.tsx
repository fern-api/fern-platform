import { PropsWithChildren, ReactNode } from "react";
import { useFernUser } from "../../../atoms";

export interface AudienceProps {
    /**
     * The audience to check against
     */
    audience?: string | string[];

    /**
     * Invert the audience check
     */
    not?: boolean;
}

export function Audience({ not, audience, children }: PropsWithChildren<AudienceProps>): ReactNode {
    const user = useFernUser();

    if (audience == null || (Array.isArray(audience) && audience.length === 0)) {
        return children;
    }

    const audienceArr = Array.isArray(audience) ? audience : [audience];
    const userAudienceArr =
        user?.audience == null ? [] : Array.isArray(user.audience) ? user.audience : [user.audience];

    const show = audienceArr.some((aud) => userAudienceArr.includes(aud));

    return not ? !show && children : show && children;
}
