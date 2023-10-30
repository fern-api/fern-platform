import { Icon } from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import * as csv from "csv-stringify/sync";
import { FC, useCallback, useState } from "react";

export declare namespace FernTable {
    export interface Column {
        key: string;
        columnName: string;
        required?: boolean | string;
        description?: string;
        width?: number;
    }

    export interface Props {
        columns: Column[];
        data: Record<string, string>[];
    }
}

export const FernTable: FC<FernTable.Props> = ({ columns, data }) => {
    const [value, setValue] = useState<string>();
    const [pinnedColKeys, setPinnedColKeys] = useState<string[]>([]);
    const togglePinnedColumn = useCallback(
        (col: string) =>
            setPinnedColKeys((lastSet) =>
                lastSet.includes(col) ? lastSet.filter((lastSetCol) => lastSetCol !== col) : [...lastSet, col]
            ),
        []
    );

    const downloadAsCsv = () => {
        const csvContent = csv.stringify([
            columns.map((column) => column.columnName),
            ...data.map((row) => columns.map((column) => row[column.key])),
        ]);
        const csvData = new Blob([csvContent], { type: "text/csv" });
        const csvUrl = URL.createObjectURL(csvData);

        const a = document.createElement("a");
        a.href = csvUrl;
        a.download = "data.csv";

        a.click();

        URL.revokeObjectURL(csvUrl);
        a.remove();
    };

    const filteredColumnKeys = (
        value == null || value.trim().length === 0
            ? columns
            : columns.filter((col) => col.columnName.toLowerCase().includes(value.toLowerCase()))
    ).map((col) => col.key);

    const pinnedColumns = pinnedColKeys
        .filter((col) => filteredColumnKeys.includes(col))
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .map((colKey) => columns.find((col) => col.key === colKey)!);
    const unpinnedColumns = filteredColumnKeys
        .filter((col) => !pinnedColKeys.includes(col))
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .map((colKey) => columns.find((col) => col.key === colKey)!);

    const createRenderColumnHeader = (sticky: boolean) => {
        return function renderColumnHeader(column: FernTable.Column, idx: number) {
            return (
                <th
                    key={column.key}
                    className={classNames("whitespace-nowrap bg-background text-left text-sm font-normal p-0 group", {
                        sticky,
                    })}
                    style={{ left: sticky ? idx * 120 : undefined }}
                >
                    <Tooltip2
                        content={
                            <div className="max-w-xs">
                                <div>{column.columnName}</div>
                                <div className="text-xs text-white/50">
                                    {column.required === true
                                        ? "Required"
                                        : column.required === false
                                        ? "Optional"
                                        : column.required}
                                </div>
                                <div className="text-xs">{column.description}</div>
                            </div>
                        }
                        targetTagName="div"
                        position="top"
                        minimal={true}
                    >
                        <div className="group w-full overflow-hidden border-r border-white/10 bg-white/10 p-1 group-last:border-r-0">
                            <div className="flex">
                                <div className="flex-1 truncate">{column.columnName}</div>

                                <div
                                    className={classNames("cursor-pointer text-xs", {
                                        "hidden group-hover:block": !sticky,
                                    })}
                                    onClick={() => togglePinnedColumn(column.key)}
                                >
                                    <Icon icon={sticky ? "star" : "star-empty"} />
                                </div>
                            </div>

                            <div className="truncate text-xs text-white/50">
                                {column.required === true
                                    ? "Required"
                                    : column.required === false
                                    ? "Optional"
                                    : column.required}
                            </div>
                        </div>
                    </Tooltip2>
                </th>
            );
        };
    };

    const table = (
        <table
            className={classNames(
                "text-text-primary-light dark:text-text-primary-dark w-full table-fixed border-collapse border-spacing-0 whitespace-nowrap"
            )}
        >
            <colgroup>
                {[...pinnedColumns, ...unpinnedColumns].map((column) => (
                    <col key={column.key} width={column.width?.toString() ?? "120"} />
                ))}
            </colgroup>
            <thead>
                <tr>
                    {pinnedColumns.map(createRenderColumnHeader(true))}
                    {unpinnedColumns.map(createRenderColumnHeader(false))}
                </tr>
            </thead>
            <tbody>
                {data.map((row, idx) => (
                    <tr key={idx}>
                        {pinnedColumns.map((column, idx) => (
                            <td
                                key={column.key}
                                className={classNames("whitespace-nowrap font-mono text-xs bg-background p-0 group", {
                                    sticky: true,
                                })}
                                style={{ left: idx * 120 }}
                            >
                                <div className="w-full overflow-hidden truncate border-r border-t border-white/10 p-1 group-last:border-r-0">
                                    {row[column.key]?.toString()}
                                </div>
                            </td>
                        ))}
                        {unpinnedColumns.map((column) => (
                            <td
                                key={column.key}
                                className="bg-background group whitespace-nowrap p-0 font-mono text-xs"
                            >
                                <div className="w-full overflow-hidden truncate border-r border-t border-white/10 p-1 group-last:border-r-0">
                                    {row[column.key]?.toString()}
                                </div>
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <div className="bg-background relative mb-3 overflow-x-auto overflow-y-hidden rounded border border-white/20 shadow-lg">
            <div className="sticky left-0 flex items-stretch justify-end border-b border-white/10 bg-white/10 text-xs text-white/50">
                <div className="p-1">{columns.length} Columns</div>
                <div className="border-l border-white/10 p-1">{data.length} Rows</div>
                <div className="border-l border-white/10">
                    <input
                        value={value}
                        onChange={(e) => setValue(e.currentTarget.value)}
                        className="h-full bg-transparent px-1"
                        placeholder="Search columns..."
                    />
                </div>
                <div className="cursor-pointer border-l border-white/10 p-1 hover:text-white" onClick={downloadAsCsv}>
                    <FontAwesomeIcon icon="cloud-arrow-down" />
                </div>
            </div>
            {table}
        </div>
    );
};
