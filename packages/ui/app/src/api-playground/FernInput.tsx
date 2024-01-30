import { FC } from "react";

interface FernInputProps {
    value: string | number | undefined;
    onChange: (value: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
}

export const FernInput: FC<FernInputProps> = ({ value, onChange, onFocus, onBlur }) => {
    return (
        <div className="border-border-default-light dark:border-border-default-dark focus-within:ring-border-primary/20 dark:focus-within:ring-border-primary-dark/20 focus-within:border-accent-primary dark:focus-within:border-accent-primary-dark block h-8 w-full rounded-md border bg-white/50 px-2 focus-within:bg-white focus-within:outline-none focus-within:ring-2">
            <input
                className="caret-accent-primary dark:caret-accent-primary-dark h-full w-full bg-transparent text-sm text-black focus:outline-none dark:text-white"
                value={value}
                type="text"
                onChange={(e) => {
                    onChange(e.target.value);
                }}
                onFocus={onFocus}
                onBlur={onBlur}
            />
        </div>
    );
};
