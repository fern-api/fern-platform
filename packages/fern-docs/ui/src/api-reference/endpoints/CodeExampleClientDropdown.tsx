import {
    FernButton,
    FernDropdown,
    RemoteFontAwesomeIcon,
} from "@fern-docs/components";
import { NavArrowDown } from "iconoir-react";
import {
    getIconForClient,
    getLanguageDisplayName,
} from "../examples/code-example";

export declare namespace CodeExampleClientDropdown {
    export interface Props {
        languages: string[];
        value: string;
        onValueChange: (language: string) => void;
    }
}

export const CodeExampleClientDropdown: React.FC<
    CodeExampleClientDropdown.Props
> = ({ languages, value, onValueChange }) => {
    const options = languages.map((language) => ({
        type: "value" as const,
        label: getLanguageDisplayName(language),
        value: language,
        className: "group/option",
        icon: (
            <RemoteFontAwesomeIcon
                className="size-icon-sm bg-intent-default group-data-[highlighted]/option:bg-accent-contrast"
                icon={getIconForClient(language)}
            />
        ),
    }));

    const selectedOption = options.find((option) => option.value === value);
    return (
        <div className="flex justify-end">
            <FernDropdown
                value={value}
                options={options}
                onValueChange={onValueChange}
            >
                <FernButton
                    icon={
                        <RemoteFontAwesomeIcon
                            className="bg-accent size-4"
                            icon={getIconForClient(value)}
                        />
                    }
                    rightIcon={<NavArrowDown className="!size-icon" />}
                    text={
                        selectedOption?.label ?? getLanguageDisplayName(value)
                    }
                    size="small"
                    variant="outlined"
                    mono={true}
                />
            </FernDropdown>
        </div>
    );
};
