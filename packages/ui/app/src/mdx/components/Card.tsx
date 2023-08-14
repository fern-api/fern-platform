export declare namespace Card {
    export interface Props {
        title: string;
        text?: string;
        href?: string;
    }
}

export const Card: React.FC<Card.Props> = ({ title, text, href }) => {
    const Component = href != null ? "a" : "div";
    return (
        <Component
            className="border-border-default-light dark:border-border-default-dark hover:border-accent-primary hover:dark:border-accent-primary bg-background-tertiary-light dark:bg-background-tertiary-dark flex w-[300px] rounded border p-5 !no-underline transition"
            href={href}
        >
            <div className="text-text-primary-light dark:text-text-primary-dark font-normal">{title}</div>
            {text != null && <div>{text}</div>}
        </Component>
    );
};
