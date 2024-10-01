/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

export const handlerWrapper =
    (handlerFunction: (event: APIGatewayProxyEvent, context: Context) => Promise<unknown>) =>
    async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
        context.callbackWaitsForEmptyEventLoop = false;

        try {
            const response = await handlerFunction(event, context);

            return {
                statusCode: 200,
                body: JSON.stringify(response),
                headers: {
                    "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                    "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
                },
            };
        } catch (err) {
            if (err instanceof Error) {
                console.error(err);
                return { statusCode: 500, body: err.message };
            }

            return {
                statusCode: 500,
                body: "Unexpected Error",
                headers: {
                    "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                    "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
                },
            };
        }
    };
