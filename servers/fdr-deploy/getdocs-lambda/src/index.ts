/* eslint-disable turbo/no-undeclared-env-vars */
import { FernVenusApi, FernVenusApiClient } from "@fern-api/venus-api-sdk";
import { APIGatewayProxyHandler } from "aws-lambda";
import { Client } from "pg";
import { createClient } from "redis";
import { ParsedBaseUrl } from "./ParsedBaseUrl";
import { DocumentData, GetDocsEvent } from "./types";

let redisClient: ReturnType<typeof createClient> | null = null;
let isConnecting = false;

async function getRedisClient() {
  // If we're already connected, return existing client
  if (redisClient?.isOpen) {
    return redisClient;
  }

  // If we're in the process of connecting, wait
  while (isConnecting) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  try {
    isConnecting = true;
    redisClient = createClient({
      url: `redis://${process.env.REDIS_ENDPOINT}`,
    });

    // Handle disconnections
    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err);
      redisClient = null;
    });

    await redisClient.connect();
    console.log("Connected to Redis");
    return redisClient;
  } finally {
    isConnecting = false;
  }
}

// Initialize Venus client without token - token will be added per-request
const baseVenusClient = new FernVenusApiClient({
  environment: process.env.VENUS_URL || "",
});

const BEARER_REGEX = /^bearer\s+/i;
export function getTokenFromAuthHeader(authHeader: string) {
  return authHeader.replace(BEARER_REGEX, "");
}

function getVenusClient({ token }: { token?: string }): FernVenusApiClient {
  if (!token) return baseVenusClient;
  return new FernVenusApiClient({
    environment: process.env.VENUS_URL || "",
    token,
  });
}

async function checkUserBelongsToOrg({
  authHeader,
  orgId,
}: {
  authHeader: string | undefined;
  orgId: string;
}): Promise<void> {
  if (authHeader == null) {
    throw new Error("Authorization header was not specified");
  }
  const token = getTokenFromAuthHeader(authHeader);
  const venus = getVenusClient({ token });
  const response = await venus.organization.isMember(
    FernVenusApi.OrganizationId(orgId)
  );
  if (!response.ok) {
    throw new Error("Failed to resolve user's organizations");
  }
  const belongsToOrg = response.body;
  if (!belongsToOrg) {
    throw new Error("User does not belong to organization");
  }
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const { url } = JSON.parse(event.body || "") as GetDocsEvent;

  if (!url) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "url is required" }),
    };
  }

  const parsedUrl = ParsedBaseUrl.parse(url);

  let client;

  const authHeader = event.headers.Authorization;
  if (authHeader) {
    try {
      await checkUserBelongsToOrg({ authHeader, orgId: "fern" });
    } catch {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "User does not belong to fern" }),
      };
    }

    try {
      const redis = await getRedisClient();

      const keys = await redis.keys("*");
      console.log("All Redis keys:", keys);

      const cachedResponse = await redis.get(parsedUrl.getFullUrl());
      if (cachedResponse != null) {
        console.log(`Cache HIT for ${url}`);
        console.log(cachedResponse);
        const parsedResponse = JSON.parse(cachedResponse);

        const filesV2 = Object.fromEntries(
          await Promise.all(
            Object.entries(parsedResponse.dbFiles).map(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              async ([fileId, dbFileInfo]: [string, any]) => {
                // porting over code from s3service
                // going to assume that it uses public s3 instead of private
                const presignedUrl = `${process.env.PUBLIC_DOCS_CDN_URL}/${dbFileInfo.s3Key}`;

                switch (dbFileInfo.type) {
                  case "image": {
                    const { s3Key, ...image } = dbFileInfo;
                    return [fileId, { ...image, url: presignedUrl }];
                  }
                  default:
                    return [fileId, { type: "url", url: presignedUrl }];
                }
              }
            )
          )
        );
        return {
          statusCode: 200,
          body: JSON.stringify({
            ...parsedResponse.response,
            definition: {
              ...parsedResponse.response.definition,
              filesV2,
            },
          }),
        };
      } else {
        console.log(`Cache MISS for ${url}`);
        console.log("Connecting to RDS");

        // second - try to get from rds db
        try {
          client = new Client({
            host: process.env.RDS_PROXY_ENDPOINT,
            port: 5432,
            // The RDS Proxy will use IAM authentication, so we don't need username/password
            ssl: {
              rejectUnauthorized: false,
            },
          });

          await client.connect();
          console.log("Connected to RDS");

          const query = `
        SELECT url, docsDefinition
        FROM Docs
        WHERE url = $1
      `;

          const result = await client.query<DocumentData>(query, [parsedUrl]);
          console.log("result", result);

          if (result.rows.length === 0) {
            return {
              statusCode: 404,
              body: JSON.stringify({ error: "Document not found" }),
            };
          }

          console.log("found result");
          console.log(result.rows[0]);
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
          if (client) {
            await client.end().catch(console.error);
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  } else {
    throw new Error("Authorization header was not specified");
  }
  return {
    statusCode: 400,
    body: JSON.stringify({ error: "bad request" }),
  };
};
