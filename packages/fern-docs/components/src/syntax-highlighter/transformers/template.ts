import type { ShikiTransformer, ThemedToken } from "shiki";

export function templateTransformer(
  templateVariables?: Set<string>
): ShikiTransformer {
  return {
    name: "template",
    tokens: (lines) => {
      if (templateVariables == null || templateVariables.size === 0) {
        return lines;
      }

      return lines.map((tokens) => {
        // Try to detect template variables in the raw line text first
        // This helps with cases where tokenization varies by language
        const rawLine = tokens.map((t) => t.content).join("");
        const templateMatches = findTemplateVariables(rawLine);

        // If we found exact template variables in the raw line and they're in our allowlist,
        // we can transform them directly
        if (templateMatches.length > 0) {
          const validTemplates = templateMatches.filter((match) =>
            templateVariables.has(match.variableName)
          );

          if (validTemplates.length > 0) {
            // Process the tokens to mark valid templates
            return processTokensWithTemplates(tokens, validTemplates);
          }
        }

        // Fall back to the original token-by-token approach
        const result: ThemedToken[] = [];
        let i = 0;

        while (i < tokens.length) {
          // Start looking for a template pattern
          if (containsStart(tokens[i]?.content)) {
            const startIndex = i;
            let openBraces = extractOpenBraces(tokens[i]!.content);
            let variableName = extractAfterOpenBraces(tokens[i]!.content);
            let closeBraces = extractCloseBraces(tokens[i]!.content);
            let j = i + 1;

            // If we found complete template in a single token
            if (
              openBraces === "{{" &&
              closeBraces === "}}" &&
              variableName.length > 0
            ) {
              if (templateVariables.has(variableName)) {
                result.push({
                  content: `{{${variableName}}}`,
                  offset: tokens[i]!.offset,
                  htmlAttrs: {
                    "data-template": variableName,
                  },
                });
                i = j;
                continue;
              }
            } else {
              // Search for the complete template across multiple tokens
              while (
                j < tokens.length &&
                (openBraces !== "{{" || closeBraces !== "}}")
              ) {
                const tokenContent = tokens[j]!.content;

                if (openBraces !== "{{") {
                  // Still collecting opening braces
                  const extracted = extractOpenBraces(tokenContent);
                  openBraces += extracted;
                  if (openBraces.length > 2)
                    openBraces = openBraces.substring(0, 2);

                  if (openBraces === "{{") {
                    // Now extract any variable part that might be in this token
                    variableName += extractAfterOpenBraces(tokenContent);
                  }
                } else {
                  // Looking for variable name and/or closing braces
                  if (containsEnd(tokenContent)) {
                    // This token has closing braces
                    const parts = splitAtClosingBraces(tokenContent);
                    variableName += parts.beforeClosing;
                    closeBraces = parts.closingBraces;
                    break;
                  } else {
                    // Just accumulate the variable name
                    variableName += tokenContent;
                  }
                }
                j++;
              }

              // Check if we found a complete template variable
              if (
                openBraces === "{{" &&
                closeBraces === "}}" &&
                variableName.length > 0
              ) {
                if (templateVariables.has(variableName)) {
                  result.push({
                    content: `{{${variableName}}}`,
                    offset: tokens[startIndex]!.offset,
                    htmlAttrs: {
                      "data-template": variableName,
                    },
                  });
                  i = j + 1;
                  continue;
                }
              }
            }
          }

          // If no template pattern was matched, just add the token
          result.push(tokens[i]!);
          i++;
        }

        return result;
      });
    },
  };
}

// Find template variables in a raw string regardless of tokenization
function findTemplateVariables(text: string): Array<{
  variableName: string;
  startIndex: number;
  endIndex: number;
}> {
  const results: Array<{
    variableName: string;
    startIndex: number;
    endIndex: number;
  }> = [];

  const regex = /\{\{([^{}]+)\}\}/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    results.push({
      variableName: match[1]!,
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return results;
}

// Process tokens with pre-identified template variables
function processTokensWithTemplates(
  tokens: ThemedToken[],
  templates: Array<{
    variableName: string;
    startIndex: number;
    endIndex: number;
  }>
): ThemedToken[] {
  // First, build a mapping of character indices to token indices
  const charToTokenMap: Map<number, number> = new Map();
  let charIndex = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token) continue;

    const tokenLength = token.content.length;
    for (let j = 0; j < tokenLength; j++) {
      charToTokenMap.set(charIndex + j, i);
    }
    charIndex += tokenLength;
  }

  // Now process each template
  const result: ThemedToken[] = [...tokens];
  const processedTokens = new Set<number>();

  // Sort templates by start index in descending order to process from end to beginning
  // This prevents index shifts when modifying the array
  templates.sort((a, b) => b.startIndex - a.startIndex);

  for (const template of templates) {
    const startTokenIndex = charToTokenMap.get(template.startIndex) ?? 0;
    const endTokenIndex =
      charToTokenMap.get(template.endIndex - 1) ?? tokens.length - 1;

    const startToken = tokens[startTokenIndex];
    if (!startToken) continue;

    if (startTokenIndex === endTokenIndex) {
      // Template is contained within a single token
      if (processedTokens.has(startTokenIndex)) continue;

      result[startTokenIndex] = {
        content: `{{${template.variableName}}}`,
        offset: startToken.offset,
        htmlAttrs: {
          "data-template": template.variableName,
        },
      };
      processedTokens.add(startTokenIndex);
    } else {
      // Template spans multiple tokens
      // Skip if any of these tokens has already been processed
      let alreadyProcessed = false;
      for (let i = startTokenIndex; i <= endTokenIndex; i++) {
        if (processedTokens.has(i)) {
          alreadyProcessed = true;
          break;
        }
      }
      if (alreadyProcessed) continue;

      // Replace the first token with the template and mark it
      result[startTokenIndex] = {
        content: `{{${template.variableName}}}`,
        offset: startToken.offset,
        htmlAttrs: {
          "data-template": template.variableName,
        },
      };
      processedTokens.add(startTokenIndex);

      // Remove the remaining tokens that were part of this template
      for (let i = startTokenIndex + 1; i <= endTokenIndex; i++) {
        result[i] = { content: "", offset: 0 };
        processedTokens.add(i);
      }
    }
  }

  // Filter out empty tokens
  return result.filter((token) => token.content !== "");
}

// Helper functions to handle various tokenization patterns

function containsStart(content?: string): boolean {
  return content != null && content.includes("{");
}

function containsEnd(content?: string): boolean {
  return content != null && content.includes("}");
}

function extractOpenBraces(content: string): string {
  let result = "";
  for (let i = 0; i < content.length; i++) {
    if (content[i] === "{") {
      result += "{";
      if (result.length === 2) break;
    } else if (result.length > 0) {
      break;
    }
  }
  return result;
}

function extractAfterOpenBraces(content: string): string {
  const doubleOpenIndex = content.indexOf("{{");
  if (doubleOpenIndex !== -1 && doubleOpenIndex + 2 < content.length) {
    const closingIndex = content.indexOf("}}", doubleOpenIndex + 2);
    if (closingIndex !== -1) {
      return content.substring(doubleOpenIndex + 2, closingIndex);
    } else {
      return content.substring(doubleOpenIndex + 2);
    }
  }

  const singleOpenIndex = content.lastIndexOf("{");
  if (singleOpenIndex !== -1 && singleOpenIndex + 1 < content.length) {
    return content.substring(singleOpenIndex + 1);
  }

  return "";
}

function extractCloseBraces(content: string): string {
  const index = content.indexOf("}}");
  if (index !== -1) {
    return "}}";
  }

  let result = "";
  for (let i = 0; i < content.length; i++) {
    if (content[i] === "}") {
      result += "}";
      if (result.length === 2) break;
    } else if (result.length > 0) {
      result = "";
    }
  }
  return result;
}

function splitAtClosingBraces(content: string): {
  beforeClosing: string;
  closingBraces: string;
} {
  const index = content.indexOf("}");
  if (index === -1) {
    return { beforeClosing: content, closingBraces: "" };
  }

  if (index + 1 < content.length && content[index + 1] === "}") {
    return {
      beforeClosing: content.substring(0, index),
      closingBraces: "}}",
    };
  }

  const secondIndex = content.indexOf("}", index + 1);
  if (secondIndex !== -1) {
    return {
      beforeClosing: content.substring(0, index),
      closingBraces: "}}",
    };
  }

  return {
    beforeClosing: content.substring(0, index),
    closingBraces: "}",
  };
}
