import { clsx } from "@/lib/utils";
import { RemoteFontAwesomeIcon } from "@fern-ui/components";
import { getIconForSdk } from "./SdkContextCard";
import { SdkLanguage } from "./mock-data/Sdk";

interface SdkActivityStackProps {
    sdks: SdkLanguage[];
}

const SdkStackIcon: React.FC<{ sdk: SdkLanguage; idx: number; total: number }> = ({ sdk, idx, total }) => {
    return (
        <div
            className={clsx(
                "absolute h-10 w-10 content-center rounded-full border-2 border-white bg-gray-200 text-center leading-[normal]",
                {
                    "-left-7 z-30 group-hover:-translate-x-14": idx === 0 && total >= 3,
                    "-left-2.5 z-20 group-hover:-translate-x-8":
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
        <div className="group relative flex w-10 items-center">
            {props.sdks.slice(0, 2).map((sdk, idx) => (
                <SdkStackIcon sdk={sdk} idx={idx} total={numberSdks} />
            ))}
            {numberSdks > 2 && (
                <div
                    className={
                        "absolute z-10 h-10 w-10 content-center rounded-full border-2 border-white bg-gray-200 text-center text-sm leading-[normal]"
                    }
                >
                    + {numberSdks - 2}
                </div>
            )}
        </div>
    );
};
