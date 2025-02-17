"use client";

import { Button, Card, Select, Table, TextField } from "@radix-ui/themes";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Message {
  role: string;
  content: string;
}

interface DomainMessages {
  domain: string;
  content: Message[];
  created: Date;
  conversationId: string;
  timeToFirstToken: number;
  conversationDuration: number;
  promptTokens: number;
  completionTokens: number;
}

const ITEMS_PER_PAGE = 10;

export function MessageTableClient({
  initialData,
}: {
  initialData: DomainMessages[];
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState("");
  const [domain, setDomain] = useState("show-all-domains");

  function deduplicateDomainMessages(
    messages: DomainMessages[]
  ): DomainMessages[] {
    // Sort messages by length (descending) to process longer conversations first
    const sortedMessages = [...messages].sort(
      (a, b) => b.content.length - a.content.length
    );

    // Keep track of which messages to retain
    const retainedMessages: DomainMessages[] = [];

    sortedMessages.forEach((currentMsg) => {
      const currentSignature = createConversationSignature(currentMsg.content);

      // Check if this conversation is contained within any retained message
      const isContained = retainedMessages.some((retained) => {
        // Only compare if within 5 minute window
        const timeDiff = Math.abs(
          retained.created.getTime() - currentMsg.created.getTime()
        );
        const fiveMinutesInMs = 5 * 60 * 1000;

        if (timeDiff > fiveMinutesInMs) {
          return false;
        }

        // Check if the current message's signature is contained within the retained message
        const retainedSignature = createConversationSignature(retained.content);
        return isSignatureContained(currentSignature, retainedSignature);
      });

      if (!isContained) {
        retainedMessages.push(currentMsg);
      }
    });

    return retainedMessages;
  }

  function createConversationSignature(messages: Message[]): string[] {
    // Instead of creating a single string signature, return array of message signatures
    return messages.map((msg) => {
      if (!msg.content) return "";
      const normalizedContent = msg.content.toLowerCase().trim();
      const contentHash = hashString(normalizedContent);
      return `${msg.role}:${contentHash}`;
    });
  }

  function isSignatureContained(
    shorterSig: string[],
    longerSig: string[]
  ): boolean {
    // Check if shorter signature appears at the start of longer signature
    if (shorterSig.length > longerSig.length) {
      return false;
    }

    // Check if all elements in shorter signature match the beginning of longer signature
    return shorterSig.every((sig, index) => sig === longerSig[index]);
  }

  function hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  const filteredData = deduplicateDomainMessages(
    initialData.filter((item) => {
      if (domain !== "show-all-domains" && item.domain !== domain) {
        return false;
      }
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
    })
  );

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

  const removeCommas = (str: string) => {
    return str.replace(/,/g, "");
  };

  const exportToCSV = (data: DomainMessages[]) => {
    const csvContent = [];
    csvContent.push(
      "Domain,Conversation Id,Input,Output,Created,Time to First Token,Conversation Duration,Prompt Tokens,Completion Tokens"
    );
    data.forEach((item) => {
      for (let i = 0; i < item.content.length - 1; i++) {
        const message = item.content[i];
        if (message.role === "user") {
          let assistantMessage = item.content[i + 1].content;
          while (
            item.content[i + 1] &&
            item.content[i + 1].role == "assistant"
          ) {
            assistantMessage += item.content[i + 1].content;
            i++;
          }
          csvContent.push(
            `${item.domain},${item.conversationId},${removeCommas(JSON.stringify(message.content))},${removeCommas(JSON.stringify(assistantMessage))},${item.created.toISOString()},${item.timeToFirstToken},${item.conversationDuration},${item.promptTokens},${item.completionTokens}`
          );
        }
      }
    });
    const blob = new Blob([csvContent.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "messages.csv";
    a.click();
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
                <Table.Cell>{item.timeToFirstToken}</Table.Cell>
                <Table.Cell>{item.conversationDuration}</Table.Cell>
                <Table.Cell>{item.promptTokens}</Table.Cell>
                <Table.Cell>{item.completionTokens}</Table.Cell>
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
