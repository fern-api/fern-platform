export interface GetDocsEvent {
  docId: string;
}

export interface GetDocsResponse {
  statusCode: number;
  body: string;
}

export interface DocumentData {
  id: string;
  content: string;
  version: string;
  created_at: Date;
  updated_at: Date;
}
