import * as cdk from "aws-cdk-lib";
import { aws_elasticache as ElastiCache } from "aws-cdk-lib";
import * as EC2 from "aws-cdk-lib/aws-ec2";
import { Peer, Port, SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { CfnReplicationGroup } from "aws-cdk-lib/aws-elasticache";
import { Construct } from "constructs";

interface ElastiCacheStackProps extends cdk.StackProps {
    cacheName: string;
    IVpc: EC2.IVpc;
    numCacheShards: number;
    numCacheReplicasPerShard: number;
    clusterMode: "enabled" | "disabled";
    cacheNodeType: string;
}

export class ElastiCacheStack extends cdk.Stack {
    private vpc: EC2.IVpc;
    private elastiCacheSubnetIds: string[];
    private elastiCacheReplicationGroup: CfnReplicationGroup;
    public elastiCacheEndpointAddress: string;

    constructor(scope: Construct, id: string, props: ElastiCacheStackProps) {
        super(scope, id, props);
        const elastiCacheRedisPort = 6379;

        this.vpc = props.IVpc;

        // extensible for any future cases w/ multiple private subnets
        for (const subnet of this.vpc.privateSubnets) {
            //console.log(`Private Subnet Id: ${subnet.subnetId}`);
            this.elastiCacheSubnetIds.push(subnet.subnetId);
        }

        const elastiCacheSubnetGroupName = props.cacheName + " Subnet Group";
        const elastiCacheSubnetGroup = new ElastiCache.CfnSubnetGroup(this, elastiCacheSubnetGroupName.toLowerCase(), {
            description: `${elastiCacheSubnetGroupName} CDK`,
            cacheSubnetGroupName: elastiCacheSubnetGroupName.toLowerCase(),
            subnetIds: this.elastiCacheSubnetIds,
        });

        const elastiCacheSecurityGroupName = props.cacheName + " Security Group";
        const elastiCacheSecurityGroup = new SecurityGroup(this, elastiCacheSecurityGroupName.toLowerCase(), {
            vpc: this.vpc,
            allowAllOutbound: true,
            description: `${elastiCacheSecurityGroupName} CDK`,
            securityGroupName: elastiCacheSecurityGroupName.toLowerCase(),
        });

        elastiCacheSecurityGroup.addIngressRule(
            Peer.anyIpv4(),
            Port.tcp(elastiCacheRedisPort),
            "ElastiCache for Redis Port",
        );

        const elastiCacheReplicationGroupName = props.cacheName + " Replication Group";
        this.elastiCacheReplicationGroup = new ElastiCache.CfnReplicationGroup(
            this,
            elastiCacheReplicationGroupName.toLowerCase(),
            {
                replicationGroupDescription: `Replication Group for the ${elastiCacheReplicationGroupName} ElastiCache stack`,
                automaticFailoverEnabled: true,
                autoMinorVersionUpgrade: true,
                engine: "redis",
                cacheNodeType: props.cacheNodeType,
                numNodeGroups: props.numCacheShards,
                replicasPerNodeGroup: props.numCacheReplicasPerShard,
                clusterMode: props.clusterMode,
                cacheSubnetGroupName: elastiCacheSubnetGroup.ref,
                securityGroupIds: [elastiCacheSecurityGroup.securityGroupId],
            },
        );
        this.elastiCacheReplicationGroup.addDependency(elastiCacheSubnetGroup);

        this.elastiCacheEndpointAddress = this.elastiCacheReplicationGroup.attrPrimaryEndPointAddress;
    }
}
