import { EnvironmentInfo, EnvironmentType } from "@fern-fern/fern-cloud-sdk/api";
import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { Alarm } from "aws-cdk-lib/aws-cloudwatch";
import * as actions from "aws-cdk-lib/aws-cloudwatch-actions";
import { Peer, Port, SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";
import { Cluster, ContainerImage, LogDriver } from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import { ApplicationProtocol, HttpCodeElb } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { HostedZone } from "aws-cdk-lib/aws-route53";
import { PrivateDnsNamespace } from "aws-cdk-lib/aws-servicediscovery";
import * as sns from "aws-cdk-lib/aws-sns";
import { EmailSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { Construct } from "constructs";

const CONTAINER_NAME = "grpc-proxy";
const SERVICE_NAME = "grpc";

interface GrpcStackOptions {
    maxTaskCount: number;
    desiredTaskCount: number;
    cpu: number;
    memory: number;
}

export class GrpcDeployStack extends Stack {
    constructor(
        scope: Construct,
        id: string,
        version: string,
        environmentType: EnvironmentType,
        environmentInfo: EnvironmentInfo,
        options: GrpcStackOptions,
        props?: StackProps,
    ) {
        super(scope, id, props);

        const vpc = Vpc.fromLookup(this, "vpc", {
            vpcId: environmentInfo.vpcId,
        });

        const efsSg = SecurityGroup.fromLookupByName(this, "efs-sg", environmentInfo.efsInfo.securityGroupName, vpc);

        const grpcSg = new SecurityGroup(this, "grpc-sg", {
            securityGroupName: `grpc-${environmentType.toLowerCase()}`,
            vpc,
            allowAllOutbound: true,
        });
        grpcSg.addIngressRule(Peer.anyIpv4(), Port.tcp(443), "allow HTTPS traffic from anywhere");
        grpcSg.addIngressRule(Peer.ipv4(environmentInfo.vpcIpv4Cidr), Port.allTcp());

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

        const hostedZone = HostedZone.fromHostedZoneAttributes(this, "zoneId", {
            hostedZoneId: environmentInfo.route53Info.hostedZoneId,
            zoneName: environmentInfo.route53Info.hostedZoneName,
        });

        const snsTopic = new sns.Topic(this, "grpc-sns-topic", {
            topicName: id,
        });
        snsTopic.addSubscription(new EmailSubscription("support@buildwithfern.com"));

        const cloudmapNamespaceName = environmentInfo.cloudMapNamespaceInfo.namespaceName;
        const cloudMapNamespace = PrivateDnsNamespace.fromPrivateDnsNamespaceAttributes(this, "private-cloudmap", {
            namespaceArn: environmentInfo.cloudMapNamespaceInfo.namespaceArn,
            namespaceId: environmentInfo.cloudMapNamespaceInfo.namespaceId,
            namespaceName: cloudmapNamespaceName,
        });

        const fargateService = new ApplicationLoadBalancedFargateService(this, SERVICE_NAME, {
            serviceName: SERVICE_NAME,
            cluster,
            cpu: options.cpu,
            memoryLimitMiB: options.memory,
            desiredCount: options.desiredTaskCount,
            securityGroups: [grpcSg, efsSg],
            taskImageOptions: {
                image: ContainerImage.fromTarball(`../../docker/build/tar/grpc-proxy:${version}.tar`),
                environment: {},
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

        // const efsVolume: Volume = {
        //     name: "grpc-volume",
        //     efsVolumeConfiguration: {
        //         fileSystemId: environmentInfo.efsInfo.fileSystemId,
        //         authorizationConfig: {
        //             accessPointId: environmentInfo.efsInfo.fdrAccessPointId,
        //         },
        //         transitEncryption: "ENABLED",
        //     },
        // };
        // fargateService.taskDefinition.addVolume(efsVolume);

        // fargateService.taskDefinition.findContainer(CONTAINER_NAME)?.addMountPoints({
        //     containerPath: "/opt/var/data",
        //     sourceVolume: efsVolume.name,
        //     readOnly: false,
        // });

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

        const lbResponseTimeAlarm = new Alarm(this, "grpc-lb-target-respones-time-alarm", {
            alarmName: `${id} Load Balancer Target Response Time Threshold`,
            metric: fargateService.loadBalancer.metrics.targetResponseTime(),
            threshold: 1,
            evaluationPeriods: 5,
        });
        lbResponseTimeAlarm.addAlarmAction(new actions.SnsAction(snsTopic));

        const lbUnhealthyHostCountAlarm = new Alarm(this, "grpc-lb-unhealthy-host-count-alarm", {
            alarmName: `${id} Load Balancer Unhealthy Host Count Alarm`,
            metric: fargateService.targetGroup.metrics.unhealthyHostCount(),
            threshold: 1,
            evaluationPeriods: 5,
        });
        lbUnhealthyHostCountAlarm.addAlarmAction(new actions.SnsAction(snsTopic));

        const lb500CountAlarm = new Alarm(this, "grpc-lb-5XX-count", {
            alarmName: `${id} Load Balancer 500 Error Alarm`,
            metric: fargateService.loadBalancer.metrics.httpCodeElb(HttpCodeElb.ELB_5XX_COUNT),
            threshold: 2,
            evaluationPeriods: 5,
        });
        lb500CountAlarm.addAlarmAction(new actions.SnsAction(snsTopic));
    }
}

function getServiceDomainName(environmentType: EnvironmentType, environmentInfo: EnvironmentInfo) {
    if (environmentType === EnvironmentType.Prod) {
        return "grpc" + "." + environmentInfo.route53Info.hostedZoneName;
    }
    return "grpc" + "-" + environmentType.toLowerCase() + "." + environmentInfo.route53Info.hostedZoneName;
}
