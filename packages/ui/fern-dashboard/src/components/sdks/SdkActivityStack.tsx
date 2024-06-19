import { cn } from "@/lib/utils";
import { RemoteFontAwesomeIcon } from "@fern-ui/components";
import { getIconForSdk } from "./SdkContextCard";
import { SdkLanguage } from "./mock-data/Sdk";

interface SdkActivityStackProps {
    sdks: SdkLanguage[];
}

const SdkStackIcon: React.FC<{ sdk: SdkLanguage; idx: number; total: number }> = ({ sdk, idx, total }) => {
    return (
        <div
            className={cn(
                `w-10 h-10 rounded-full bg-gray-200 absolute content-center text-center border-2 border-white leading-[normal]`,
                {
                    "z-30 group-hover:-translate-x-14 -left-7": idx === 0 && total >= 3,
                    "z-20 group-hover:-translate-x-8 -left-2.5":
                        (idx === 1 && total >= 3) || (idx === 0 && total === 2),
                },
            )}
        >
            <RemoteFontAwesomeIcon icon={getIconForSdk(sdk)} size={4} />
        </div>
    );
};

export const SdkActivityStack: React.FC<SdkActivityStackProps> = (props) => {
    const numberSdks = props.sdks.length;
    return (
        <div className="group flex items-center relative w-10">
            {props.sdks.slice(0, 2).map((sdk, idx) => (
                <SdkStackIcon sdk={sdk} idx={idx} total={numberSdks} />
            ))}
            {numberSdks > 2 && (
                <div
                    className={`w-10 h-10 rounded-full bg-gray-200 absolute content-center text-center z-10 text-sm border-2 border-white leading-[normal]`}
                >
                    + {numberSdks - 2}
                </div>
            )}
        </div>
    );
};
