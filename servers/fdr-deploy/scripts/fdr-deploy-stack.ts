import { EnvironmentInfo, EnvironmentType } from "@fern-fern/fern-cloud-sdk/api";
import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { Alarm } from "aws-cdk-lib/aws-cloudwatch";
import * as actions from "aws-cdk-lib/aws-cloudwatch-actions";
import { Peer, Port, SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";
import { Cluster, ContainerImage, LogDriver, Volume } from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import { ApplicationProtocol, HttpCodeTarget } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { LoadBalancerTarget } from "aws-cdk-lib/aws-route53-targets";
import { Bucket, HttpMethods } from "aws-cdk-lib/aws-s3";
import { PrivateDnsNamespace } from "aws-cdk-lib/aws-servicediscovery";
import * as sns from "aws-cdk-lib/aws-sns";
import { EmailSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { Construct } from "constructs";
import { ElastiCacheStack } from "./elasticache-stack";

const CONTAINER_NAME = "fern-definition-registry";
const SERVICE_NAME = "fdr";

export class FdrDeployStack extends Stack {
    constructor(
        scope: Construct,
        id: string,
        version: string,
        environmentType: EnvironmentType,
        environmentInfo: EnvironmentInfo,
        props?: StackProps,
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
        fdrSg.addIngressRule(Peer.ipv4(environmentInfo.vpcIpv4Cidr), Port.allTcp());

        const cluster = Cluster.fromClusterAttributes(this, "cluster", {
            clusterName: environmentInfo.ecsInfo.clusterName,
            vpc,
            securityGroups: [],
        });

        const logGroup = LogGroup.fromLogGroupName(this, "log-group", environmentInfo.logGroupInfo.logGroupName);

        const certificate = Certificate.fromCertificateArn(
            this,
            "ceritificate",
            environmentInfo.route53Info.certificateArn,
        );

        const snsTopic = new sns.Topic(this, "fdr-sns-topic", {
            topicName: id,
        });
        snsTopic.addSubscription(new EmailSubscription("support@buildwithfern.com"));

        const fdrBucket = new Bucket(this, "fdr-docs-files", {
            bucketName: `fdr-${environmentType.toLowerCase()}-docs-files`,
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

        const cloudmapNamespaceName = environmentInfo.cloudMapNamespaceInfo.namespaceName;
        const cloudMapNamespace = PrivateDnsNamespace.fromPrivateDnsNamespaceAttributes(this, "private-cloudmap", {
            namespaceArn: environmentInfo.cloudMapNamespaceInfo.namespaceArn,
            namespaceId: environmentInfo.cloudMapNamespaceInfo.namespaceId,
            namespaceName: cloudmapNamespaceName,
        });
        const hostedZone = HostedZone.fromHostedZoneAttributes(this, "zoneId", {
            hostedZoneId: environmentInfo.route53Info.hostedZoneId,
            zoneName: environmentInfo.route53Info.hostedZoneName,
        });
        const fargateService = new ApplicationLoadBalancedFargateService(this, SERVICE_NAME, {
            serviceName: SERVICE_NAME,
            cluster,
            cpu: environmentType === "PROD" ? 4096 : 512,
            memoryLimitMiB: environmentType === "PROD" ? 8192 : 1024,
            desiredCount: 1, // TODO: make this 2 in prod
            securityGroups: [fdrSg, efsSg],
            taskImageOptions: {
                image: ContainerImage.fromTarball(`../../docker/build/tar/fern-definition-registry:${version}.tar`),
                environment: {
                    VENUS_URL: `http://venus.${cloudmapNamespaceName}:8080/`,
                    AWS_ACCESS_KEY_ID: getEnvironmentVariableOrThrow("AWS_ACCESS_KEY_ID"),
                    AWS_SECRET_ACCESS_KEY: getEnvironmentVariableOrThrow("AWS_SECRET_ACCESS_KEY"),
                    S3_BUCKET_NAME: fdrBucket.bucketName,
                    S3_BUCKET_REGION: fdrBucket.stack.region,
                    DOMAIN_SUFFIX: getDomainSuffix(environmentType),
                    ALGOLIA_APP_ID: getEnvironmentVariableOrThrow("ALGOLIA_APP_ID"),
                    ALGOLIA_ADMIN_API_KEY: getEnvironmentVariableOrThrow("ALGOLIA_ADMIN_API_KEY"),
                    ALGOLIA_SEARCH_INDEX: getEnvironmentVariableOrThrow("ALGOLIA_SEARCH_INDEX"),
                    ALGOLIA_SEARCH_API_KEY: getEnvironmentVariableOrThrow("ALGOLIA_SEARCH_API_KEY"),
                    SLACK_TOKEN: getEnvironmentVariableOrThrow("FERNIE_SLACK_APP_TOKEN"),
                    LOG_LEVEL: getLogLevel(environmentType),
                    ENABLE_CUSTOMER_NOTIFICATIONS: (environmentType === "PROD").toString(),
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
            domainZone: hostedZone,
            domainName: getServiceDomainName(environmentType, environmentInfo),
            cloudMapOptions:
                cloudMapNamespace != null
                    ? {
                          cloudMapNamespace,
                          name: SERVICE_NAME,
                      }
                    : undefined,
        });

        new ARecord(this, "api-domain", {
            zone: hostedZone,
            target: RecordTarget.fromAlias(new LoadBalancerTarget(fargateService.loadBalancer)),
            recordName: environmentType === "PROD" ? "api" : `api-${environmentType.toLowerCase()}`,
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

        fargateService.loadBalancer.setAttribute("idle_timeout.timeout_seconds", "900");

        fargateService.targetGroup.configureHealthCheck({
            healthyHttpCodes: "200",
            path: "/health",
            port: "8080",
            timeout: Duration.seconds(120),
            interval: Duration.seconds(150),
            unhealthyThresholdCount: 5,
        });

        const lbResponseTimeAlarm = new Alarm(this, "fdr-lb-target-respones-time-alarm", {
            alarmName: `${id} Load Balancer Target Response Time Threshold`,
            metric: fargateService.loadBalancer.metrics.targetResponseTime(),
            threshold: 1,
            evaluationPeriods: 5,
        });
        lbResponseTimeAlarm.addAlarmAction(new actions.SnsAction(snsTopic));

        const lbUnhealthyHostCountAlarm = new Alarm(this, "fdr-lb-unhealthy-host-count-alarm", {
            alarmName: `${id} Load Balancer Unhealthy Host Count Alarm`,
            metric: fargateService.targetGroup.metrics.unhealthyHostCount(),
            threshold: 1,
            evaluationPeriods: 5,
        });
        lbUnhealthyHostCountAlarm.addAlarmAction(new actions.SnsAction(snsTopic));

        const lb500CountAlarm = new Alarm(this, "fdr-lb-5XX-count", {
            alarmName: `${id} Load Balancer 500 Error Alarm`,
            metric: fargateService.loadBalancer.metrics.httpCodeTarget(HttpCodeTarget.TARGET_5XX_COUNT),
            threshold: 2,
            evaluationPeriods: 5,
        });
        lb500CountAlarm.addAlarmAction(new actions.SnsAction(snsTopic));

        new ElastiCacheStack(scope, "FernDocsElastiCache", {
            cacheName: "FernDocsElastiCache",
            IVpc: vpc,
            numCacheShards: 1,
            numCacheReplicasPerShard: 2,
            clusterMode: "enabled",
            cacheNodeType: "cache.r7g.large",
        });
    }
}

function getServiceDomainName(environmentType: EnvironmentType, environmentInfo: EnvironmentInfo) {
    if (environmentType === EnvironmentType.Prod) {
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

function getLogLevel(environmentType: EnvironmentType): string {
    switch (environmentType) {
        case "DEV":
        case "DEV2":
            return "debug";
        case "PROD":
            return "info";
        default:
            assertNever(environmentType);
    }
}

function getDomainSuffix(environmentType: EnvironmentType): string {
    switch (environmentType) {
        case "DEV":
        case "DEV2":
            return "docs.dev.buildwithfern.com";
        case "PROD":
            return "docs.buildwithfern.com";
        default:
            assertNever(environmentType);
    }
}

function assertNever(x: never): never {
    throw new Error("Unexpected value: " + JSON.stringify(x));
}
