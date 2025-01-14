/* eslint-disable turbo/no-undeclared-env-vars */
import { FernVenusApi, FernVenusApiClient } from "@fern-api/venus-api-sdk";
import { APIGatewayProxyHandler } from "aws-lambda";
import { Client } from "pg";
import { createClient } from "redis";
import { ParsedBaseUrl } from "./ParsedBaseUrl";
import { DocumentData, GetDocsEvent } from "./types";

// copied from https://github.com/fern-api/fern-platform/blob/main/servers/fdr/src/services/auth/AuthService.ts#L96
function getVenusClient({ token }: { token?: string }): FernVenusApiClient {
  return new FernVenusApiClient({
    environment: process.env.VENUS_URL || "",
    token,
  });
}

const BEARER_REGEX = /^bearer\s+/i;
export function getTokenFromAuthHeader(authHeader: string) {
  return authHeader.replace(BEARER_REGEX, "");
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

// dummy change
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

    // first - try to get from redis cache
    const redis = createClient({
      url: `redis://${process.env.REDIS_ENDPOINT}`,
    });

    await redis.connect();
    const cachedResponse = await redis.get(parsedUrl.getFullUrl());
    if (cachedResponse != null) {
      console.log(`Cache HIT for ${url}`);
      console.log(cachedResponse);
      // const filesV2 = Object.fromEntries(
      //   await Promise.all(
      //     Object.entries(cachedResponse.dbFiles).map(
      //       async ([fileId, dbFileInfo]) => {
      //         const presignedUrl =
      //           await this.app.services.s3.getPresignedDocsAssetsDownloadUrl({
      //             key: dbFileInfo.s3Key,
      //             isPrivate:
      //               cachedResponse.usesPublicS3 === true ? false : true,
      //           });

      //         switch (dbFileInfo.type) {
      //           case "image": {
      //             const { s3Key, ...image } = dbFileInfo;
      //             return [fileId, { ...image, url: presignedUrl }];
      //           }
      //           default:
      //             return [fileId, { type: "url", url: presignedUrl }];
      //         }
      //       }
      //     )
      //   )
      // );
      // return {
      //   ...cachedResponse.response,
      //   definition: {
      //     ...cachedResponse.response.definition,
      //     filesV2,
      //   },
      // };
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

        const query = `
        SELECT url, docsDefinition
        FROM Docs
        WHERE url = $1
      `;

        const result = await client.query<DocumentData>(query, [parsedUrl]);

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
    return {
      statusCode: 500,
      body: "Internal server error",
    };
  } else {
    throw new Error("Authorization header was not specified");
  }
};
