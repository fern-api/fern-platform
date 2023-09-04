import { IconName } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export declare namespace Card {
    export interface Props {
        title: string;
        icon?: string;
        text?: string;
        href?: string;
    }
}

export const Card: React.FC<Card.Props> = ({ title, icon, text, href }) => {
    const Component = href != null ? "a" : "div";
    return (
        <Component
            className="border-border-default-light dark:border-border-default-dark hover:border-accent-primary hover:dark:border-accent-primary bg-background-tertiary-light dark:bg-background-tertiary-dark flex w-[300px] flex-col items-start rounded border p-5 !no-underline transition"
            href={href}
        >
            <FontAwesomeIcon
                className="text-intent-default dark:text-intent-default mb-3 h-5 w-5"
                icon={{ prefix: "fas", iconName: icon as IconName }}
            />

            <div className="text-text-primary-light dark:text-text-primary-dark font-normal">{title}</div>
            {text != null && <div>{text}</div>}
        </Component>
    );
};
