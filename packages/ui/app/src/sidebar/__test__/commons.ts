export interface TabbedVersionedFixture {
    type: "tabbed-versioned";
    name: string;
    revision: number | string;
    activeVersionId: string;
    activeTabSlug: string;
}

export interface TabbedUnversionedFixture {
    type: "tabbed-unversioned";
    name: string;
    revision: number | string;
    activeTabSlug: string;
}

export interface UntabbedVersionedFixture {
    type: "untabbed-versioned";
    name: string;
    revision: number | string;
    activeVersionId: string;
}

export interface UntabbedUnversionedFixture {
    type: "untabbed-unversioned";
    name: string;
    revision: number | string;
}

export type Fixture =
    | TabbedVersionedFixture
    | TabbedUnversionedFixture
    | UntabbedVersionedFixture
    | UntabbedUnversionedFixture;
