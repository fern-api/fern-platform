import { ReactElement } from "react";
import { CohereIcon } from "../icons/CohereIcon";

export function FernAvatar(): ReactElement {
    return (
        <div className="outline-grayscale-a6 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full outline outline-1">
            <CohereIcon className="size-5" />
        </div>
    );
}
