"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Message {
  role: string;
  content: string;
}

interface DomainMessages {
  domain: string;
  content: Message[];
}

const ITEMS_PER_PAGE = 10;

export function MessageTableClient({
  initialData,
}: {
  initialData: DomainMessages[];
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [filter, setFilter] = useState("");

  const filteredData = initialData.filter((item) => {
    let found = false;
    item.content.forEach((message) => {
      if (
        message.content &&
        message.content.toLowerCase().includes(filter.toLowerCase())
      ) {
        found = true;
      }
    });
    return found;
  });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const toggleRow = (index: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="space-y-4">
      <div className="w-full overflow-x-auto">
        <input
          type="text"
          placeholder="Filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="w-8 border border-gray-200 p-4"></th>
              <th className="border border-gray-200 p-4 text-left font-medium">
                Domain
              </th>
              <th className="border border-gray-200 p-4 text-left font-medium">
                Messages
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="border border-gray-200 p-4">
                  <button
                    onClick={() => toggleRow(index)}
                    className="flex items-center justify-center"
                    aria-label={
                      expandedRows[index] ? "Collapse row" : "Expand row"
                    }
                  >
                    {expandedRows[index] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                </td>
                <td className="border border-gray-200 p-4 align-top">
                  {item.domain}
                </td>
                <td className="border border-gray-200 p-4">
                  {expandedRows[index] ? (
                    <div className="space-y-4">
                      {item.content.map((message, msgIndex) => (
                        <div
                          key={msgIndex}
                          className={`rounded-lg p-3 ${
                            message.role === "assistant"
                              ? "bg-blue-50"
                              : message.role === "user"
                                ? "bg-green-50"
                                : "bg-gray-50"
                          }`}
                        >
                          <div className="mb-1 text-sm font-medium text-gray-700">
                            {message.role}
                          </div>
                          <div className="whitespace-pre-wrap text-sm">
                            {message.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      className={`whitespace-pre-wrap rounded-lg bg-green-50 p-3 text-sm`}
                    >
                      {item.content[0].content}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-center space-x-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
          }
          disabled={currentPage === totalPages}
          className="rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
