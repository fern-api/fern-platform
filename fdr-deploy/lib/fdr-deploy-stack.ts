import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { SecurityGroup, Vpc, Peer, Port } from "aws-cdk-lib/aws-ec2";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Cluster, ContainerImage, LogDriver, Volume } from "aws-cdk-lib/aws-ecs";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import { ApplicationProtocol } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { HostedZone } from "aws-cdk-lib/aws-route53";
import { EnvironmentInfo, EnvironmentType } from "@fern-fern/fern-cloud-sdk/api";
import { CloudFrontWebDistribution, OriginAccessIdentity, ViewerCertificate } from "aws-cdk-lib/aws-cloudfront";

const CONTAINER_NAME = "fern-definition-registry";
const SERVICE_NAME = "fdr";

export class FdrDeployStack extends Stack {
    constructor(
        scope: Construct,
        id: string,
        version: string,
        environmentType: EnvironmentType,
        environmentInfo: EnvironmentInfo,
        props?: StackProps
    ) {
        super(scope, id, props);

        const vpc = Vpc.fromLookup(this, "vpc", {
            vpcId: environmentInfo.vpcId,
        });

        const efsSg = SecurityGroup.fromLookupByName(this, "efs-sg", environmentInfo.efsInfo.securityGroupName, vpc);

        const fdrSg = new SecurityGroup(this, "fdr-sg", {
            securityGroupName: `fdr-${environmentType.toLowerCase()}`,
            vpc,
            allowAllOutbound: true,
        });
        fdrSg.addIngressRule(Peer.anyIpv4(), Port.tcp(443), "allow HTTPS traffic from anywhere");

        const cluster = Cluster.fromClusterAttributes(this, "cluster", {
            clusterName: environmentInfo.ecsInfo.clusterName,
            vpc,
            securityGroups: [],
        });

        const logGroup = LogGroup.fromLogGroupName(this, "log-group", environmentInfo.logGroupInfo.logGroupName);

        const certificate = Certificate.fromCertificateArn(
            this,
            "ceritificate",
            environmentInfo.route53Info.certificateArn
        );

        const docsFeBucket = Bucket.fromBucketName(this, "docs-fe", environmentInfo.docsS3BucketName);
        const originAccessIdentity = new OriginAccessIdentity(this, "OIA");

        new CloudFrontWebDistribution(this, "distribution", {
            originConfigs: [
                {
                    s3OriginSource: {
                        s3BucketSource: docsFeBucket,
                        originAccessIdentity,
                    },
                    behaviors: [{ isDefaultBehavior: true }],
                },
            ],
            errorConfigurations: [
                {
                    errorCode: 404,
                    responseCode: 200,
                    responsePagePath: "/index.html",
                },
            ],
            viewerCertificate: ViewerCertificate.fromAcmCertificate(certificate),
        });

        const fdrBucket = new Bucket(this, "fdr-docs-files", {
            bucketName: `fdr-${environmentType.toLowerCase()}-docs-files`,
            removalPolicy: RemovalPolicy.RETAIN,
        });

        const cloudmapNamespace = environmentInfo.cloudMapNamespaceInfo.namespaceName;
        const fargateService = new ApplicationLoadBalancedFargateService(this, SERVICE_NAME, {
            serviceName: SERVICE_NAME,
            cluster,
            cpu: 256,
            memoryLimitMiB: 512,
            desiredCount: 1,
            securityGroups: [fdrSg, efsSg],
            taskImageOptions: {
                image: ContainerImage.fromTarball(`../docker/build/tar/fern-definition-registry:${version}.tar`),
                environment: {
                    VENUS_URL: `http://venus.${cloudmapNamespace}:8080/`,
                    AWS_ACCESS_KEY_ID: getEnvironmentVariableOrThrow("AWS_ACCESS_KEY_ID"),
                    AWS_SECRET_ACCESS_KEY: getEnvironmentVariableOrThrow("AWS_SECRET_ACCESS_KEY"),
                    S3_BUCKET_NAME: fdrBucket.bucketName,
                    S3_BUCKET_REGION: fdrBucket.stack.region,
                },
                containerName: CONTAINER_NAME,
                containerPort: 8080,
                enableLogging: true,
                logDriver: LogDriver.awsLogs({
                    logGroup,
                    streamPrefix: SERVICE_NAME,
                }),
            },
            assignPublicIp: true,
            publicLoadBalancer: true,
            enableECSManagedTags: true,
            protocol: ApplicationProtocol.HTTPS,
            certificate,
            domainZone: HostedZone.fromHostedZoneAttributes(this, "zoneId", {
                hostedZoneId: environmentInfo.route53Info.hostedZoneId,
                zoneName: environmentInfo.route53Info.hostedZoneName,
            }),
            domainName: getServiceDomainName(environmentType, environmentInfo),
        });

        const efsVolume: Volume = {
            name: "fdr-volume",
            efsVolumeConfiguration: {
                fileSystemId: environmentInfo.efsInfo.fileSystemId,
                authorizationConfig: {
                    accessPointId: environmentInfo.efsInfo.fdrAccessPointId,
                },
                transitEncryption: "ENABLED",
            },
        };
        fargateService.taskDefinition.addVolume(efsVolume);

        fargateService.taskDefinition.findContainer(CONTAINER_NAME)?.addMountPoints({
            containerPath: "/opt/var/data",
            sourceVolume: efsVolume.name,
            readOnly: false,
        });

        fargateService.targetGroup.setAttribute("deregistration_delay.timeout_seconds", "30");

        fargateService.targetGroup.configureHealthCheck({
            healthyHttpCodes: "200",
            path: "/health",
            port: "8080",
        });
    }
}

function getServiceDomainName(environmentType: EnvironmentType, environmentInfo: EnvironmentInfo) {
    if (environmentType == EnvironmentType.Prod) {
        return "registry" + "." + environmentInfo.route53Info.hostedZoneName;
    }
    return "registry" + "-" + environmentType.toLowerCase() + "." + environmentInfo.route53Info.hostedZoneName;
}

function getEnvironmentVariableOrThrow(environmentVariable: string): string {
    const value = process.env[environmentVariable];
    if (value == null) {
        throw new Error(`Environment variable ${environmentVariable} not found`);
    }
    return value;
}
