import { EnvironmentType } from "@fern-fern/fern-cloud-sdk/api";
import { Environment, Stack, StackProps, Token } from "aws-cdk-lib";
import { IVpc, Peer, Port, SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { CfnReplicationGroup, CfnSubnetGroup } from "aws-cdk-lib/aws-elasticache";
import { Construct } from "constructs";

interface ElastiCacheStackProps extends StackProps {
    readonly cacheName: string;
    readonly IVpc: IVpc;
    readonly numCacheShards: number;
    readonly numCacheReplicasPerShard: number | undefined;
    readonly clusterMode: "enabled" | "disabled";
    readonly cacheNodeType: string;
    readonly envType: EnvironmentType;
    readonly env?: Environment;
}

export class ElastiCacheStack extends Stack {
    public readonly replicationGroup: CfnReplicationGroup;
    public readonly subnetGroup: CfnSubnetGroup;
    public readonly securityGroup: SecurityGroup;
    public readonly redisEndpointAddress: string;
    public readonly redisEndpointPort: string;

    constructor(scope: Construct, id: string, props: ElastiCacheStackProps) {
        super(scope, id, props);

        const envPrefix = props.envType + "-";

        const elastiCacheSecurityGroupName = envPrefix + props.cacheName + "SecurityGroup";
        this.securityGroup = new SecurityGroup(this, elastiCacheSecurityGroupName, {
            vpc: props.IVpc,
            allowAllOutbound: true,
            description: `${elastiCacheSecurityGroupName} CDK`,
        });

        const elastiCacheSubnetGroupName = envPrefix + props.cacheName + "SubnetGroup";
        this.subnetGroup = new CfnSubnetGroup(this, elastiCacheSubnetGroupName, {
            description: `${elastiCacheSubnetGroupName} CDK`,
            cacheSubnetGroupName: elastiCacheSubnetGroupName,
            subnetIds: props.IVpc.privateSubnets.map(({ subnetId }) => subnetId),
        });

        const elastiCacheReplicationGroupName = envPrefix + props.cacheName + "ReplicationGroup";
        this.replicationGroup = new CfnReplicationGroup(this, elastiCacheReplicationGroupName, {
            replicationGroupDescription: `Replication Group for the ${elastiCacheReplicationGroupName} ElastiCache stack`,
            automaticFailoverEnabled: true,
            autoMinorVersionUpgrade: true,
            engine: "redis",
            engineVersion: "7.0",
            cacheParameterGroupName: "default.redis7.cluster.on",
            cacheNodeType: props.cacheNodeType,
            numNodeGroups: props.numCacheShards,
            replicasPerNodeGroup: props.numCacheReplicasPerShard,
            clusterMode: props.clusterMode,
            cacheSubnetGroupName: this.subnetGroup.ref,
            securityGroupIds: [this.securityGroup.securityGroupId],
        });

        this.replicationGroup.cfnOptions.updatePolicy = {
            useOnlineResharding: true,
        };

        this.replicationGroup.addDependency(this.subnetGroup);

        this.redisEndpointAddress = this.replicationGroup.attrConfigurationEndPointAddress;
        this.redisEndpointPort = this.replicationGroup.attrConfigurationEndPointPort;

        this.securityGroup.addIngressRule(
            Peer.anyIpv4(),
            Port.tcp(Token.asNumber(this.redisEndpointPort)),
            "Redis Port Ingress rule",
        );
    }
}
