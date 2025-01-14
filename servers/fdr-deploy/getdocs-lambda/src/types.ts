export interface GetDocsEvent {
  url: string;
}

export interface GetDocsResponse {
  statusCode: number;
  body: string;
}

export interface DocumentData {
  url: string;
  docsDefinition: string;
}
