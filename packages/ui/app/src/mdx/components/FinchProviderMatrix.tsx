import { atomWithStorage } from "jotai/utils";
import { Fragment, useMemo } from "react";
import { InlineCode } from "../base-components";

type ProviderStatus = "automated" | "assisted" | "upon_request" | "n/a";
export type AccessType = "api" | "credentials";
type BenefitOperation =
    | "read_company_benefits"
    | "create_company_benefits"
    | "read_individual_benefits"
    | "enroll_individual_benefits";
type SupportedStatus = "supported" | "not_supported";

export declare namespace FinchProviderMatrix {
    interface Integration {
        name: string;
        organization: ProviderStatus;
        payroll: ProviderStatus;
        deductions: ProviderStatus;
        iconPath?: string;
        supportedAccessTypes: AccessType[];
    }
    export interface Property {
        key: string;
        integrations?: Record<string, AccessType[]>;
    }
    interface Data {
        integrations: Record<string, Integration>;
        organization: {
            name: string;
            objects: Record<string, Property[]>;
        };
        payroll: {
            name: string;
            objects: Record<string, Property[]>;
        };
        deductions: {
            benefits: Array<{
                name: string;
                operations: Record<BenefitOperation, Record<string, SupportedStatus>>;
                features: Record<string, Record<string, string[] | true>>;
            }>;
        };
    }

    export interface Props {
        data: Data;
    }
}

export const finchProviderIdAtom = atomWithStorage<string | undefined>("finch-provider-id", undefined);
export const finchProviderAccessTypeAtom = atomWithStorage<AccessType | undefined>(
    "finch-provider-access-type",
    undefined
);
export const finchHideUnsupportedAtom = atomWithStorage<boolean>("finch-hide-unsupported", false);

export const FinchProviderMatrix: React.FC<FinchProviderMatrix.Props> = ({ data }) => {
    const integrationKeys = useMemo(() => Object.keys(data.integrations), [data]);
    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full border text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th></th>
                        <th className="border">Finch</th>
                        {integrationKeys.map((key) => (
                            <th key={key} className="border">
                                {data.integrations[key]?.name}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td rowSpan={3} className="border">
                            <div className="rotate-180" style={{ writingMode: "vertical-rl" }}>
                                Integration
                            </div>
                        </td>
                        <td className="border">Organization</td>
                        {integrationKeys.map((key) => (
                            <th key={key} className="border">
                                {data.integrations[key]?.organization}
                            </th>
                        ))}
                    </tr>
                    <tr>
                        <td className="border">Payroll</td>
                        {integrationKeys.map((key) => (
                            <th key={key} className="border">
                                {data.integrations[key]?.payroll}
                            </th>
                        ))}
                    </tr>
                    <tr>
                        <td className="border">Deductions</td>
                        {integrationKeys.map((key) => (
                            <th key={key} className="border">
                                {data.integrations[key]?.deductions}
                            </th>
                        ))}
                    </tr>

                    {Object.entries(data.organization.objects).map(([objectKey, properties]) => (
                        <Fragment key={objectKey}>
                            {properties.map((property, i) => (
                                <tr key={`${objectKey}/${property.key}`}>
                                    {i === 0 && (
                                        <td rowSpan={properties.length} className="border">
                                            <div className="rotate-180" style={{ writingMode: "vertical-rl" }}>
                                                {data.organization.name}.{objectKey}
                                            </div>
                                        </td>
                                    )}
                                    <td className="border">
                                        <InlineCode fontSize={"sm"}>{property.key}</InlineCode>
                                    </td>
                                    {integrationKeys.map((key) => (
                                        <th key={key} className="border">
                                            {property.integrations?.[key]?.map((accessType) => (
                                                <InlineCode fontSize="sm" key={accessType}>
                                                    {accessType}
                                                </InlineCode>
                                            ))}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </Fragment>
                    ))}

                    {Object.entries(data.payroll.objects).map(([objectKey, properties]) => (
                        <Fragment key={objectKey}>
                            {properties.map((property, i) => (
                                <tr key={`${objectKey}/${property.key}`}>
                                    {i === 0 && (
                                        <td rowSpan={properties.length} className="border">
                                            <div className="rotate-180" style={{ writingMode: "vertical-rl" }}>
                                                {data.payroll.name}.{objectKey}
                                            </div>
                                        </td>
                                    )}
                                    <td className="border">
                                        <InlineCode fontSize={"sm"}>{property.key}</InlineCode>
                                    </td>
                                    {integrationKeys.map((key) => (
                                        <th key={key} className="border">
                                            {property.integrations?.[key]?.map((accessType) => (
                                                <InlineCode fontSize="sm" key={accessType}>
                                                    {accessType}
                                                </InlineCode>
                                            ))}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
