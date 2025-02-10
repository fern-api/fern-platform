import React, {
  PropsWithChildren,
  ReactElement,
  useMemo,
  useRef,
  useState,
} from "react";

import { APIV1Read } from "@fern-api/fdr-sdk";
import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import visitDiscriminatedUnion from "@fern-api/ui-core-utils/visitDiscriminatedUnion";
import { CopyToClipboardButton } from "@fern-docs/components";
import { HttpMethodBadge } from "@fern-docs/components/badges";
import { useBooleanState } from "@fern-ui/react-commons";
import { composeRefs } from "@radix-ui/react-compose-refs";
import cn from "clsx";
import { noop } from "ts-essentials";

import { MaybeEnvironmentDropdown } from "../../components/MaybeEnvironmentDropdown";

export declare namespace EndpointUrl {
  export type Props = React.PropsWithChildren<{
    path: ApiDefinition.PathPart[];
    method: ApiDefinition.HttpMethod;
    baseUrl?: string;
    environmentId?: ApiDefinition.EnvironmentId;
    options?: APIV1Read.Environment[];
    showEnvironment?: boolean;
    large?: boolean;
    className?: string;
  }>;
}

// TODO: this component needs a refresh
export const EndpointUrl = React.forwardRef<
  HTMLDivElement,
  PropsWithChildren<EndpointUrl.Props>
>(function EndpointUrl(
  {
    path,
    method,
    baseUrl,
    environmentId,
    large,
    className,
    showEnvironment,
    options,
  },
  forwardedRef
) {
  const ref = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const isEditingEnvironment = useBooleanState(false);

  const pathParts = useMemo(() => {
    const elements: (ReactElement<any> | null)[] = [];
    path.forEach((part, i) => {
      visitDiscriminatedUnion(part)._visit({
        literal: (literal) => {
          literal.value.split(/(?=\/)|(?<=\/)/).forEach((value, j) => {
            if (value === "/") {
              elements.push(
                <span key={`separator-${i}-${j}`} className="text-faded">
                  {"/"}
                </span>
              );
            } else {
              elements.push(
                <span
                  key={`part-${i}-${j}`}
                  className="text-faded whitespace-nowrap"
                >
                  {value}
                </span>
              );
            }
          });
        },
        pathParameter: (pathParameter) => {
          elements.push(
            <span
              key={`part-${i}`}
              className="bg-accent-highlight text-accent whitespace-nowrap rounded px-1"
            >
              :{pathParameter.value}
            </span>
          );
        },
        _other: noop,
      });
    });
    return elements;
  }, [path]);

  // if the environment is hidden, but it contains a basepath, we need to show the basepath
  const environmentBasepath = useMemo(() => {
    const url =
      baseUrl ??
      options?.find((option) => option.id === environmentId)?.baseUrl;
    if (url == null) {
      return undefined;
    }
    try {
      return new URL(url, "http://n").pathname;
    } catch {
      return undefined;
    }
  }, [options, environmentId, baseUrl]);

  return (
    <div
      ref={composeRefs(ref, forwardedRef)}
      className={cn("flex items-center gap-1 pr-2", className)}
    >
      <HttpMethodBadge method={method} />

      <div className={cn("flex items-center")}>
        <span
          className={`inline-flex shrink items-baseline ${isHovered ? "hover:bg-tag-default" : ""} cursor-default rounded-md p-1`}
        >
          <CopyToClipboardButton
            content={() =>
              ApiDefinition.buildRequestUrl({
                baseUrl,
                path,
              })
            }
          >
            {(onClick) => (
              <button
                className="flex items-center"
                onClick={onClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <span
                  className={cn("font-mono", {
                    "text-xs": !large,
                    "text-sm": large,
                  })}
                >
                  {showEnvironment && (
                    <span className="whitespace-nowrap max-sm:hidden">
                      <MaybeEnvironmentDropdown
                        baseUrl={baseUrl}
                        environmentId={environmentId}
                        options={options}
                        urlTextStyle="t-muted"
                        protocolTextStyle="text-faded"
                        isEditingEnvironment={isEditingEnvironment}
                        editable
                      />
                    </span>
                  )}
                  {!showEnvironment &&
                    environmentBasepath &&
                    environmentBasepath !== "/" && (
                      <span className="t-muted">{environmentBasepath}</span>
                    )}
                  {pathParts}
                </span>
              </button>
            )}
          </CopyToClipboardButton>
        </span>
      </div>
    </div>
  );
});
