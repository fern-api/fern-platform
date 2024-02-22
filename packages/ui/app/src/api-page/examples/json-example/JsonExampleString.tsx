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
        <span className="text-[rgb(102,153,0)] dark:text-[rgb(206,145,120)]">
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
