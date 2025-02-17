import {
  SONNET35_INPUT_COST_PER_MIL_TOKENS,
  SONNET35_OUTPUT_COST_PER_MIL_TOKENS,
} from "./constants";
import { Conversation } from "./types";

const removeCommas = (str: string) => {
  return str.replace(/,/g, "");
};

export const exportToCSV = (data: Conversation[]) => {
  const csvContent = [];
  csvContent.push(
    "Domain,Conversation Id,Input,Output,Created,Time to First Token,Conversation Duration,Prompt Tokens,Completion Tokens,Cost"
  );
  data.forEach((item) => {
    for (let i = 0; i < item.content.length - 1; i++) {
      const message = item.content[i];
      if (message.role === "user") {
        let assistantMessage = item.content[i + 1].content;
        while (item.content[i + 1] && item.content[i + 1].role == "assistant") {
          assistantMessage += item.content[i + 1].content;
          i++;
        }
        csvContent.push(
          `${item.domain},${item.conversationId},${removeCommas(JSON.stringify(message.content))},${removeCommas(JSON.stringify(assistantMessage))},${item.created.toISOString()},${item.timeToFirstToken},${item.conversationDuration},${item.promptTokens},${item.completionTokens},${(SONNET35_INPUT_COST_PER_MIL_TOKENS * item.promptTokens) / 1000000.0 + (SONNET35_OUTPUT_COST_PER_MIL_TOKENS * item.completionTokens) / 1000000.0}`
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
