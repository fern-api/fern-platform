import { EnvironmentType } from "@fern-fern/fern-cloud-sdk/api";
import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Bucket, HttpMethods } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export class DocsFeStack extends Stack {
    constructor(
        scope: Construct,
        id: string,
        environmentType: EnvironmentType,
        // environmentInfo: EnvironmentInfo,
        props?: StackProps
    ) {
        super(scope, id, props);

        // const vpc = Vpc.fromLookup(this, "vpc", {
        //     vpcId: environmentInfo.vpcId,
        // });

        // const fdrSg = new SecurityGroup(this, "fdr-sg", {
        //     securityGroupName: `fdr-${environmentType.toLowerCase()}`,
        //     vpc,
        //     allowAllOutbound: true,
        // });
        // fdrSg.addIngressRule(Peer.anyIpv4(), Port.tcp(443), "allow HTTPS traffic from anywhere");
        // fdrSg.addIngressRule(Peer.ipv4(environmentInfo.vpcIpv4Cidr), Port.allTcp());

        // const snsTopic = new sns.Topic(this, "fdr-sns-topic", {
        //     topicName: id,
        // });
        // snsTopic.addSubscription(new EmailSubscription("support@buildwithfern.com"));

        new Bucket(this, "local-preview-bundle", {
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
        });
    }
}
