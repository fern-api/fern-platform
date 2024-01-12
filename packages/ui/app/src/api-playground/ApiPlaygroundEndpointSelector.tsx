import { APIV1Read } from "@fern-api/fdr-sdk";
import { getSubpackageTitle, isSubpackage } from "@fern-ui/app-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import { Transition } from "@headlessui/react";
import classNames from "classnames";
import { FC, useMemo } from "react";
import { resolveSubpackage } from "../api-context/ApiDefinitionContextProvider";
import { ChevronDownIcon } from "../commons/icons/ChevronDownIcon";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useNavigationContext } from "../navigation-context";
import { useDocsSelectors } from "../selectors/useDocsSelectors";
import { ApiPlaygroundModalProps } from "./ApiPlaygroundModal";

export const ApiPlaygroundEndpointSelector: FC<ApiPlaygroundModalProps> = ({ endpoint, package: package_ }) => {
    const showDropdown = useBooleanState(false);
    const { resolveApi } = useDocsContext();
    const { activeNavigationConfigContext } = useDocsSelectors();
    const { activeNavigatable } = useNavigationContext();

    const navigationItems =
        activeNavigationConfigContext.type === "tabbed"
            ? activeNavigatable.context.tab?.items
            : activeNavigationConfigContext.config.items;

    const endpoints = useMemo(() => {
        if (navigationItems == null) {
            return [];
        }

        return navigationItems.flatMap((item) => {
            if (item.type !== "api") {
                return [];
            }

            const apiDefinition = resolveApi(item.api);

            if (apiDefinition == null) {
                return [];
            }

            const flattenSubpackages = (subpackageId: APIV1Read.SubpackageId): APIV1Read.EndpointDefinition[] => {
                const subpackage = resolveSubpackage(apiDefinition, subpackageId);

                if (subpackage == null) {
                    return [];
                }

                return subpackage.endpoints.concat(subpackage.subpackages.flatMap(flattenSubpackages));
            };

            return apiDefinition.rootPackage.endpoints.concat(
                apiDefinition.rootPackage.subpackages.flatMap(flattenSubpackages)
            );
        });
    }, [navigationItems, resolveApi]);

    return (
        <div className="relative -m-2">
            <button
                className={classNames(
                    "flex cursor-pointer items-center gap-4 rounded p-2 text-left hover:bg-black/10 hover:dark:bg-white/10",
                    {
                        "bg-black/10 dark:bg-white/10": showDropdown.value,
                    }
                )}
                onClick={showDropdown.toggleValue}
            >
                <div className="flex flex-col justify-center">
                    {isSubpackage(package_) && (
                        <div className="text-accent-primary dark:text-accent-primary-dark text-xs">
                            {getSubpackageTitle(package_)}
                        </div>
                    )}
                    <div className="text-lg">{endpoint.name}</div>
                </div>
                <ChevronDownIcon
                    className={classNames("h-5 w-5 transition", {
                        "rotate-180": false,
                    })}
                />
            </button>
            <Transition show={showDropdown.value}>
                <ul className="bg-background dark:bg-background-dark border-border-default-light dark:border-border-default-dark absolute left-0 top-full z-10 mt-2 min-h-4 min-w-full list-none rounded border shadow-xl">
                    {endpoints.map((endpoint, idx) => {
                        return <li key={idx}>{endpoint.name}</li>;
                    })}
                </ul>
            </Transition>
        </div>
    );
};
