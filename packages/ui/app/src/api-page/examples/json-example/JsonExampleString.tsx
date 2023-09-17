export declare namespace JsonExampleString {
    export interface Props {
        value: string;
        doNotAddQuotes?: boolean;
    }
}

export const JsonExampleString: React.FC<JsonExampleString.Props> = ({ value, doNotAddQuotes = false }) => {
    return <span className="text-green-600 dark:text-green-300">{doNotAddQuotes ? value : `"${value}"`}</span>;
};
