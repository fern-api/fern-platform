import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { MouseEventHandler } from "react";
import { HttpMethodIcon } from "../../components/HttpMethodIcon";
import { MonospaceText } from "../../components/MonospaceText";

export declare namespace EndpointDescriptor {
  export interface Props {
    endpointDefinition: APIV1Read.EndpointDefinition;
    onClick: MouseEventHandler<HTMLButtonElement>;
  }
}

export const EndpointDescriptor: React.FC<EndpointDescriptor.Props> = ({
  endpointDefinition,
  onClick,
}) => {
  const urlWithBreakpoints = endpointDefinition.path.parts
    .map((part) =>
      visitDiscriminatedUnion(part, "type")._visit({
        literal: (literal) => literal.value,
        pathParameter: (pathParameter) =>
          getPathParameterAsString(pathParameter.value),
        _other: () => "",
      })
    )
    .join("")
    .split("/")
    .map((p, i) =>
      i === 0 ? (
        p
      ) : (
        <>
          <wbr />/{p}
        </>
      )
    );

  return (
    <button
      className="group flex items-start justify-start space-x-2"
      onClick={onClick}
    >
      <div className="flex items-baseline space-x-2">
        <HttpMethodIcon />
        <MonospaceText className="t-muted w-16 break-all text-end text-sm leading-5 transition-colors group-hover:text-white">
          {endpointDefinition.method}
        </MonospaceText>
      </div>

      <div className="flex">
        <MonospaceText className="t-muted break-words text-start text-sm leading-5 transition-colors group-hover:text-white">
          {urlWithBreakpoints}
        </MonospaceText>
      </div>
    </button>
  );
};

function getPathParameterAsString(
  pathParameterKey: APIV1Read.PropertyKey
): string {
  return `:${pathParameterKey}`;
}
