import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import "source-map-support/register";

export const handlerWrapper =
    (handlerFunction: (event: APIGatewayProxyEvent, context: Context) => Promise<unknown>) =>
    async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
        context.callbackWaitsForEmptyEventLoop = false;

        try {
            const response = await handlerFunction(event, context);

            return { statusCode: 200, body: JSON.stringify(response) };
        } catch (err) {
            if (err instanceof Error) {
                console.error(err);
                return { statusCode: 500, body: err.message };
            }

            return { statusCode: 500, body: "Unexpected Error" };
        }
    };
