import { Conversation, Message } from "./types";

export function deduplicateConversation(
  messages: Conversation[]
): Conversation[] {
  // Sort messages by length (descending) to process longer conversations first
  const sortedMessages = [...messages].sort(
    (a, b) => b.content.length - a.content.length
  );

  // Keep track of which messages to retain
  const retainedMessages: Conversation[] = [];

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
  return messages
    .filter((msg) => msg.role === "user")
    .map((msg) => {
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
