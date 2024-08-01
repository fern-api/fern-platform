import { ReactElement } from "react";
import { FernIcon } from "../icons/FernIcon";

export function FernAvatar(): ReactElement {
    return (
        <div className="flex items-center justify-center h-8 w-8 rounded-full overflow-hidden outline-1 outline outline-gray-a6">
            <FernIcon className="size-5 text-[#4CAF50]" />
        </div>
    );
}
