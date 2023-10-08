export declare namespace JsonExampleString {
    export interface Props {
        value: string;
        doNotStringify?: boolean;
        newLineColOffset?: number;
    }
}

export const JsonExampleString: React.FC<JsonExampleString.Props> = ({
    value,
    doNotStringify = false,
    newLineColOffset,
}) => {
    const isMultiline = value.split("\n").length > 1;
    return (
        <span className="text-green-600 dark:text-green-300">
            {isMultiline ? (
                <>
                    {!doNotStringify && '"""'}
                    {value.split("\n").map((valueLine, idx) => (
                        <span key={idx}>
                            {"\n"}
                            {valueLine}
                        </span>
                    ))}
                    {!doNotStringify && `\n${" ".repeat(newLineColOffset ?? 0)}"""`}
                </>
            ) : doNotStringify ? (
                value
            ) : (
                JSON.stringify(value)
            )}
        </span>
    );
};
