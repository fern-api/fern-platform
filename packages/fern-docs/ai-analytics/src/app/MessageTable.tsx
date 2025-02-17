"use client";

import { Button, Card, Select, Table, TextField } from "@radix-ui/themes";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
  SONNET35_INPUT_COST_PER_MIL_TOKENS,
  SONNET35_OUTPUT_COST_PER_MIL_TOKENS,
} from "../../utils/constants";
import { deduplicateConversation } from "../../utils/dedupeConversations";
import { exportToCSV } from "../../utils/exportToCSV";
import { Conversation, Message } from "../../utils/types";
const ITEMS_PER_PAGE = 10;

export function MessageTableClient({
  initialData,
}: {
  initialData: Conversation[];
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState("");
  const [domain, setDomain] = useState("show-all-domains");

  const filteredData = deduplicateConversation(
    initialData.filter((item) => {
      if (domain !== "show-all-domains" && item.domain !== domain) {
        return false;
      }
      let found = false;
      item.content.forEach((message: Message) => {
        if (
          message.content &&
          message.content.toLowerCase().includes(filter.toLowerCase())
        ) {
          found = true;
        }
      });
      return found;
    })
  );
  filteredData.sort((a, b) => b.created.getTime() - a.created.getTime());

  const countByDomain: Record<string, number> = initialData.reduce(
    (acc, item) => {
      acc[item.domain] = (acc[item.domain] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const roundToHundredths = (num: number) => {
    return (Math.round(num * 100) / 100).toFixed(2);
  };

  const toggleRow = (index: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="space-y-4">
      <div className="w-full overflow-x-auto">
        <Card>
          <TextField.Root
            placeholder="Type here for text filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              display: "inline-block",
              width: "400px",
              marginRight: "10px",
            }}
          />

          <Button
            variant="outline"
            onClick={() => exportToCSV(filteredData)}
            style={{
              marginRight: "10px",
            }}
          >
            Export to CSV
          </Button>

          <Select.Root
            defaultValue="show-all-domains"
            onValueChange={setDomain}
          >
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="show-all-domains">
                Show all domains
              </Select.Item>
              <Select.Item value="elevenlabs.io">
                elevenlabs.io ({countByDomain["elevenlabs.io"]} conversations)
              </Select.Item>
              <Select.Item value="buildwithfern.com">
                Buildwithfern.com ({countByDomain["buildwithfern.com"]}{" "}
                conversations)
              </Select.Item>
            </Select.Content>
          </Select.Root>
        </Card>

        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Domain</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Messages</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Created</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>
                Time to First Token
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>
                Conversation Duration
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Prompt Tokens</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Completion Tokens</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Cost</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {paginatedData.map((item, index) => (
              <Table.Row key={index}>
                <Table.Cell>
                  <Button
                    color="gray"
                    onClick={() => toggleRow(item.conversationId)}
                    className="flex items-center justify-center"
                    aria-label={
                      expandedRows[item.conversationId]
                        ? "Collapse row"
                        : "Expand row"
                    }
                  >
                    {expandedRows[item.conversationId] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </Table.Cell>
                <Table.Cell className="border border-gray-200 p-4 align-top">
                  {item.domain}
                </Table.Cell>
                <Table.Cell className="border border-gray-200 p-4">
                  {expandedRows[item.conversationId] ? (
                    <div style={{ padding: "10px" }}>
                      {item.content.map((message, msgIndex) => (
                        <Card
                          key={msgIndex}
                          className={`rounded-lg p-3 ${
                            message.role === "assistant"
                              ? "bg-blue-50"
                              : message.role === "user"
                                ? "bg-green-50"
                                : "bg-gray-50"
                          }`}
                          style={{
                            margin: "10px",
                          }}
                        >
                          <h6>{message.role}</h6>
                          <div className="whitespace-pre-wrap text-sm">
                            {message.content}
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div
                      className={`whitespace-pre-wrap rounded-lg bg-green-50 p-3 text-sm`}
                    >
                      {item.content[0].content}
                    </div>
                  )}
                </Table.Cell>
                <Table.Cell>{item.created.toISOString()}</Table.Cell>
                <Table.Cell>
                  {roundToHundredths(item.timeToFirstToken)}
                </Table.Cell>
                <Table.Cell>
                  {roundToHundredths(item.conversationDuration)}
                </Table.Cell>
                <Table.Cell>{item.promptTokens}</Table.Cell>
                <Table.Cell>{item.completionTokens}</Table.Cell>
                <Table.Cell>
                  {"$" +
                    roundToHundredths(
                      (SONNET35_INPUT_COST_PER_MIL_TOKENS * item.promptTokens) /
                        1000000.0 +
                        (SONNET35_OUTPUT_COST_PER_MIL_TOKENS *
                          item.completionTokens) /
                          1000000.0
                    )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-center space-x-2">
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          onClick={() =>
            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
          }
          disabled={currentPage === totalPages}
          className="rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
