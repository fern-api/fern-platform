import classNames from "classnames";
import { DetailedHTMLProps, FC, InputHTMLAttributes } from "react";

interface FernRadioProps extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    onChecked?: (checked: boolean) => void;
}
export const FernRadio: FC<FernRadioProps> = ({ className, children, onChecked, onChange, tabIndex, ...props }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e);
        onChecked?.(e.target.checked);
    };
    return (
        <label className={classNames(className, "inline-flex cursor-pointer items-start group")} tabIndex={tabIndex}>
            <input type="radio" className="peer h-0 w-0 opacity-0" {...props} onChange={handleChange} />
            <span className="ring-border-default-light dark:ring-border-default-dark peer-checked:bg-accent-primary dark:peer-checked:bg-accent-primary-dark peer-checked:after:bg-background dark:peer-checked:after:bg-background-dark group-hover:bg-tag-primary dark:group-hover:bg-tag-primary-dark relative mt-0.5 inline-block h-4 w-4 rounded-lg ring-1 ring-inset peer-checked:after:absolute peer-checked:after:left-1 peer-checked:after:top-1 peer-checked:after:h-2 peer-checked:after:w-2 peer-checked:after:rounded peer-checked:after:content-['']"></span>
            <div className="ml-2 flex-1">{children}</div>
        </label>
    );
};
