/* eslint-disable turbo/no-undeclared-env-vars */
import { APIGatewayProxyHandler } from "aws-lambda";
import { Client } from "pg";
import { DocumentData, GetDocsEvent } from "./types";

export const handler: APIGatewayProxyHandler = async (event) => {
  const client = new Client({
    host: process.env.RDS_PROXY_ENDPOINT,
    database: process.env.DATABASE_NAME,
    port: 5432,
    ssl: {
      rejectUnauthorized: false, // Configure based on your security requirements
    },
  });

  try {
    const { docId } = JSON.parse(event.body || "{}") as GetDocsEvent;

    if (!docId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "docId is required" }),
      };
    }

    await client.connect();

    const query = `
      SELECT id, content, version, created_at, updated_at
      FROM documents
      WHERE id = $1
    `;

    const result = await client.query<DocumentData>(query, [docId]);

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Document not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows[0]),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  } finally {
    await client.end();
  }
};
