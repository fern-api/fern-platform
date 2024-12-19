import { z } from "zod";

export const SuggestionsSchema = z.object({
    suggestions: z.array(z.string()),
});

export type Suggestions = z.infer<typeof SuggestionsSchema>;
