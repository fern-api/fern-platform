import type { APIV1Read } from "@fern-api/fdr-sdk";
import { FernButton, FernDropdown } from "@fern-ui/components";
import { useAtom } from "jotai";
import { ReactElement } from "react";
import { parse } from "url";
import { ALL_ENVIRONMENTS_ATOM, SELECTED_ENVIRONMENT_ATOM } from "../atoms/environment";

interface MaybeEnvironmentDropdownProps {
    selectedEnvironment: APIV1Read.Environment | undefined;
    urlTextStyle?: string;
    protocolTextStyle?: string;
    small?: boolean;
}
export function MaybeEnvironmentDropdown(props: MaybeEnvironmentDropdownProps): ReactElement | null {
    const [allEnvironmentIds] = useAtom(ALL_ENVIRONMENTS_ATOM);
    const [selectedEnvironmentId, setSelectedEnvironmentId] = useAtom(SELECTED_ENVIRONMENT_ATOM);

    const { selectedEnvironment, urlTextStyle, protocolTextStyle, small } = props;
    const url = selectedEnvironment?.baseUrl && parse(selectedEnvironment?.baseUrl);

    return (
        <span>
            {allEnvironmentIds.length > 1 ? (
                <FernDropdown
                    key="selectedEnvironment-selector"
                    options={allEnvironmentIds.map((env) => ({
                        value: env,
                        label: env,
                        type: "value",
                        // tooltip: "Select environment",
                    }))}
                    onValueChange={(value) => {
                        setSelectedEnvironmentId(value);
                    }}
                    value={selectedEnvironmentId ?? selectedEnvironment?.id}
                >
                    <FernButton
                        text={
                            <span key="protocol" className="whitespace-nowrap max-sm:hidden">
                                <span className={protocolTextStyle}>{`${url && url.protocol}//`}</span>
                                <span className={urlTextStyle}>{(url && url.host) ?? selectedEnvironmentId}</span>
                            </span>
                        }
                        size={small ? "small" : "normal"}
                        variant="outlined"
                        mono={true}
                    />
                </FernDropdown>
            ) : (
                <span key="protocol" className="whitespace-nowrap max-sm:hidden">
                    <span className={protocolTextStyle}>{`${url && url.protocol}//`}</span>
                    <span className={urlTextStyle}>{(url && url.host) ?? selectedEnvironmentId}</span>
                </span>
            )}
        </span>
    );
}
