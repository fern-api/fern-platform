export interface CodeExampleClientCurl {
    id: "curl";
    name: string;
}

export interface CodeExampleClientSdk {
    id: "python" | "python-async";
    name: string;
    language: string;
    example: string;
}

export type CodeExampleClient = CodeExampleClientCurl | CodeExampleClientSdk;

export type CodeExampleClientId = CodeExampleClient["id"];
