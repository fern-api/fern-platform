export interface Api {
    id: string;
    name: string;
}

// [Data] TODO: fetch APIs and redirect to the first one
export const DummyApis: Api[] = [
    {
        id: "TODO",
        name: "Fern API",
    },
    {
        id: "TwoDo",
        name: "Merge API",
    },
    {
        id: "3",
        name: "Cohere",
    },
];
