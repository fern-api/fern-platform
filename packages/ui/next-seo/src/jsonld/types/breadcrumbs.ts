import { z } from "zod";

export const ListElementSchema = z.object({
    "@type": z.literal("ListItem"),
    position: z.number(),
    name: z.string(),
    item: z.string().optional(),
});

export type ListElementSchema = z.infer<typeof ListElementSchema>;

export function listItem(position: number, name: string, item?: string): ListElementSchema {
    return {
        "@type": "ListItem",
        position,
        name,
        item,
    };
}

export const BreadcrumbListSchema = z.object({
    "@context": z.literal("https://schema.org"),
    "@type": z.literal("BreadcrumbList"),
    itemListElement: z.array(ListElementSchema),
});

export type BreadcrumbListSchema = z.infer<typeof BreadcrumbListSchema>;

export function breadcrumbList(itemListElement: ListElementSchema[]): BreadcrumbListSchema {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement,
    };
}
