import { formatDataStreamPart } from "@ai-sdk/ui-utils";
import { TrieveSDK } from "trieve-ts-sdk";
import { z } from "zod";
// Allow streaming responses up to 30 seconds
export const maxDuration = 60;

const BodySchema = z.object({
  apiKey: z.string(),
  datasetId: z.string().optional(),
  organizationId: z.string().optional(),
  topicId: z.string().optional(),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
});

export async function POST(request: Request): Promise<Response> {
  const {
    apiKey,
    datasetId,
    organizationId,
    topicId: _topicId,
    messages,
  } = BodySchema.parse(await request.json());

  const client = new TrieveSDK({
    apiKey,
    datasetId,
    organizationId,
  });

  const first_user_message = messages.find(
    (message) => message.role === "user"
  )?.content;

  const topic_id =
    _topicId ??
    (
      await client.createTopic({
        owner_id: "testing",
        first_user_message,
      })
    ).id;

  const new_message_content = messages[messages.length - 1].content;

  const reader = await client.createMessageReader({
    topic_id,
    new_message_content,
  });

  const decoder = new TextDecoder("utf-8");

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(formatDataStreamPart("data", [{ topic_id }]));

      let is_data = true;
      let data = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const str = decoder.decode(value);
        if (is_data) {
          if (str.endsWith("||")) {
            data += str.slice(0, -2);
            is_data = false;
            controller.enqueue(formatDataStreamPart("data", JSON.parse(data)));
          } else {
            data += str;
          }
        } else {
          controller.enqueue(formatDataStreamPart("text", str));
        }
      }
      controller.enqueue(
        formatDataStreamPart("finish_message", {
          finishReason: "stop",
          usage: {
            promptTokens: NaN,
            completionTokens: NaN,
          },
        })
      );
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
