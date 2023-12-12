export interface CodeExampleClientCurl {
    id: "curl";
    name: string;
}

export interface PythonCodeExample {
    id: "python" | "python-async";
    name: string;
    language: string;
    example: string;
}

export interface TypescriptCodeExample {
    id: "typescript";
    name: string;
    language: string;
    example: string;
}

export type CodeExampleClient = CodeExampleClientCurl | PythonCodeExample | TypescriptCodeExample;

export type CodeExampleClientId = CodeExampleClient["id"];
