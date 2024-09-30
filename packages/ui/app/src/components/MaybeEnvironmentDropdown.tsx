import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { FernButton, FernDropdown, FernInput } from "@fern-ui/components";
import { useBooleanState } from "@fern-ui/react-commons";
import cn from "clsx";
import { useAtom } from "jotai";
import { ReactElement, useState } from "react";
import { parse } from "url";
import { PLAYGROUND_ENVIRONMENT_ATOM } from "../atoms";
import { ALL_ENVIRONMENTS_ATOM, SELECTED_ENVIRONMENT_ATOM } from "../atoms/environment";

interface MaybeEnvironmentDropdownProps {
    selectedEnvironment: APIV1Read.Environment | undefined;
    urlTextStyle?: string;
    protocolTextStyle?: string;
    small?: boolean;
    environmentFilters?: APIV1Read.EnvironmentId[];
    trailingPath?: boolean;
    editable?: boolean;
    isEditingEnvironment: useBooleanState.Return;
}

export function MaybeEnvironmentDropdown({
    selectedEnvironment,
    urlTextStyle,
    protocolTextStyle,
    small,
    environmentFilters,
    trailingPath,
    editable,
    isEditingEnvironment,
}: MaybeEnvironmentDropdownProps): ReactElement | null {
    const [allEnvironmentIds] = useAtom(ALL_ENVIRONMENTS_ATOM);
    const [selectedEnvironmentId, setSelectedEnvironmentId] = useAtom(SELECTED_ENVIRONMENT_ATOM);
    const [playgroundEnvironment, setPlaygroundEnvironment] = useAtom(PLAYGROUND_ENVIRONMENT_ATOM);

    const environmentIds = environmentFilters
        ? environmentFilters.filter((environmentFilter) => allEnvironmentIds.includes(environmentFilter))
        : allEnvironmentIds;

    if (environmentFilters && selectedEnvironment && !environmentFilters.includes(selectedEnvironment.id)) {
        setSelectedEnvironmentId(environmentIds[0]);
    }
    const preParsedUrl = playgroundEnvironment ?? selectedEnvironment?.baseUrl;
    const url = preParsedUrl && parse(preParsedUrl);

    const [inputValue, setInputValue] = useState(preParsedUrl);
    const isValidInput = inputValue != null && inputValue !== "" && parse(inputValue).host != null;

    return (
        <>
            {isEditingEnvironment.value ? (
                <FernInput
                    autoFocus={isEditingEnvironment.value}
                    size={(inputValue?.length ?? 0) + 1}
                    placeholder={inputValue}
                    value={inputValue}
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    onValueChange={(value) => {
                        if (value === "" || parse(value).host == null) {
                            setInputValue(value);
                        } else {
                            setInputValue(value);
                            setPlaygroundEnvironment(value);
                        }
                    }}
                    onKeyDown={(e) => {
                        if ((e.key === "Enter" || e.key === "Escape") && isValidInput) {
                            setInputValue(playgroundEnvironment);
                            isEditingEnvironment.setFalse();
                        }
                    }}
                    className={isValidInput ? "" : "error"}
                    inputClassName={"p-0 pl-2"}
                />
            ) : (
                <>
                    <span className="max-sm:hidden">
                        {environmentIds && environmentIds.length > 1 ? (
                            <FernDropdown
                                key="selectedEnvironment-selector"
                                options={environmentIds.map((env) => ({
                                    value: env,
                                    label: env,
                                    type: "value",
                                }))}
                                onValueChange={(value) => {
                                    setPlaygroundEnvironment(undefined);
                                    setInputValue(value);
                                    setSelectedEnvironmentId(value);
                                }}
                                value={selectedEnvironmentId ?? selectedEnvironment?.id}
                            >
                                <FernButton
                                    className="py-0 px-1 h-auto"
                                    text={
                                        <span key="protocol" className="whitespace-nowrap max-sm:hidden">
                                            {url && url.protocol && (
                                                <span className={protocolTextStyle}>{`${url.protocol}//`}</span>
                                            )}
                                            <span className={urlTextStyle}>{(url && url.host) ?? ""}</span>
                                        </span>
                                    }
                                    size={small ? "small" : "normal"}
                                    variant="outlined"
                                    mono={true}
                                    onDoubleClick={editable ? isEditingEnvironment.setTrue : () => undefined}
                                />
                            </FernDropdown>
                        ) : (
                            <span key="protocol" className="whitespace-nowrap max-sm:hidden font-mono">
                                {url && url.protocol && (
                                    <span
                                        className={cn(protocolTextStyle, small ? "text-xs" : "text-sm")}
                                    >{`${url.protocol}//`}</span>
                                )}
                                {editable ? (
                                    <FernButton
                                        variant="minimal"
                                        className={cn(urlTextStyle, "p-0", small ? "text-xs" : "text-sm")}
                                        onDoubleClick={isEditingEnvironment.setTrue}
                                    >
                                        {(url && url.host) ?? ""}
                                    </FernButton>
                                ) : (
                                    <span className={urlTextStyle}>{(url && url.host) ?? ""}</span>
                                )}
                            </span>
                        )}
                    </span>
                    {trailingPath && url && url.pathname !== "/" && <span>{url.pathname}</span>}
                </>
            )}
        </>
    );
}
