import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dynamic from "next/dynamic";

export declare namespace FontAwesomeIconClient {
    export interface Props {
        className?: string;
        icon: string;
    }
}

export const Core: React.FC<FontAwesomeIconClient.Props> = ({ className, icon }) => {
    return <FontAwesomeIcon className={className} icon={icon as IconProp} />;
};

export const FontAwesomeIconClient = dynamic(() => Promise.resolve(Core), {
    ssr: false,
});
