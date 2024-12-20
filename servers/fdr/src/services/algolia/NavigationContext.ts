import { Algolia } from "@fern-api/fdr-sdk";
import type { IndexSegment } from "./types";

export class NavigationContext {
    #indexSegment: IndexSegment;
    #pathParts: Algolia.AlgoliaRecordPathPart[];

    /**
     * The path represented by context slugs.
     */
    public get path() {
        return this.#pathParts
            .filter((p) => p.skipUrlSlug == null || !p.skipUrlSlug)
            .map((p) => p.urlSlug)
            .join("/");
    }

    /**
     * The path represented by context slugs.
     */
    public get pathParts() {
        return [...this.#pathParts];
    }

    public constructor(
        public readonly indexSegment: IndexSegment,
        pathParts: Algolia.AlgoliaRecordPathPart[],
    ) {
        this.#indexSegment = indexSegment;
        this.#pathParts = pathParts;
    }

    /**
     * @returns A new `NavigationContext` instance.
     */
    public withPathPart(pathPart: Algolia.AlgoliaRecordPathPart) {
        return this.withPathParts([pathPart]);
    }

    /**
     * @returns A new `NavigationContext` instance.
     */
    public withPathParts(pathParts: Algolia.AlgoliaRecordPathPart[]) {
        return new NavigationContext(this.#indexSegment, [...this.#pathParts, ...pathParts]);
    }

    /**
     * @returns A new `NavigationContext` instance.
     */
    public withFullSlug(fullSlug: string[]) {
        // we check if the full slug starts with the version, to see if there would be duplicate versions in the slug
        // as opposed to filtering out all (which would become chaotic if deeply in the slug)
        // this is a patch fix, since we don't know where full slug is coming from. If more bugs are encountered,
        // look into fdr to see where fullSlug comes from
        const { indexSegment } = this;
        const slug =
            fullSlug[0] === (indexSegment.type === "versioned" && indexSegment.version.urlSlug)
                ? fullSlug.slice(1)
                : fullSlug;

        return new NavigationContext(
            this.#indexSegment,
            slug.map((urlSlug) => ({ name: urlSlug, urlSlug, skipUrlSlug: undefined })),
        );
    }
}
