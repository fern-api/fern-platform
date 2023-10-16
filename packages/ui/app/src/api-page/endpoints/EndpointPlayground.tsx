import { Collapse } from "@blueprintjs/core";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import {
    ApiAuth,
    EndpointDefinition,
    PrimitiveType,
    TypeReference,
} from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useBooleanState } from "@fern-ui/react-commons";
import classNames from "classnames";
import { getAllObjectProperties } from "../utils/getAllObjectProperties";

export declare namespace EndpointPlayground {
    export interface Props {
        endpoint: EndpointDefinition;
        resolveTypeById: (typeId: FernRegistryApiRead.TypeId) => FernRegistryApiRead.TypeDefinition;
        auth: ApiAuth | undefined;
    }
}

/*

MyObject: 
  properties: 
    a: string
    b: map<string, string>

MyUnion: 
  union: 
    a: string
    b: MyOtherObject
*/

function renderLabel(label: string | undefined, borderBottom = false) {
    if (label == null) {
        return;
    }

    return (
        <div
            className={classNames("flex-1 text-xs font-medium text-gray-900 dark:text-gray-300", {
                "mb-2": borderBottom,
            })}
        >
            {label}
        </div>
    );
}

function renderStringInput(label?: string) {
    return (
        <label className="block w-full">
            {renderLabel(label, true)}
            <div className="focus-within:outline-border-primary h-8 flex-1 rounded-md border border-white/20 focus-within:outline focus-within:outline-2">
                <input
                    type="text"
                    className="block h-full w-full border-0 bg-transparent p-1.5 text-white ring-0 ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                />
            </div>
        </label>
    );
}

function TypeReferencePlaygroundPrimitive({
    primitiveType,
    label,
}: {
    primitiveType: PrimitiveType;
    label?: string;
}): JSX.Element | null {
    return visitDiscriminatedUnion(primitiveType, "type")._visit({
        string: () => renderStringInput(label),
        boolean: () => null,
        integer: () => null,
        double: () => null,
        long: () => null,
        datetime: () => null,
        uuid: () => null,
        base64: () => null,
        date: () => null,
        _other: () => null,
    });
}

function TypeReferenceOptionalPlayground({ itemType, label }: { itemType: TypeReference; label?: string }) {
    const isEnabled = useBooleanState(false);

    return (
        <div className="w-full">
            <label className="flex cursor-pointer items-center">
                {renderLabel(label)}
                <div className="relative">
                    <input
                        type="checkbox"
                        checked={isEnabled.value}
                        onChange={isEnabled.toggleValue}
                        className="peer sr-only"
                    />
                    <div className="peer-checked:bg-accent-primary/50 peer h-6 w-11 rounded-full bg-gray-100/90 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:border-gray-600 dark:bg-white/20"></div>
                </div>
            </label>
            <Collapse isOpen={isEnabled.value}>
                <div className="mt-2">
                    <TypeReferencePlayground valueType={itemType} />
                </div>
            </Collapse>
        </div>
    );
}

function TypeReferencePlayground({
    valueType,
    label,
}: {
    valueType: TypeReference;
    label?: string;
}): JSX.Element | null {
    return visitDiscriminatedUnion(valueType, "type")._visit({
        id: () => renderStringInput(label),
        primitive: (primitive) => <TypeReferencePlaygroundPrimitive primitiveType={primitive.value} label={label} />,
        optional: (optional) => <TypeReferenceOptionalPlayground itemType={optional.itemType} label={label} />,
        list: () => null,
        set: () => null,
        map: () => null,
        literal: () => null, // Exclude this from the form
        unknown: () => null,
        _other: () => null,
    });
}

export const EndpointPlayground: React.FC<EndpointPlayground.Props> = ({ endpoint, auth, resolveTypeById }) => {
    return (
        <div className="max-h-full overflow-auto py-2">
            {endpoint.authed && auth != null && (
                <>
                    <div className="flex">
                        <span className="text-xs font-semibold text-white">Authorization</span>
                        <hr />
                    </div>
                    {visitDiscriminatedUnion(auth, "type")._visit({
                        header: (header) => (
                            <div className="flex w-full px-4 py-2 text-white">
                                {renderStringInput(header.nameOverride)}
                            </div>
                        ),
                        bearerAuth: (bearerAuth) => (
                            <div className="flex w-full px-4 py-2 text-white">
                                {renderStringInput(bearerAuth.tokenName)}
                            </div>
                        ),
                        basicAuth: (basicAuth) => (
                            <>
                                <div className="flex w-full px-4 py-2 text-white">
                                    {renderStringInput(basicAuth.usernameName)}
                                </div>
                                <div className="flex w-full px-4 py-2 text-white">
                                    {renderStringInput(basicAuth.passwordName)}
                                </div>
                            </>
                        ),
                        _other: () => null,
                    })}
                </>
            )}
            {endpoint.request != null &&
                visitDiscriminatedUnion(endpoint.request.type, "type")._visit({
                    object: (arg) =>
                        getAllObjectProperties(arg, resolveTypeById).map((property) => (
                            <div key={property.key} className="flex w-full px-4 py-2 text-white">
                                <TypeReferencePlayground label={property.key} valueType={property.valueType} />
                            </div>
                        )),
                    reference: () => {
                        return null;
                    },
                    fileUpload: () => null,
                    _other: () => null,
                })}
        </div>
    );
};
