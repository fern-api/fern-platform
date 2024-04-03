import { EnvironmentType } from "@fern-fern/fern-cloud-sdk/api";
import archiver from "archiver";
import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Bucket, HttpMethods } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import * as fs from "fs";
import path from "path";

const LOCAL_PREVIEW_BUNDLE_OUT_DIR = path.resolve("../ui/local-preview-bundle/.next");

export class DocsFeStack extends Stack {
    constructor(scope: Construct, id: string, environmentType: EnvironmentType, props?: StackProps) {
        super(scope, id, props);
        const bucket = new Bucket(this, "local-preview-bundle", {
            bucketName: `${environmentType.toLowerCase()}-local-preview-bundle`,
            removalPolicy: RemovalPolicy.RETAIN,
            cors: [
                {
                    allowedMethods: [HttpMethods.GET, HttpMethods.POST, HttpMethods.PUT],
                    allowedOrigins: ["*"],
                    allowedHeaders: ["*"],
                },
            ],
            versioned: true,
            publicReadAccess: true,
            blockPublicAccess: {
                blockPublicAcls: false,
                blockPublicPolicy: false,
                ignorePublicAcls: false,
                restrictPublicBuckets: false,
            },
        });

        const local_preview_bundle_dist_zip = path.resolve(`../ui/local-preview-bundle/dist/${id}.zip`);

        void zipFolder(LOCAL_PREVIEW_BUNDLE_OUT_DIR, local_preview_bundle_dist_zip).then(() => {
            new BucketDeployment(this, "deploy-local-preview-bundle", {
                sources: [Source.asset(local_preview_bundle_dist_zip)],
                destinationBucket: bucket,
                extract: false,
            });
        });
    }
}

function mkdir(dir: string) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

async function zipFolder(sourceFolder: string, zipFilePath: string) {
    mkdir(path.dirname(zipFilePath));

    return new Promise<void>((resolve, reject) => {
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver("zip");

        archive.on("error", (err: unknown) => {
            reject(err);
        });

        output.on("close", function () {
            resolve();
        });

        archive.pipe(output);
        archive.directory(sourceFolder, false);
        void archive.finalize();
    });
}
