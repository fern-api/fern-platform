import { HTTPSnippet, type TargetId } from "httpsnippet-lite";

import {
  ApiDefinition,
  CodeSnippet,
  EndpointDefinition,
  ExampleEndpointCall,
} from "../latest";
import { toSnippetHttpRequest } from "./SnippetHttpRequest";
import { convertToCurl } from "./curl";
import { getHarRequest } from "./get-har-request";

interface HTTPSnippetClient {
  targetId: TargetId;
  clientId: string;
}

const CLIENTS: HTTPSnippetClient[] = [
  { targetId: "python", clientId: "requests" },
  { targetId: "javascript", clientId: "fetch" },
  { targetId: "go", clientId: "native" },
  { targetId: "ruby", clientId: "native" },
  { targetId: "java", clientId: "unirest" },
  { targetId: "php", clientId: "guzzle" },
  { targetId: "csharp", clientId: "restsharp" },
  { targetId: "swift", clientId: "nsurlsession" },
];

export async function backfillSnippets(
  apiDefinition: ApiDefinition,
  flags: {
    usesApplicationJsonInFormDataValue: boolean;
    isHttpSnippetsEnabled: boolean;
    alwaysEnableJavaScriptFetch: boolean;
  }
): Promise<ApiDefinition> {
  return {
    ...apiDefinition,
    endpoints: await Promise.all(
      Object.entries(apiDefinition.endpoints).map(
        async ([id, endpoint]) =>
          [
            id,
            {
              ...endpoint,
              examples: await Promise.all(
                endpoint.examples?.map((example) =>
                  backfillSnippetsForExample(
                    apiDefinition,
                    endpoint,
                    example,
                    flags
                  )
                ) ?? []
              ),
            },
          ] as const
      )
    ).then((entries) => Object.fromEntries(entries)),
  };
}

async function backfillSnippetsForExample(
  apiDefinition: ApiDefinition,
  endpoint: EndpointDefinition,
  example: ExampleEndpointCall,
  {
    usesApplicationJsonInFormDataValue,
    isHttpSnippetsEnabled,
    alwaysEnableJavaScriptFetch,
  }: {
    usesApplicationJsonInFormDataValue: boolean;
    isHttpSnippetsEnabled: boolean;
    alwaysEnableJavaScriptFetch: boolean;
  }
): Promise<ExampleEndpointCall> {
  const snippets = { ...example.snippets };

  const pushSnippet = (snippet: CodeSnippet) => {
    (snippets[snippet.language] ??= []).push(snippet);
  };

  // Check if curl snippet exists
  if (!snippets.curl?.length) {
    const endpointAuth = endpoint.auth?.[0];
    const curlCode = convertToCurl(
      toSnippetHttpRequest(
        endpoint,
        example,
        endpointAuth != null ? apiDefinition.auths[endpointAuth] : undefined
      ),
      { usesApplicationJsonInFormDataValue }
    );
    pushSnippet({
      name: undefined,
      language: "curl",
      install: undefined,
      code: curlCode,
      generated: true,
      description: undefined,
    });
  }

  if (isHttpSnippetsEnabled) {
    const snippet = new HTTPSnippet(
      getHarRequest(endpoint, example, apiDefinition.auths, example.requestBody)
    );
    for (const { clientId, targetId } of CLIENTS) {
      /**
       * If the snippet already exists, skip it
       */
      if (snippets[targetId]?.length) {
        continue;
      }

      /**
       * If alwaysEnableJavaScriptFetch is disabled, skip generating JavaScript snippets if TypeScript snippets are available
       */
      if (
        targetId === "javascript" &&
        snippets.typescript?.length &&
        !alwaysEnableJavaScriptFetch
      ) {
        continue;
      }

      const convertedCode = await snippet.convert(targetId, clientId);
      const code =
        typeof convertedCode === "string"
          ? convertedCode
          : convertedCode != null
            ? convertedCode[0]
            : undefined;

      if (code != null) {
        pushSnippet({
          name: undefined,
          language: targetId,
          install: undefined,
          code,
          generated: true,
          description: undefined,
        });
      }
    }
  }

  return { ...example, snippets };
}
