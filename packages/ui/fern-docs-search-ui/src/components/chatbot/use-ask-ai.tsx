// import { useChat } from "ai/react";
// import { useAtom } from "jotai";
// import { atomWithDefault } from "jotai/utils";
// import { Dispatch, SetStateAction } from "react";
// import { createDefaultSystemPrompt } from "./system-prompt";

// const systemAtom = atomWithDefault(createDefaultSystemPrompt);

// export function useSystemPrompt(): [string, Dispatch<SetStateAction<string>>] {
//     return useAtom(systemAtom);
// }

// export interface UseAskAIOpts {
//     api?: string;
//     initialInput?: string;
//     algoliaSearchKey?: string;
//     model?: string;
//     systemContext?: Record<string, string>;
// }

// export function useAskAI({
//     api,
//     initialInput,
//     body,
// }: UseAskAIOpts): ReturnType<typeof useChat> {
//     // const system = useAtomValue(systemAtom);
//     // const compiled = template(system, {
//     //     interpolate: /{{([^}]+)}}/g,
//     // });
//     return useChat({
//         api: api ?? "/api/chat",
//         initialInput,
//         body,
//     });
// }
