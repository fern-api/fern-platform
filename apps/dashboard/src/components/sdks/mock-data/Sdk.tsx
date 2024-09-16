export enum SdkPublishStatus {
    OUT_OF_DATE,
    PUBLISHING,
    UP_TO_DATE,
}

export enum SdkChecksStatus {
    SUCCESSFUL,
    RUNNING,
    FAILED,
}

export enum SdkLanguage {
    JAVA = "Java",
    SWIFT = "Swift",
    TYPESCRIPT = "TypeScript",
    PYTHON = "Python",
    RUBY = "Ruby",
    GO = "Go",
    CSHARP = "C#",
}

export interface DummyGroupContext {
    id: string;
    name: string;
    sdks: DummySdkContext[];
}

export interface DummySdkContext {
    id: string;
    name: string;
    packageVersion: string;
    generatorVersion: string;
    issues: string[];
    githubUrl?: string;
    language: SdkLanguage;
}

export const DummyGroups = [
    {
        id: "group-1",
        name: "External SDKs",
        sdks: [
            {
                id: "merge-python",
                name: "merge",
                packageVersion: "0.2.0",
                generatorVersion: "2.2.0",
                issues: ["Issue 1", "Issue 2"],
                githubUrl: "https://github.com/merge-api/merge-python-client",
                language: SdkLanguage.PYTHON,
            },
            {
                id: "merge-java",
                name: "com.merge:merge-client",
                packageVersion: "0.1.0",
                generatorVersion: "0.2.3",
                issues: [],
                githubUrl: "https://github.com/merge-api/merge-java-client",
                language: SdkLanguage.JAVA,
            },
            {
                id: "merge-ruby",
                name: "merge",
                packageVersion: "0.2.0",
                generatorVersion: "2.2.0",
                issues: ["Issue 1"],
                githubUrl: "https://github.com/merge-api/merge-ruby-client",
                language: SdkLanguage.RUBY,
            },
        ],
    },
    {
        id: "group-2",
        name: "Internal",
        sdks: [
            {
                id: "merge-java",
                name: "com.merge:merge-client",
                packageVersion: "0.1.0",
                generatorVersion: "0.2.3",
                issues: [],
                githubUrl: "https://github.com/merge-api/merge-java-client",
                language: SdkLanguage.JAVA,
            },
            {
                id: "merge-ruby",
                name: "merge",
                packageVersion: "0.2.0",
                generatorVersion: "2.2.0",
                issues: ["Issue 1"],
                githubUrl: "https://github.com/merge-api/merge-ruby-client",
                language: SdkLanguage.RUBY,
            },
            {
                id: "merge-java",
                name: "com.merge:merge-client",
                packageVersion: "0.1.0",
                generatorVersion: "0.2.3",
                issues: [],
                githubUrl: "https://github.com/merge-api/merge-java-client",
                language: SdkLanguage.JAVA,
            },
            {
                id: "merge-ruby",
                name: "merge",
                packageVersion: "0.2.0",
                generatorVersion: "2.2.0",
                issues: ["Issue 1"],
                githubUrl: "https://github.com/merge-api/merge-ruby-client",
                language: SdkLanguage.RUBY,
            },
        ],
    },
];
