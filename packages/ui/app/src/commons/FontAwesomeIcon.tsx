import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon as _FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export declare namespace FontAwesomeIcon {
    export interface Props {
        className?: string;
        icon?: string;
    }
}

export const FontAwesomeIcon: React.FC<FontAwesomeIcon.Props> = ({ className, icon }) => {
    return <_FontAwesomeIcon className={className} icon={icon as IconProp} />;
};
