import {
  EnvironmentInfo,
  EnvironmentType,
} from "@fern-fern/fern-cloud-sdk/api";
import {
  CfnOutput,
  Duration,
  Environment,
  RemovalPolicy,
  Stack,
  StackProps,
  Token,
} from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import { Alarm } from "aws-cdk-lib/aws-cloudwatch";
import * as actions from "aws-cdk-lib/aws-cloudwatch-actions";
import { IVpc, Peer, Port, SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";
import {
  Cluster,
  ContainerImage,
  LogDriver,
  Volume,
} from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import {
  CfnReplicationGroup,
  CfnSubnetGroup,
} from "aws-cdk-lib/aws-elasticache";
import {
  ApplicationProtocol,
  HttpCodeElb,
} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { PolicyStatement, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import * as route53 from "aws-cdk-lib/aws-route53";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import { LoadBalancerTarget } from "aws-cdk-lib/aws-route53-targets";
import { BlockPublicAccess, Bucket, HttpMethods } from "aws-cdk-lib/aws-s3";
import { PrivateDnsNamespace } from "aws-cdk-lib/aws-servicediscovery";
import * as sns from "aws-cdk-lib/aws-sns";
import { EmailSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { Construct } from "constructs";

const CONTAINER_NAME = "fern-definition-registry";
const SERVICE_NAME = "fdr";

interface ElastiCacheProps {
  readonly cacheName: string;
  readonly IVpc: IVpc;
  readonly numCacheShards: number;
  readonly numCacheReplicasPerShard: number | undefined;
  readonly clusterMode: "enabled" | "disabled";
  readonly cacheNodeType: string;
  readonly envType: EnvironmentType;
  readonly env?: Environment;
  readonly ingressSecurityGroup?: SecurityGroup;
}

interface FdrStackOptions {
  redis: boolean;
  redisClusteringModeEnabled: boolean;
  maxTaskCount: number;
  desiredTaskCount: number;
  cpu: number;
  memory: number;
  cacheName: string;
  cacheNodeType: string;
}

export class FdrDeployStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    version: string,
    environmentType: EnvironmentType,
    environmentInfo: EnvironmentInfo,
    options: FdrStackOptions,
    props?: StackProps
  ) {
    super(scope, id, props);

    const vpc = Vpc.fromLookup(this, "vpc", {
      vpcId: environmentInfo.vpcId,
    });

    const efsSg = SecurityGroup.fromLookupByName(
      this,
      "efs-sg",
      environmentInfo.efsInfo.securityGroupName,
      vpc
    );

    const fdrSg = new SecurityGroup(this, "fdr-sg", {
      securityGroupName: `fdr-${environmentType.toLowerCase()}`,
      vpc,
      allowAllOutbound: true,
    });
    fdrSg.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(443),
      "allow HTTPS traffic from anywhere"
    );
    fdrSg.addIngressRule(Peer.ipv4(environmentInfo.vpcIpv4Cidr), Port.allTcp());

    const cluster = Cluster.fromClusterAttributes(this, "cluster", {
      clusterName: environmentInfo.ecsInfo.clusterName,
      vpc,
      securityGroups: [],
    });

    const logGroup = LogGroup.fromLogGroupName(
      this,
      "log-group",
      environmentInfo.logGroupInfo.logGroupName
    );

    const certificate = Certificate.fromCertificateArn(
      this,
      "ceritificate",
      environmentInfo.route53Info.certificateArn
    );

    const hostedZone = HostedZone.fromHostedZoneAttributes(this, "zoneId", {
      hostedZoneId: environmentInfo.route53Info.hostedZoneId,
      zoneName: environmentInfo.route53Info.hostedZoneName,
    });

    const snsTopic = new sns.Topic(this, "fdr-sns-topic", {
      topicName: id,
    });
    snsTopic.addSubscription(
      new EmailSubscription("support@buildwithfern.com")
    );

    const privateApiDefinitionSourceBucket = new Bucket(
      this,
      "fdr-api-definition-source-files",
      {
        bucketName: `fdr-${environmentType.toLowerCase()}-api-definition-source-files`,
        removalPolicy: RemovalPolicy.RETAIN,
        cors: [
          {
            allowedMethods: [
              HttpMethods.GET,
              HttpMethods.POST,
              HttpMethods.PUT,
            ],
            allowedOrigins: ["*"],
            allowedHeaders: ["*"],
          },
        ],
        versioned: true,
      }
    );

    const privateDocsBucket = new Bucket(this, "fdr-docs-files", {
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

    const publicDocsBucket = new Bucket(this, "fdr-docs-files-public", {
      bucketName: `fdr-${environmentType.toLowerCase()}-docs-files-public`,
      removalPolicy: RemovalPolicy.RETAIN,
      cors: [
        {
          allowedMethods: [HttpMethods.GET, HttpMethods.POST, HttpMethods.PUT],
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
        },
      ],
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      versioned: true,
    });
    publicDocsBucket.grantPublicAccess();

    const publicDocsFilesDomainName = getPublicBucketDomainName(
      environmentType,
      environmentInfo
    );
    const publicDocsFilesDistribution = new cloudfront.Distribution(
      this,
      "PublicDocsFilesDistribution",
      {
        defaultBehavior: {
          origin: new origins.S3Origin(publicDocsBucket),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        },
        domainNames: [publicDocsFilesDomainName],
        certificate,
      }
    );

    // for revalidate-all and finish-register workflow
    const dbDocsDefinitionBucket = new Bucket(
      this,
      "fdr-docs-definitions-public",
      {
        bucketName: `fdr-${environmentType.toLowerCase()}-docs-definitions-public`,
        cors: [
          {
            allowedMethods: [
              HttpMethods.GET,
              HttpMethods.POST,
              HttpMethods.PUT,
            ],
            allowedOrigins: ["*"],
            allowedHeaders: ["*"],
          },
        ],
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        versioned: true,
      }
    );

    const keyGroupId = getEnvironmentVariableOrThrow("CLOUDFRONT_KEY_GROUP_ID");
    const dbDocsKeyGroup = cloudfront.KeyGroup.fromKeyGroupId(
      this,
      "DbDocsKeyGroup",
      keyGroupId
    );

    const dbDocsDefinitionDomainName =
      environmentType === "PROD"
        ? "docs-definitions.buildwithfern.com"
        : "docs-definitions-dev2.buildwithfern.com";
    const dbDocsDefinitionDistribution = new cloudfront.Distribution(
      this,
      "DbDocsDefinitionDistribution",
      {
        defaultBehavior: {
          origin: new origins.S3Origin(dbDocsDefinitionBucket),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          trustedKeyGroups: [dbDocsKeyGroup],
        },
        domainNames: [dbDocsDefinitionDomainName],
        certificate,
      }
    );

    const dbDocsDefinitionBucketPolicy = new PolicyStatement({
      actions: ["s3:GetObject"],
      resources: [dbDocsDefinitionBucket.arnForObjects("*")],
      principals: [new ServicePrincipal("cloudfront.amazonaws.com")],
      conditions: {
        StringEquals: {
          "AWS:SourceArn": `arn:aws:cloudfront::${this.account}:distribution/${dbDocsDefinitionDistribution.distributionId}`,
        },
      },
    });
    dbDocsDefinitionBucket.addToResourcePolicy(dbDocsDefinitionBucketPolicy);

    new route53.ARecord(this, "PublicDocsFilesRecord", {
      recordName: publicDocsFilesDomainName,
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(publicDocsFilesDistribution)
      ),
      zone: hostedZone,
    });

    new route53.ARecord(this, "DbDocsDefinitionRecord", {
      recordName: dbDocsDefinitionDomainName,
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(dbDocsDefinitionDistribution)
      ),
      zone: hostedZone,
    });

    const fernDocsCacheEndpoint = this.constructElastiCacheInstance(this, {
      cacheName: options.cacheName,
      IVpc: vpc,
      numCacheShards: 1,
      numCacheReplicasPerShard: 0,
      clusterMode: "enabled",
      cacheNodeType: options.cacheNodeType,
      envType: environmentType,
      env: props?.env,
      ingressSecurityGroup: fdrSg,
    });

    const cloudmapNamespaceName =
      environmentInfo.cloudMapNamespaceInfo.namespaceName;
    const cloudMapNamespace =
      PrivateDnsNamespace.fromPrivateDnsNamespaceAttributes(
        this,
        "private-cloudmap",
        {
          namespaceArn: environmentInfo.cloudMapNamespaceInfo.namespaceArn,
          namespaceId: environmentInfo.cloudMapNamespaceInfo.namespaceId,
          namespaceName: cloudmapNamespaceName,
        }
      );

    const fargateService = new ApplicationLoadBalancedFargateService(
      this,
      SERVICE_NAME,
      {
        serviceName: SERVICE_NAME,
        cluster,
        cpu: options.cpu,
        memoryLimitMiB: options.memory,
        desiredCount: options.desiredTaskCount,
        securityGroups: [fdrSg, efsSg],
        taskImageOptions: {
          image: ContainerImage.fromTarball(
            `../../docker/build/tar/fern-definition-registry:${version}.tar`
          ),
          environment: {
            VENUS_URL: `http://venus.${cloudmapNamespaceName}:8080/`,
            AWS_ACCESS_KEY_ID:
              getEnvironmentVariableOrThrow("AWS_ACCESS_KEY_ID"),
            AWS_SECRET_ACCESS_KEY: getEnvironmentVariableOrThrow(
              "AWS_SECRET_ACCESS_KEY"
            ),
            PUBLIC_S3_BUCKET_NAME: publicDocsBucket.bucketName,
            PUBLIC_S3_BUCKET_REGION: publicDocsBucket.stack.region,
            PRIVATE_S3_BUCKET_NAME: privateDocsBucket.bucketName,
            PRIVATE_S3_BUCKET_REGION: privateDocsBucket.stack.region,
            DB_DOCS_DEFINITION_BUCKET_NAME: dbDocsDefinitionBucket.bucketName,
            DB_DOCS_DEFINITION_BUCKET_REGION:
              dbDocsDefinitionBucket.stack.region,
            API_DEFINITION_SOURCE_BUCKET_NAME:
              privateApiDefinitionSourceBucket.bucketName,
            API_DEFINITION_SOURCE_BUCKET_REGION:
              privateApiDefinitionSourceBucket.stack.region,
            DOMAIN_SUFFIX: getDomainSuffix(environmentType),
            ALGOLIA_APP_ID: getEnvironmentVariableOrThrow("ALGOLIA_APP_ID"),
            ALGOLIA_ADMIN_API_KEY: getEnvironmentVariableOrThrow(
              "ALGOLIA_ADMIN_API_KEY"
            ),
            ALGOLIA_SEARCH_INDEX: getEnvironmentVariableOrThrow(
              "ALGOLIA_SEARCH_INDEX"
            ),
            ALGOLIA_SEARCH_API_KEY: getEnvironmentVariableOrThrow(
              "ALGOLIA_SEARCH_API_KEY"
            ),
            ALGOLIA_SEARCH_V2_DOMAINS: getEnvironmentVariableOrThrow(
              "ALGOLIA_SEARCH_V2_DOMAINS"
            ),
            SLACK_TOKEN: getEnvironmentVariableOrThrow(
              "FERNIE_SLACK_APP_TOKEN"
            ),
            LOG_LEVEL: getLogLevel(environmentType),
            DOCS_CACHE_ENDPOINT: fernDocsCacheEndpoint,
            ENABLE_CUSTOMER_NOTIFICATIONS: (
              environmentType === "PROD"
            ).toString(),
            REDIS_ENABLED: options.redis.toString(),
            REDIS_CLUSTERING_MODE_ENABLED:
              options.redisClusteringModeEnabled.toString(),
            APPLICATION_ENVIRONMENT: getEnvironmentVariableOrThrow(
              "APPLICATION_ENVIRONMENT"
            ),
            PUBLIC_DOCS_CDN_URL:
              environmentType === "DEV2"
                ? "https://files-dev2.buildwithfern.com"
                : "https://files.buildwithfern.com",
            NODE_ENV: "production",
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
      }
    );
    if (options.redis) {
      const scalableTaskCount = fargateService.service.autoScaleTaskCount({
        maxCapacity: options.maxTaskCount,
        minCapacity: options.desiredTaskCount,
      });
      scalableTaskCount.scaleOnRequestCount("RequestCountScaling", {
        targetGroup: fargateService.targetGroup,
        requestsPerTarget: 1000,
      });
    }

    new ARecord(this, "api-domain", {
      zone: hostedZone,
      target: RecordTarget.fromAlias(
        new LoadBalancerTarget(fargateService.loadBalancer)
      ),
      recordName:
        environmentType === "PROD"
          ? "api"
          : `api-${environmentType.toLowerCase()}`,
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

    fargateService.taskDefinition
      .findContainer(CONTAINER_NAME)
      ?.addMountPoints({
        containerPath: "/opt/var/data",
        sourceVolume: efsVolume.name,
        readOnly: false,
      });

    fargateService.targetGroup.setAttribute(
      "deregistration_delay.timeout_seconds",
      "30"
    );

    fargateService.loadBalancer.setAttribute(
      "idle_timeout.timeout_seconds",
      "900"
    );

    fargateService.targetGroup.configureHealthCheck({
      healthyHttpCodes: "200",
      path: "/health",
      port: "8080",
      timeout: Duration.seconds(120),
      interval: Duration.seconds(150),
      unhealthyThresholdCount: 5,
    });

    const lbResponseTimeAlarm = new Alarm(
      this,
      "fdr-lb-target-respones-time-alarm",
      {
        alarmName: `${id} Load Balancer Target Response Time Threshold`,
        metric: fargateService.loadBalancer.metrics.targetResponseTime(),
        threshold: 1,
        evaluationPeriods: 5,
      }
    );
    lbResponseTimeAlarm.addAlarmAction(new actions.SnsAction(snsTopic));

    const lbUnhealthyHostCountAlarm = new Alarm(
      this,
      "fdr-lb-unhealthy-host-count-alarm",
      {
        alarmName: `${id} Load Balancer Unhealthy Host Count Alarm`,
        metric: fargateService.targetGroup.metrics.unhealthyHostCount(),
        threshold: 1,
        evaluationPeriods: 5,
      }
    );
    lbUnhealthyHostCountAlarm.addAlarmAction(new actions.SnsAction(snsTopic));

    const lb500CountAlarm = new Alarm(this, "fdr-lb-5XX-count", {
      alarmName: `${id} Load Balancer 500 Error Alarm`,
      metric: fargateService.loadBalancer.metrics.httpCodeElb(
        HttpCodeElb.ELB_5XX_COUNT
      ),
      threshold: 2,
      evaluationPeriods: 5,
    });
    lb500CountAlarm.addAlarmAction(new actions.SnsAction(snsTopic));
  }

  private constructElastiCacheInstance(
    scope: Construct,
    props: ElastiCacheProps
  ): string {
    const envPrefix = props.envType + "-";

    const cacheSecurityGroupName =
      envPrefix + props.cacheName + "SecurityGroup";
    const cacheSecurityGroup = new SecurityGroup(
      scope,
      cacheSecurityGroupName,
      {
        vpc: props.IVpc,
        allowAllOutbound: true,
        description: `${cacheSecurityGroupName} CDK`,
      }
    );

    const cacheSubnetGroupName = envPrefix + props.cacheName + "SubnetGroup";
    const cacheSubnetGroup = new CfnSubnetGroup(this, cacheSubnetGroupName, {
      description: `${cacheSubnetGroupName} CDK`,
      cacheSubnetGroupName,
      subnetIds: props.IVpc.publicSubnets.map(({ subnetId }) => subnetId),
    });

    const cacheReplicationGroupName =
      envPrefix + props.cacheName + "ReplicationGroup";
    const cacheReplicationGroup = new CfnReplicationGroup(
      this,
      cacheReplicationGroupName,
      {
        replicationGroupId: cacheReplicationGroupName,
        replicationGroupDescription: `Replication Group for the ${cacheReplicationGroupName} ElastiCache stack`,
        automaticFailoverEnabled: true,
        autoMinorVersionUpgrade: true,
        engine: "redis",
        engineVersion: "7.0",
        cacheParameterGroupName: "default.redis7.cluster.on",
        cacheNodeType: props.cacheNodeType,
        numNodeGroups: props.numCacheShards,
        replicasPerNodeGroup: props.numCacheReplicasPerShard,
        clusterMode: props.clusterMode,
        cacheSubnetGroupName: cacheSubnetGroup.ref,
        securityGroupIds: [cacheSecurityGroup.securityGroupId],
      }
    );

    cacheReplicationGroup.cfnOptions.updatePolicy = {
      useOnlineResharding: true,
    };

    cacheReplicationGroup.addDependency(cacheSubnetGroup);

    const cacheEndpointAddress =
      cacheReplicationGroup.attrConfigurationEndPointAddress;
    const cacheEndpointPort =
      cacheReplicationGroup.attrConfigurationEndPointPort;

    new CfnOutput(this, `${props.cacheName}Host`, {
      value: cacheEndpointAddress,
    });
    new CfnOutput(this, `${props.cacheName}Port`, { value: cacheEndpointPort });

    cacheSecurityGroup.addIngressRule(
      props.ingressSecurityGroup || Peer.anyIpv4(),
      Port.tcp(Token.asNumber(cacheEndpointPort)),
      "Redis Port Ingress rule"
    );

    return `${cacheEndpointAddress}:${cacheEndpointPort}`;
  }
}

function getServiceDomainName(
  environmentType: EnvironmentType,
  environmentInfo: EnvironmentInfo
) {
  if (environmentType === EnvironmentType.Prod) {
    return "registry" + "." + environmentInfo.route53Info.hostedZoneName;
  }
  return (
    "registry" +
    "-" +
    environmentType.toLowerCase() +
    "." +
    environmentInfo.route53Info.hostedZoneName
  );
}

function getPublicBucketDomainName(
  environmentType: EnvironmentType,
  environmentInfo: EnvironmentInfo
) {
  if (environmentType === EnvironmentType.Prod) {
    return "files" + "." + environmentInfo.route53Info.hostedZoneName;
  }
  return (
    "files" +
    "-" +
    environmentType.toLowerCase() +
    "." +
    environmentInfo.route53Info.hostedZoneName
  );
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
