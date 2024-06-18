import { GetObjectCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import assert from "assert";
import type { Handler } from "aws-lambda";
import { fileTypeFromStream } from "file-type";
import isSvg from "is-svg";

export const handler: Handler = async () => {
    assert(process.env.AWS_REGION, "AWS_REGION is not defined");
    assert(process.env.AWS_ACCESS_KEY_ID, "AWS_ACCESS_KEY_ID is not defined");
    assert(process.env.AWS_SECRET_ACCESS_KEY, "AWS_SECRET_ACCESS_KEY is not defined");

    const s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });

    assert(process.env.AWS_S3_BUCKET_NAME, "AWS_S3_BUCKET_NAME is not defined");

    const command = new ListObjectsV2Command({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
    });

    const { Contents } = await s3Client.send(command);

    if (!Contents) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Failed to list objects",
            }),
        };
    }

    for (const object of Contents) {
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: object.Key,
        });
        const { Body } = await s3Client.send(command);

        if (Body) {
            const str = await Body.transformToString();

            if (isSvg(str)) {
                continue;
            }

            const stream = Body.transformToWebStream();
            const fileType = await fileTypeFromStream(stream);

            if (!fileType) {
                continue;
            }

            console.log(fileType.mime);
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            files: Contents.length,
        }),
    };
};
