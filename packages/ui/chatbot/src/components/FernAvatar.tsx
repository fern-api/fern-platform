import { ReactElement } from "react";
import { CohereIcon } from "../icons/CohereIcon";

export function FernAvatar(): ReactElement {
    return (
        <div className="flex items-center justify-center h-8 w-8 rounded-full overflow-hidden outline-1 outline outline-grayscale-a6">
            <CohereIcon className="size-5" />
        </div>
    );
}
